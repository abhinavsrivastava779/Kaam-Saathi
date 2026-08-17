import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function RateStepper({ value, onChange, min = 200, max = 3000, step = 50 }) {
  const suggestedRates = [400, 500, 600, 700, 800, 1000];

  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-sm font-semibold text-slate-400 block mb-1">
          आपकी 1 दिन की दिहाड़ी
        </span>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-black text-2xl flex items-center justify-center active:scale-95 transition"
            aria-label="घटाएं"
          >
            <Minus className="w-7 h-7" />
          </button>

          <div className="bg-slate-800 border-2 border-emerald-500 rounded-2xl px-6 py-3 min-w-[140px] text-center shadow-lg shadow-emerald-950/50">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">
              ₹{value}
            </span>
            <span className="text-xs font-semibold text-slate-400 block">
              प्रति दिन
            </span>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-black text-2xl flex items-center justify-center active:scale-95 transition"
            aria-label="बढ़ाएं"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Rate Pills */}
      <div>
        <span className="text-xs font-bold text-slate-400 block text-center mb-2">
          सुझाई गई दिहाड़ी चुनें:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestedRates.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onChange(rate)}
              className={`px-3.5 py-2 rounded-xl text-sm font-black transition min-h-[44px] ${
                value === rate
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              ₹{rate}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
