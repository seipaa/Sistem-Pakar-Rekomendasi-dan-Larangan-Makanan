export type SymptomInput = { id: string; user_cf: number };

export type DiseaseScore = { disease_id: string; name: string; cf: number };
export type FoodScore = { food_id: string; name: string; cf: number };
export type EngineOutput = {
  diseases: DiseaseScore[];
  recommend: FoodScore[];
  prohibit: FoodScore[];
  facts: string[];
};

export type UserAnswer = {
  symptom_id: string;
  cf: number;
};

export type SymptomGroup = {
  id: string;
  name: string;
  symptom_ids: string[];
};

export type UIMode = 'triage' | 'refine' | 'result';
