import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { GroupCarousel } from '../components/GroupCarousel';
import { ResultPane } from '../components/ResultPane';
import { useStore } from '../logic/useStore';
import { runEngine, RulesJson } from '../engine/engine';
import rulesData from '../data/rules.json';
import { ArrowLeft } from 'lucide-react';

const rules = rulesData as RulesJson;

export function Diagnose() {
  const navigate = useNavigate();
  const { answers, setResults, results, fruitsOnly, toggleFruitsOnly, cfThreshold, conflictPolicy, currentMode, setMode } = useStore();

  useEffect(() => {
    setMode('refine');
  }, [setMode]);

  const handleShowResult = () => {
    const symptoms = Object.entries(answers)
      .filter(([, cf]) => cf > 0)
      .map(([id, user_cf]) => ({ id, user_cf }));

    if (symptoms.length > 0) {
      const output = runEngine(rules, {
        symptoms,
        cf_threshold_disease: cfThreshold,
        fruits_only: fruitsOnly,
        conflict_policy: conflictPolicy,
      });
      setResults(output);
      setMode('result');
    }
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k] > 0).length;

  return (
    <AppShell
      results={results}
      showPreview={false}
      fruitsOnly={fruitsOnly}
      onToggleFruitsOnly={toggleFruitsOnly}
      answers={answers}
      rules={rules}
    >
      {currentMode === 'refine' && (
        <div>
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Diagnosis Gejala</h1>
              <p className="text-slate-600">
                Isi gejala per kelompok untuk mendapatkan rekomendasi makanan yang sesuai
              </p>
            </div>
          </div>
          <GroupCarousel rules={rules} onComplete={handleShowResult} />
        </div>
      )}

      {currentMode === 'result' && results && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Hasil Diagnosis</h1>
              <p className="text-slate-600">Rekomendasi berdasarkan {answeredCount} gejala yang Anda laporkan</p>
            </div>
            <button
              onClick={() => setMode('refine')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Ubah Gejala
            </button>
          </div>
          <ResultPane
            results={results}
            fruitsOnly={fruitsOnly}
            onToggleFruitsOnly={toggleFruitsOnly}
            answers={answers}
            rules={rules}
          />
        </div>
      )}
    </AppShell>
  );
}
