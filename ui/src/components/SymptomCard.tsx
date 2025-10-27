import { SymptomChip } from './SymptomChip';
import { SymptomImportance } from '../logic/importance';

type Props = {
  symptoms: SymptomImportance[];
  answers: Record<string, number>;
  onAnswer: (symptomId: string, cf: number) => void;
};

export function SymptomCard({ symptoms, answers, onAnswer }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      {symptoms.map((symptom) => (
        <div key={symptom.id} className="flex items-center gap-3">
          <SymptomChip
            symptomId={symptom.id}
            symptomName={symptom.name}
            value={answers[symptom.id] || 0}
            onChange={(cf) => onAnswer(symptom.id, cf)}
          />
        </div>
      ))}
    </div>
  );
}
