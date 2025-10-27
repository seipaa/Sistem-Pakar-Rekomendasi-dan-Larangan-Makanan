import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RulesJson } from '../engine/engine';
import { getSymptomGroups } from '../logic/importance';
import { useStore } from '../logic/useStore';
import { GroupPanel } from './GroupPanel';

type Props = {
  rules: RulesJson;
  onComplete: () => void;
};

export function GroupCarousel({ rules, onComplete }: Props) {
  const { answers, setAnswer } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const groups = getSymptomGroups(rules);

  const groupProgress = useMemo(() => {
    return groups.map(group => {
      const answeredInGroup = group.symptom_ids.filter(
        sid => (answers[sid] || 0) > 0
      ).length;
      return { answered: answeredInGroup };
    });
  }, [groups, answers]);

  const totalAnswered = useMemo(
    () => groupProgress.reduce((acc, g) => acc + g.answered, 0),
    [groupProgress]
  );

  const currentGroup = groups[currentIndex];
  const isLastGroup = currentIndex === groups.length - 1;

  const handleNext = () => {
    if (isLastGroup) {
      if (totalAnswered === 0) {
        setShowEmptyAlert(true);
        return;
      }
      onComplete();
    } else {
      setCurrentIndex(idx => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(idx => idx - 1);
  };

  const handleJumpTo = (idx: number) => setCurrentIndex(idx);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Progress Kelompok</h3>
        </div>
        <div className="flex gap-2">
          {groups.map((group, idx) => {
            const isCurrent = idx === currentIndex;
            const answered = groupProgress[idx].answered;
            const isTouched = answered > 0;

            return (
              <button
                key={idx}
                onClick={() => handleJumpTo(idx)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-teal-500 text-white shadow-md'
                    : isTouched
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isTouched ? `${answered} gejala diisi` : 'Belum ada jawaban'}
              >
                <div className="flex items-center justify-center gap-1">
                  {isTouched ? <CheckCircle2 className="w-3 h-3" /> : null}
                  <span>{idx + 1}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Kelompok {currentIndex + 1}: {currentGroup.name}
          </h2>
          {groupProgress[currentIndex].answered > 0 && (
            <span className="text-sm text-slate-500">
              {groupProgress[currentIndex].answered} gejala terisi
            </span>
          )}
        </div>
      </div>

      <GroupPanel
        groupName={currentGroup.name}
        symptomIds={currentGroup.symptom_ids}
        rules={rules}
        answers={answers}
        onAnswer={setAnswer}
      />

      <div className="flex gap-4">
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Kembali
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3 rounded-xl font-medium transition-all shadow-sm bg-teal-500 text-white hover:bg-teal-600 hover:shadow-md"
        >
          {isLastGroup ? 'Lihat Hasil Diagnosis' : 'Lanjut ke Kelompok Berikutnya'}
        </button>
      </div>

      {showEmptyAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowEmptyAlert(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200">
            <h4 className="text-base font-semibold text-slate-800 mb-2">
              Silakan isi gejala terlebih dahulu
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              Untuk melihat hasil diagnosis, pilih minimal satu gejala terlebih dahulu.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEmptyAlert(false);
                  const el = document.querySelector('h2');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Isi Gejala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
