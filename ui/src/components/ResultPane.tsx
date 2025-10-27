import { Info } from 'lucide-react';
import { useState } from 'react';
import { RulesJson } from '../engine/engine';
import { EngineOutput } from '../logic/types';
import { ExplanationModal } from './ExplanationModal';

type Props = {
  results: EngineOutput;
  fruitsOnly: boolean;
  onToggleFruitsOnly: () => void;
  answers: Record<string, number>;
  rules: RulesJson;
};

export function ResultPane({ results, fruitsOnly, onToggleFruitsOnly, answers, rules }: Props) {
  const [selectedDisease, setSelectedDisease] = useState<typeof results.diseases[0] | null>(null);

  const topDisease = results.diseases[0];
  const otherDiseases = results.diseases.slice(1, 4).filter((d) => d.cf > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Diagnosis</h2>

        {topDisease && topDisease.cf > 0 ? (
          <>
            <div className="bg-teal-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-teal-900">{topDisease.name}</h3>
                <button
                  onClick={() => setSelectedDisease(topDisease)}
                  className="p-1 hover:bg-teal-100 rounded transition-colors"
                  aria-label="Lihat penjelasan"
                >
                  <Info className="w-5 h-5 text-teal-700" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-teal-200 rounded-full h-3">
                  <div
                    className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${topDisease.cf * 100}%` }}
                  />
                </div>
                <span className="font-bold text-teal-900">
                  {(topDisease.cf * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {otherDiseases.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Kemungkinan Lain</h4>
                <div className="space-y-2">
                  {otherDiseases.map((disease) => (
                    <div key={disease.disease_id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{disease.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{(disease.cf * 100).toFixed(1)}%</span>
                        <button
                          onClick={() => setSelectedDisease(disease)}
                          className="p-1 hover:bg-slate-100 rounded transition-colors"
                          aria-label="Lihat penjelasan"
                        >
                          <Info className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500">Tidak ada diagnosis yang teridentifikasi. Coba jawab lebih banyak gejala.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              Direkomendasikan
            </h3>
            <div className="space-y-2">
              {results.recommend.length > 0 ? (
                results.recommend.map((food) => (
                  <div
                    key={food.food_id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <span className="text-slate-800">{food.name}</span>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      {(food.cf * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">Tidak ada rekomendasi saat ini.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              Sebaiknya Dihindari
            </h3>
            <div className="space-y-2">
              {results.prohibit.length > 0 ? (
                results.prohibit.map((food) => (
                  <div
                    key={food.food_id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <span className="text-slate-800">{food.name}</span>
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                      {(food.cf * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">Tidak ada larangan saat ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedDisease && (
        <ExplanationModal
          isOpen={true}
          onClose={() => setSelectedDisease(null)}
          disease={selectedDisease}
          answers={answers}
          rules={rules}
          results={results}
        />
      )}
    </div>
  );
}
