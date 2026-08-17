import React from 'react';

export default function AvailabilityToggle({ availability, onToggle, loading = false }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!availability)}
      disabled={loading}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] min-h-[64px] ${
        availability
          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
          : 'bg-rose-950/80 border-rose-600 text-rose-300 ring-2 ring-rose-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl leading-none">
          {availability ? '🟢' : '🔴'}
        </span>
        <div className="text-left">
          <span className="text-lg font-black block leading-tight">
            {availability ? 'आज उपलब्ध' : 'आज उपलब्ध नहीं'}
          </span>
          <span className="text-xs opacity-80 font-medium">
            {availability ? 'मालिक आपको कॉल कर सकते हैं' : 'कॉल प्राप्त नहीं होंगे'}
          </span>
        </div>
      </div>

      <div
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
          availability ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
        }`}
      >
        <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300" />
      </div>
    </button>
  );
}
