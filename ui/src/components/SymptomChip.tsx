type Props = {
  symptomId: string;
  symptomName: string;
  value: number;
  onChange: (value: number) => void;
};

const CF_LABELS = ['Tidak Yakin', 'Sedikit Yakin', 'Cukup Yakin', 'Yakin', 'Sangat Yakin'];

export function SymptomChip({ symptomName, value, onChange }: Props) {
  const displayValue = Number((Math.round(value * 5) / 5).toFixed(1));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    const snapped = Number((Math.round(newValue * 5) / 5).toFixed(1));
    onChange(snapped);
  };

  const getLabel = (val: number) => {
    if (val === 0) return 'Belum Dipilih';
    if (val <= 0.2) return CF_LABELS[0];
    if (val <= 0.4) return CF_LABELS[1];
    if (val <= 0.6) return CF_LABELS[2];
    if (val <= 0.8) return CF_LABELS[3];
    return CF_LABELS[4];
  };

  const getBgColor = () => {
    if (displayValue === 0) return 'bg-slate-100 border-slate-200';
    if (displayValue <= 0.4) return 'bg-amber-50 border-amber-200';
    if (displayValue <= 0.7) return 'bg-teal-50 border-teal-200';
    return 'bg-teal-100 border-teal-300';
  };

  const getTextColor = () => {
    if (displayValue === 0) return 'text-slate-600';
    if (displayValue <= 0.4) return 'text-amber-800';
    return 'text-teal-800';
  };

  return (
    <div className={`border-2 rounded-xl p-4 transition-all ${getBgColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${getTextColor()}`}>{symptomName}</h4>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          displayValue === 0 ? 'bg-slate-200 text-slate-600' : 'bg-white/60 ' + getTextColor()
        }`}>
          {getLabel(displayValue)}
        </span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.2"
          value={displayValue}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${displayValue * 100}%, #e2e8f0 ${displayValue * 100}%, #e2e8f0 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Tidak</span>
          <span>Sangat Yakin</span>
        </div>
      </div>
    </div>
  );
}
