import React from 'react';

export default function SkillCard({ title, emoji, selected, onClick, badgeCount }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all min-h-[96px] w-full text-center active:scale-95 ${
        selected
          ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-500/30'
          : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-200'
      }`}
    >
      <span className="text-4xl mb-1.5 select-none">{emoji}</span>
      <span className={`text-base font-extrabold tracking-wide ${selected ? 'text-emerald-400' : 'text-slate-100'}`}>
        {title}
      </span>

      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
          {badgeCount}
        </span>
      )}
    </button>
  );
}
