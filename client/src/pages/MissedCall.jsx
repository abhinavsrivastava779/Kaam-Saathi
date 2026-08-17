import React, { useState } from 'react';
import { PhoneMissed, PhoneCall, CheckCircle2, ArrowRight } from 'lucide-react';
import { triggerCallback } from '../api/ivr';
import { useNavigate } from 'react-router-dom';

export default function MissedCall() {
  const navigate = useNavigate();
  const missedCallNumber = '+919876543211';

  const [simulating, setSimulating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSimulateMissedCall = async () => {
    setSimulating(true);
    try {
      const res = await triggerCallback('+919876543211');
      setSuccessMsg(res.message);
      setTimeout(() => {
        navigate('/ivr');
      }, 1500);
    } catch (err) {
      setSuccessMsg('मिस्ड कॉल सिमुलेशन पूरा हुआ। IVR पेज पर भेजा जा रहा है...');
      setTimeout(() => {
        navigate('/ivr');
      }, 1500);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-2 space-y-5 text-center">
      <div className="glass-card rounded-2xl p-6 border border-amber-500/40 shadow-xl space-y-5">
        <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500">
          <PhoneMissed className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">
            📵 बिना इंटरनेट प्रोफाइल बनाएं
          </h2>
          <p className="text-sm font-bold text-slate-300">
            इस नंबर पर मिस्ड कॉल दें। हम आपको वापस कॉल करेंगे।
          </p>
        </div>

        {/* Call Link Button */}
        <a
          href={`tel:${missedCallNumber}`}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-amber-950/60 transition min-h-[60px] text-lg flex items-center justify-center gap-3"
        >
          <PhoneCall className="w-6 h-6" />
          <span>मिस्ड कॉल दें ({missedCallNumber})</span>
        </a>

        <div className="pt-2 border-t border-slate-800 space-y-3">
          <p className="text-xs text-slate-400 font-medium">
            (डेवलपमेंट टेस्ट: नीचे दिए बटन से मिस्ड कॉल बैक सिमुलेट करें)
          </p>

          <button
            type="button"
            onClick={handleSimulateMissedCall}
            disabled={simulating}
            className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-3 px-4 rounded-xl border border-emerald-500/40 transition min-h-[48px] text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{simulating ? 'कॉल बैक सिमुलेट हो रही है...' : 'मिस्ड कॉल सिमुलेट करें (IVR टेस्ट)'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-300 p-3 rounded-xl text-xs font-bold">
            {successMsg}
          </div>
        )}
      </div>

      {/* Step Breakdown */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700 text-left space-y-3">
        <h3 className="text-sm font-extrabold text-white">
          यह कैसे काम करता है?
        </h3>

        <ol className="text-xs font-semibold text-slate-300 space-y-2.5 list-decimal list-inside">
          <li>आप ऊपर दिए नंबर पर मिस्ड कॉल देते हैं।</li>
          <li>हमारा सिस्टम आपका नंबर पहचानता है।</li>
          <li>आपको 30 सेकंड में ऑटोमैटिक कॉल बैक आती है।</li>
          <li>IVR कंप्यूटर आपकी भाषा में सवाल पूछता है।</li>
          <li>1 मिनट में आपका प्रोफाइल बन जाता है।</li>
        </ol>
      </div>
    </div>
  );
}
