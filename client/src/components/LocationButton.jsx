import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useLocationState } from '../context/LocationContext';

export default function LocationButton({ onLocationFetched, label = '📍 मेरी लोकेशन लें' }) {
  const { requestLocation, loading, coords, areaText, errorMsg } = useLocationState();

  const handleFetchLocation = async () => {
    const c = await requestLocation();
    if (c && onLocationFetched) onLocationFetched(c);
  };

  return (
    <div className="space-y-2 w-full">
      <button
        type="button"
        onClick={handleFetchLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition text-base min-h-[52px]"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /><span>लोकेशन ली जा रही है...</span></>
        ) : (
          <><MapPin className="w-5 h-5" /><span>{label}</span></>
        )}
      </button>

      {coords?.lat !== undefined && (
        <div className="text-center text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 py-2 px-3 rounded-xl">
          ✓ {areaText || 'GPS लोकेशन प्राप्त'}
          <span className="block text-[10px] text-slate-500 mt-0.5">
            {coords.lat.toFixed(4)}, {coords.long.toFixed(4)}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="text-center text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/60 py-1.5 px-3 rounded-xl">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
