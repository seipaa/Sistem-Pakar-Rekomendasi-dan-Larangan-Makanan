import { ReactNode, useState } from 'react';
import { RulesJson } from '../engine/engine';
import { EngineOutput } from '../logic/types';
import { BottomSheet } from './BottomSheet';
import { ResultPane } from './ResultPane';

type Props = {
  children: ReactNode;
  results: EngineOutput | null;
  showPreview: boolean;
  fruitsOnly: boolean;
  onToggleFruitsOnly: () => void;
  answers: Record<string, number>;
  rules: RulesJson;
  progress?: number;
};

export function AppShell({
  children,
  results,
  showPreview,
  fruitsOnly,
  onToggleFruitsOnly,
  answers,
  rules,
  progress,
}: Props) {
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      {progress !== undefined && (
        <div className="bg-teal-500 h-1 transition-all duration-300" style={{ width: `${progress}%` }} />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          <div>{children}</div>

          {showPreview && results && (
            <>
              <div className="hidden lg:block sticky top-24 h-fit">
                <ResultPane
                  results={results}
                  fruitsOnly={fruitsOnly}
                  onToggleFruitsOnly={onToggleFruitsOnly}
                  answers={answers}
                  rules={rules}
                />
              </div>

              <div className="lg:hidden fixed bottom-4 right-4 z-30">
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="bg-teal-500 text-white px-6 py-3 rounded-full shadow-lg font-medium hover:bg-teal-600 transition-colors"
                >
                  Lihat Hasil
                </button>
              </div>

              <BottomSheet isOpen={showMobilePreview} onClose={() => setShowMobilePreview(false)}>
                <ResultPane
                  results={results}
                  fruitsOnly={fruitsOnly}
                  onToggleFruitsOnly={onToggleFruitsOnly}
                  answers={answers}
                  rules={rules}
                />
              </BottomSheet>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
