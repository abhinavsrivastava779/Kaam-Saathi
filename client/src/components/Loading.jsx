import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'लोड हो रहा है...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[200px]">
      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      <p className="text-base font-bold text-slate-300">{message}</p>
    </div>
  );
}
