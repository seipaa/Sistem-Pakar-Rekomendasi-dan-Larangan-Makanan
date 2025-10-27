import { useEffect, useState } from 'react';
import { SymptomCard } from './SymptomCard';
import { getTopSymptoms } from '../logic/importance';
import { useStore } from '../logic/useStore';
import { RulesJson } from '../engine/engine';

type Props = {
  rules: RulesJson;
  onComplete: () => void;
};

const BATCH_SIZE = 3;

export function QuickTriage({ rules, onComplete }: Props) {
  const { answers, setAnswer, showKeyboardHints } = useStore();
  const [currentBatch, setCurrentBatch] = useState(0);

  const topSymptoms = getTopSymptoms(rules, 8);
  const batches: typeof topSymptoms[] = [];
  for (let i = 0; i < topSymptoms.length; i += BATCH_SIZE) {
    batches.push(topSymptoms.slice(i, i + BATCH_SIZE));
  }

  const currentSymptoms = batches[currentBatch] || [];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') {
        currentSymptoms.forEach((s) => setAnswer(s.id, 1.0));
      } else if (e.key === '2') {
        currentSymptoms.forEach((s) => setAnswer(s.id, 0.2));
      } else if (e.key === '3') {
        currentSymptoms.forEach((s) => setAnswer(s.id, 0));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSymptoms, setAnswer]);

  const handleNext = () => {
    if (currentBatch < batches.length - 1) {
      setCurrentBatch(currentBatch + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentBatch > 0) {
      setCurrentBatch(currentBatch - 1);
    }
  };

  const progress = ((currentBatch + 1) / batches.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Pertanyaan {currentBatch + 1} dari {batches.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showKeyboardHints && (
        <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
          <p className="font-medium mb-1">Shortcut Keyboard:</p>
          <div className="flex gap-4">
            <span><kbd className="px-2 py-1 bg-white rounded border border-teal-200">1</kbd> = Ya (Semua)</span>
            <span><kbd className="px-2 py-1 bg-white rounded border border-teal-200">2</kbd> = Ragu (Semua)</span>
            <span><kbd className="px-2 py-1 bg-white rounded border border-teal-200">3</kbd> = Tidak (Semua)</span>
          </div>
        </div>
      )}

      <SymptomCard
        symptoms={currentSymptoms}
        answers={answers}
        onAnswer={setAnswer}
      />

      <div className="flex gap-4">
        {currentBatch > 0 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Kembali
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors shadow-sm"
        >
          {currentBatch < batches.length - 1 ? 'Lanjut' : 'Lihat Hasil'}
        </button>
      </div>
    </div>
  );
}
