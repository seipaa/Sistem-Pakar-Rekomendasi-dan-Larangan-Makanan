import { useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { useStore } from '../logic/useStore';

type Props = {
  onSearch?: (query: string) => void;
};

export function TopBar({ onSearch }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { cfThreshold, setCfThreshold, conflictPolicy, setConflictPolicy, reset } = useStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari gejala..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Pengaturan"
          >
            <Settings className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Threshold CF Penyakit: {cfThreshold.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={cfThreshold}
                onChange={(e) => setCfThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kebijakan Konflik
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setConflictPolicy('safer_wins')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    conflictPolicy === 'safer_wins'
                      ? 'bg-teal-500 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Pilih yang Lebih Aman
                </button>
                <button
                  onClick={() => setConflictPolicy('higher_cf')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    conflictPolicy === 'higher_cf'
                      ? 'bg-teal-500 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  CF Lebih Tinggi
                </button>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            >
              Reset Semua Jawaban
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
