import { RulesJson } from '../engine/engine';
import { SymptomChip } from './SymptomChip';

type Props = {
  groupName: string;
  symptomIds: string[];
  rules: RulesJson;
  answers: Record<string, number>;
  onAnswer: (symptomId: string, cf: number) => void;
};

export function GroupPanel({ groupName, symptomIds, rules, answers, onAnswer }: Props) {
  const symptomMap = new Map(rules.symptoms.map((s) => [s.id, s.name]));

  const handleBulkAction = (action: 'uncertain' | 'clear' | 'flip') => {
    symptomIds.forEach((sid) => {
      const current = answers[sid] || 0;
      if (action === 'uncertain') {
        onAnswer(sid, 0.2);
      } else if (action === 'clear') {
        onAnswer(sid, 0);
      } else if (action === 'flip') {
        onAnswer(sid, current === 0 ? 1.0 : 0);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{groupName}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkAction('uncertain')}
            className="px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Semua Ragu
          </button>
          <button
            onClick={() => handleBulkAction('clear')}
            className="px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Bersihkan
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {symptomIds.map((sid) => (
          <SymptomChip
            key={sid}
            symptomId={sid}
            symptomName={symptomMap.get(sid) || sid}
            value={answers[sid] || 0}
            onChange={(cf) => onAnswer(sid, cf)}
          />
        ))}
      </div>
    </div>
  );
}
