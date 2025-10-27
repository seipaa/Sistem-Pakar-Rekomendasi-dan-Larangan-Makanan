import { RulesJson } from '../engine/engine';

export type SymptomImportance = {
  id: string;
  name: string;
  importance: number;
};

export function rankSymptoms(rules: RulesJson): SymptomImportance[] {
  const symptomMaxCF = new Map<string, number>();

  for (const dr of rules.diagnosis_rules) {
    for (const ev of dr.evidence) {
      const current = symptomMaxCF.get(ev.symptom_id) || 0;
      symptomMaxCF.set(ev.symptom_id, Math.max(current, ev.cf_expert));
    }
  }

  const symptomMap = new Map(rules.symptoms.map((s) => [s.id, s.name]));

  const ranked: SymptomImportance[] = Array.from(symptomMaxCF.entries()).map(
    ([id, importance]) => ({
      id,
      name: symptomMap.get(id) || id,
      importance,
    })
  );

  ranked.sort((a, b) => b.importance - a.importance);

  return ranked;
}

export function getTopSymptoms(
  rules: RulesJson,
  count: number = 8
): SymptomImportance[] {
  const ranked = rankSymptoms(rules);
  return ranked.slice(0, count);
}

export function getSymptomGroups(rules: RulesJson) {
  return [
    {
      id: 'cardiovascular',
      name: 'Tekanan & Kardiovaskular',
      symptom_ids: ['G01', 'G02', 'G03', 'G04', 'G05'],
    },
    {
      id: 'metabolic',
      name: 'Metabolik & Gula Darah',
      symptom_ids: ['G06', 'G07', 'G08', 'G09', 'G10', 'G11', 'G12'],
    },
    {
      id: 'respiratory_episodic',
      name: 'Pernapasan Episodik',
      symptom_ids: ['G14', 'G15', 'G16', 'G18', 'G19'],
    },
    {
      id: 'respiratory_chronic',
      name: 'Pernapasan Kronik',
      symptom_ids: ['G13', 'G17', 'G20', 'G21'],
    },
    {
      id: 'kidney',
      name: 'Ginjal & Cairan',
      symptom_ids: ['G22', 'G23', 'G24', 'G25', 'G26'],
    },
  ];
}
