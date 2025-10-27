export type SymptomInput = { id: string; user_cf: number };

export type RulesJson = {
  diseases: { id: string; name: string }[];
  symptoms: { id: string; name: string }[];
  foods: { id: string; name: string; tags?: string[] }[];
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

// Utility Functions
export function combineCF(values: number[]): number {
  let c = 0;
  for (const v of values.sort((a, b) => b - a)) {
    if (v > 0) c = c + v * (1 - c);
  }
  return Math.max(0, Math.min(1, c));
}

function hasAllFacts(requirements: string[], facts: Set<string>): boolean {
  for (const r of requirements) if (!facts.has(r)) return false;
  return true;
}

function indexById<T extends { id: string }>(arr: T[]): Map<string, T> {
  return new Map(arr.map(x => [x.id, x]));
}

function isFruit(foodId: string, foodIndex: Map<string, any>): boolean {
  const f = foodIndex.get(foodId);
  if (!f) return false;
  if (Array.isArray(f.tags) && f.tags.includes("fruit")) return true;
  const n = (f.name || "").toLowerCase();
  return ["anggur","melon","pepaya","semangka","apel","nanas","alpukat","pisang","jeruk"]
    .some(k => n.includes(k));
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Diagnosis Stage
export function diagnose(rules: RulesJson, input: EngineInput): Record<string, number> {
  const userMap = new Map<string, number>(input.symptoms.map(s => [s.id, s.user_cf]));
  const scores: Record<string, number> = {};

  for (const dr of rules.diagnosis_rules) {
    const parts: number[] = [];
    for (const ev of dr.evidence) {
      const u = userMap.get(ev.symptom_id) ?? 0;
      if (u > 0 && ev.cf_expert > 0) parts.push(u * ev.cf_expert);
    }
    parts.sort((a, b) => b - a);
    scores[dr.then] = combineCF(parts);
  }
  return scores;
}
// Main Engine
export function runEngine(rules: RulesJson, input: EngineInput): EngineOutput {
  const threshold = input.cf_threshold_disease ?? 0.0;
  const conflictPolicy = input.conflict_policy ?? "safer_wins";
  const diseaseIndex = indexById(rules.diseases);
  const foodIndex = indexById(rules.foods);

  //Diagnosis
  const diseaseCF = diagnose(rules, input);

  //Penyakit -> Kategori Diet
  const facts = new Set<string>();
  const factWeight: Record<string, number> = {};
  for (const [pid, cf] of Object.entries(diseaseCF)) {
    if (cf >= threshold) {
      const tag = `penyakit:${pid}`;
      facts.add(tag);
      factWeight[tag] = cf;
    }
  }

  let added = true;
  while (added) {
    added = false;
    for (const cr of rules.category_rules) {
      if (!hasAllFacts(cr.if, facts)) continue;
      const base = Math.max(...cr.if.map(f => factWeight[f] ?? 0));
      for (const f of cr.then.add_fact) {
        if (!facts.has(f)) {
          facts.add(f);
          factWeight[f] = clamp01(base * cr.cf_rule);
          added = true;
        }
      }
    }
  }

  //Fakta -> Makanan
  const recoParts: Record<string, number[]> = {};
  const blockParts: Record<string, number[]> = {};

  const baseCF = (ruleIf: string[]) => {
    const vals = ruleIf.map(f => factWeight[f] ?? 0);
    return vals.length > 0 ? Math.max(...vals) : 0;
  };

  for (const fr of rules.food_rules) {
    if (!hasAllFacts(fr.if, facts)) continue;
    const unit = clamp01(baseCF(fr.if) * fr.cf_rule);

    for (const id of fr.then.recommend_food_ids ?? [])
      (recoParts[id] ||= []).push(unit);
    for (const id of fr.then.prohibit_food_ids ?? [])
      (blockParts[id] ||= []).push(unit);
  }

  // Agregasi paralel (pakai MAX)
  const recoCF: Record<string, number> = {};
  const blockCF: Record<string, number> = {};
  for (const [id, arr] of Object.entries(recoParts))
    recoCF[id] = clamp01(Math.max(...arr));
  for (const [id, arr] of Object.entries(blockParts))
    blockCF[id] = clamp01(Math.max(...arr));

  //Resolusi Konflik
  const allFoodIds = new Set<string>([...Object.keys(recoCF), ...Object.keys(blockCF)]);
  for (const id of allFoodIds) {
    const r = recoCF[id] ?? 0;
    const b = blockCF[id] ?? 0;
    if (r > 0 && b > 0) {
      if (conflictPolicy === "safer_wins") recoCF[id] = 0;
      else if (r >= b) blockCF[id] = 0;
      else recoCF[id] = 0;
    }
  }

  //Format Output
  const asFoodScore = (id: string, cf: number): FoodScore => ({
    food_id: id,
    name: foodIndex.get(id)?.name ?? id,
    cf: parseFloat(cf.toFixed(3))
  });

  let recommend = Object.entries(recoCF)
    .filter(([, cf]) => cf > 0)
    .map(([id, cf]) => asFoodScore(id, cf));

  let prohibit = Object.entries(blockCF)
    .filter(([, cf]) => cf > 0)
    .map(([id, cf]) => asFoodScore(id, cf));

  if (input.fruits_only) {
    recommend = recommend.filter(x => isFruit(x.food_id, foodIndex));
    prohibit = prohibit.filter(x => isFruit(x.food_id, foodIndex));
  }

  recommend.sort((a, b) => b.cf - a.cf);
  prohibit.sort((a, b) => b.cf - a.cf);

  const diseases: DiseaseScore[] = Object.entries(diseaseCF)
    .map(([pid, cf]) => ({
      disease_id: pid,
      name: diseaseIndex.get(pid)?.name ?? pid,
      cf: parseFloat(cf.toFixed(3))
    }))
    .sort((a, b) => b.cf - a.cf);

  return { diseases, recommend, prohibit, facts: Array.from(facts) };
}

export function validateRules(rules: RulesJson): string[] {
  const diseaseIds = new Set(rules.diseases.map(d => d.id));
  const foodIds = new Set(rules.foods.map(f => f.id));
  const err: string[] = [];

  for (const fr of rules.food_rules) {
    for (const f of fr.if) {
      if (f.startsWith("penyakit:")) {
        const pid = f.replace("penyakit:", "");
        if (!diseaseIds.has(pid))
          err.push(`Unknown disease in food_rules.if: ${pid}`);
      }
    }
    for (const id of fr.then.recommend_food_ids ?? [])
      if (!foodIds.has(id)) err.push(`Unknown food in recommend: ${id}`);
    for (const id of fr.then.prohibit_food_ids ?? [])
      if (!foodIds.has(id)) err.push(`Unknown food in prohibit: ${id}`);
  }
  return err;
}
