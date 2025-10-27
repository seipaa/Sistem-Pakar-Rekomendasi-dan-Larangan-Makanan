import { X } from 'lucide-react';
import { EngineOutput } from '../logic/types';
import { RulesJson } from '../engine/engine';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  disease: { disease_id: string; name: string; cf: number };
  answers: Record<string, number>;
  rules: RulesJson;
  results: EngineOutput;
};

export function ExplanationModal({ isOpen, onClose, disease, answers, rules, results }: Props) {
  if (!isOpen) return null;

  const symptomMap = new Map(rules.symptoms.map((s) => [s.id, s.name]));

  const diagnosisRule = rules.diagnosis_rules.find((r) => r.then === disease.disease_id);

  const contributions = diagnosisRule?.evidence
    .map((ev) => {
      const userCF = answers[ev.symptom_id] || 0;
      const contribution = userCF * ev.cf_expert;
      return {
        symptom_id: ev.symptom_id,
        symptom_name: symptomMap.get(ev.symptom_id) || ev.symptom_id,
        user_cf: userCF,
        expert_cf: ev.cf_expert,
        contribution,
      };
    })
    .filter((c) => c.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution) || [];

  const activeFacts = results.facts.filter((f) => f.startsWith('kategori_diet:'));

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Penjelasan: {disease.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Tingkat Keyakinan Total</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-200 rounded-full h-4">
                  <div
                    className="bg-teal-500 h-4 rounded-full"
                    style={{ width: `${disease.cf * 100}%` }}
                  />
                </div>
                <span className="font-bold text-lg text-slate-800">
                  {(disease.cf * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Gejala yang Menyumbang</h3>
              <div className="space-y-2">
                {contributions.length > 0 ? (
                  contributions.map((c) => (
                    <div key={c.symptom_id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-700">{c.symptom_name}</span>
                        <span className="text-sm text-slate-600">
                          {(c.contribution * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Keyakinan Anda: {(c.user_cf * 100).toFixed(0)}% × CF Expert: {(c.expert_cf * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">Tidak ada gejala yang dilaporkan untuk penyakit ini.</p>
                )}
              </div>
            </div>

            {activeFacts.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Kategori Diet Aktif</h3>
                <div className="space-y-2">
                  {activeFacts.map((fact) => (
                    <div key={fact} className="bg-teal-50 rounded-lg p-3 text-teal-800 text-sm">
                      {fact.replace('kategori_diet:', '').replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diagnosisRule && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Rule ID</h3>
                <code className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-700">
                  {diagnosisRule.id}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
