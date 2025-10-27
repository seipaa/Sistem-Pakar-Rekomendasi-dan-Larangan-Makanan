export type SymptomInput = { id: string; user_cf: number };

export type RulesJson = {
  diseases: { id: string; name: string }[];
  symptoms: { id: string; name: string }[];
  foods: { id: string; name: string }[];
  diagnosis_rules: {
    id: string;
    then: string;
    evidence: { symptom_id: string; cf_expert: number }[];
  }[];
  category_rules: {
    id: string;
    if: string[];
    then: { add_fact: string[] };
    cf_rule: number;
  }[];
  food_rules: {
    id: string;
    if: string[];
    then: {
      recommend_food_ids?: string[];
      prohibit_food_ids?: string[];
    };
    cf_rule: number;
  }[];
};

export type EngineInput = {
  symptoms: SymptomInput[];
  cf_threshold_disease?: number;
  fruits_only?: boolean;
  conflict_policy?: "safer_wins" | "higher_cf";
};

export type DiseaseScore = { disease_id: string; name: string; cf: number };
export type FoodScore = { food_id: string; name: string; cf: number };
export type EngineOutput = {
  diseases: DiseaseScore[];
  recommend: FoodScore[];
  prohibit: FoodScore[];
  facts: string[];
};

export function combineCF(values: number[]): number {
  let c = 0;
  for (const v of values) {
    if (v > 0) c = c + v * (1 - c);
  }
  return c;
}

export function diagnose(rules: RulesJson, input: EngineInput): Record<string, number> {
  const userMap = new Map<string, number>(input.symptoms.map(s => [s.id, s.user_cf]));
  const scores: Record<string, number> = {};

  for (const dr of rules.diagnosis_rules) {
    const parts: number[] = [];
    for (const ev of dr.evidence) {
      const u = userMap.get(ev.symptom_id) ?? 0;
      if (u > 0 && ev.cf_expert > 0) {
        parts.push(u * ev.cf_expert);
      }
    }
    scores[dr.then] = combineCF(parts);
  }
  return scores;
}

function hasAllFacts(requirements: string[], facts: Set<string>): boolean {
  for (const r of requirements) if (!facts.has(r)) return false;
  return true;
}

function indexById<T extends { id: string }>(arr: T[]): Map<string, T> {
  return new Map(arr.map(x => [x.id, x]));
}

function isFruit(name: string): boolean {
  const n = name.toLowerCase();
  return [
    "anggur","melon","pepaya","semangka","apel","nanas","alpukat","pisang","jeruk"
  ].some(k => n.includes(k));
}

// Engine Utama
export function runEngine(rules: RulesJson, input: EngineInput): EngineOutput {
  const threshold = input.cf_threshold_disease ?? 0.0;
  const conflictPolicy = input.conflict_policy ?? "safer_wins";

  const diseaseIndex = indexById(rules.diseases);
  const foodIndex = indexById(rules.foods);

  // Fase A: Diagnosis (Gejala -> Penyakit)
  const diseaseCF = diagnose(rules, input);

  // Fakta awal: penyakit dengan CF >= threshold
  const facts = new Set<string>();
  for (const [pid, cf] of Object.entries(diseaseCF)) {
    if (cf >= threshold) facts.add(`penyakit:${pid}`);
  }

  // Fase B: Penyakit -> Kategori Diet (sekuensial)
  // Penambahan fakta berjalan sampai tidak ada fakta baru (forward chaining)
  let added = true;
  while (added) {
    added = false;
    for (const cr of rules.category_rules) {
      if (!hasAllFacts(cr.if, facts)) continue;
      for (const f of cr.then.add_fact) {
        if (!facts.has(f)) {
          facts.add(f);
          added = true;
        }
      }
    }
  }

  // Fase C: Fakta -> Rekomendasi / Larangan (paralel)
  const recoParts: Record<string, number[]> = {};   // food_id -> list CF kandidat
  const blockParts: Record<string, number[]> = {};  // food_id -> list CF kandidat

  // base CF: jika rule 'if' berisi penyakit, gunakan max CF penyakit yg match; jika hanya kategori, base=1.0
  function baseCF(ruleIf: string[]): number {
    const involvedDiseaseIds = ruleIf
      .filter(f => f.startsWith("penyakit:"))
      .map(f => f.replace("penyakit:", ""));
    if (involvedDiseaseIds.length === 0) return 1.0;
    return Math.max(...involvedDiseaseIds.map(pid => diseaseCF[pid] ?? 0));
  }

  for (const fr of rules.food_rules) {
    if (!hasAllFacts(fr.if, facts)) continue;
    const b = baseCF(fr.if);
    const unit = Math.max(0, b * fr.cf_rule); // CF kandidat item = base * cf_rule

    if (fr.then.recommend_food_ids) {
      for (const id of fr.then.recommend_food_ids) {
        (recoParts[id] ||= []).push(unit);
      }
    }
    if (fr.then.prohibit_food_ids) {
      for (const id of fr.then.prohibit_food_ids) {
        (blockParts[id] ||= []).push(unit);
      }
    }
  }

  // Gabungkan paralel per item
  const recoCF: Record<string, number> = {};
  const blockCF: Record<string, number> = {};
  for (const [id, arr] of Object.entries(recoParts)) recoCF[id] = combineCF(arr);
  for (const [id, arr] of Object.entries(blockParts)) blockCF[id] = combineCF(arr);

  // Resolusi konflik (jika ada item muncul di kedua sisi)
  const allFoodIds = new Set<string>([...Object.keys(recoCF), ...Object.keys(blockCF)]);
  for (const id of allFoodIds) {
    const r = recoCF[id] ?? 0;
    const b = blockCF[id] ?? 0;
    if (r > 0 && b > 0) {
      if (conflictPolicy === "safer_wins") {
        recoCF[id] = 0;
      } else {
        // pilih yang lebih tinggi
        if (r >= b) blockCF[id] = 0; else recoCF[id] = 0;
      }
    }
  }

  const asFoodScore = (id: string, cf: number): FoodScore => ({
    food_id: id,
    name: foodIndex.get(id)?.name ?? id,
    cf
  });

  let recommend = Object.entries(recoCF)
    .filter(([, cf]) => cf > 0)
    .map(([id, cf]) => asFoodScore(id, cf));

  let prohibit = Object.entries(blockCF)
    .filter(([, cf]) => cf > 0)
    .map(([id, cf]) => asFoodScore(id, cf));

  if (input.fruits_only) {
    recommend = recommend.filter(x => isFruit(x.name));
    prohibit = prohibit.filter(x => isFruit(x.name));
  }

  recommend.sort((a, b) => b.cf - a.cf);
  prohibit.sort((a, b) => b.cf - a.cf);

  const diseases: DiseaseScore[] = Object.entries(diseaseCF)
    .map(([pid, cf]) => ({
      disease_id: pid,
      name: diseaseIndex.get(pid)?.name ?? pid,
      cf
    }))
    .sort((a, b) => b.cf - a.cf);

  return {
    diseases,
    recommend,
    prohibit,
    facts: Array.from(facts)
  };
}