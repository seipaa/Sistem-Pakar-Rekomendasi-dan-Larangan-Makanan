import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserAnswer, EngineOutput, UIMode } from './types';

type StoreState = {
  answers: Record<string, number>;
  results: EngineOutput | null;
  currentMode: UIMode;
  fruitsOnly: boolean;
  cfThreshold: number;
  conflictPolicy: 'safer_wins' | 'higher_cf';
  showKeyboardHints: boolean;

  setAnswer: (symptomId: string, cf: number) => void;
  setResults: (results: EngineOutput | null) => void;
  setMode: (mode: UIMode) => void;
  toggleFruitsOnly: () => void;
  setCfThreshold: (threshold: number) => void;
  setConflictPolicy: (policy: 'safer_wins' | 'higher_cf') => void;
  toggleKeyboardHints: () => void;
  reset: () => void;
  getAnsweredSymptoms: () => UserAnswer[];
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      answers: {},
      results: null,
      currentMode: 'triage',
      fruitsOnly: false,
      cfThreshold: 0.0,
      conflictPolicy: 'safer_wins',
      showKeyboardHints: true,

      setAnswer: (symptomId, cf) =>
        set((state) => ({
          answers: { ...state.answers, [symptomId]: cf },
        })),

      setResults: (results) => set({ results }),

      setMode: (mode) => set({ currentMode: mode }),

      toggleFruitsOnly: () => set((state) => ({ fruitsOnly: !state.fruitsOnly })),

      setCfThreshold: (threshold) => set({ cfThreshold: threshold }),

      setConflictPolicy: (policy) => set({ conflictPolicy: policy }),

      toggleKeyboardHints: () =>
        set((state) => ({ showKeyboardHints: !state.showKeyboardHints })),

      reset: () =>
        set({
          answers: {},
          results: null,
          currentMode: 'triage',
        }),

      getAnsweredSymptoms: () => {
        const state = get();
        return Object.entries(state.answers)
          .filter(([, cf]) => cf > 0)
          .map(([id, cf]) => ({ symptom_id: id, cf }));
      },
    }),
    {
      name: 'expert-system-storage',
    }
  )
);
