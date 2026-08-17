import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message = 'कुछ गलत हो गया। कृपया दोबारा कोशिश करें।' }) {
  return (
    <div className="bg-rose-950/80 border-2 border-rose-600/80 text-rose-200 p-4 rounded-2xl flex items-start gap-3 shadow-lg my-3">
      <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-extrabold text-sm text-rose-300">त्रुटि (Error)</h4>
        <p className="text-xs font-semibold mt-0.5 leading-snug">{message}</p>
      </div>
    </div>
  );
}
