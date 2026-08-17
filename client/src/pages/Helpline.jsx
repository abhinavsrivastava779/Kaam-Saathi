import React, { useEffect, useState } from 'react';
import { PhoneCall, Clock, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { getHelplineStatus } from '../api/ivr';
import Loading from '../components/Loading';

export default function Helpline() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHelplineStatus()
      .then((data) => setStatus(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="हेल्पलाइन की जानकारी लोड हो रही है..." />;

  const isOpen = status ? status.isOpen : true;
  const helplineNumber = status ? status.helplineNumber : '+919876543210';

  return (
    <div className="max-w-md mx-auto py-2 space-y-5 text-center">
      <div className="glass-card rounded-2xl p-6 border border-amber-500/40 shadow-xl space-y-4">
        <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500">
          <PhoneCall className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white">
            ☎️ हेल्पलाइन (Helpline)
          </h2>
          <p className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>सुबह 6 बजे से शाम 6 बजे तक</span>
          </p>
        </div>

        <div
          className={`p-4 rounded-xl text-sm font-bold border ${
            isOpen
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
              : 'bg-rose-950/80 border-rose-600 text-rose-300'
          }`}
        >
          {isOpen ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>ऐप चलाने में परेशानी है? हमें कॉल करें।</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>हेल्पलाइन सुबह 6 बजे से शाम 6 बजे तक उपलब्ध है।</span>
            </div>
          )}
        </div>

        {/* Big Call Button */}
        <a
          href={`tel:${helplineNumber}`}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-lg shadow-xl transition min-h-[60px] ${
            isOpen
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/60'
              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <PhoneCall className="w-6 h-6" />
          <span>☎️ हेल्पलाइन पर कॉल करें</span>
        </a>

        <p className="text-xs text-slate-400 pt-2">
          नंबर: <strong className="text-slate-200">{helplineNumber}</strong>
        </p>
      </div>

      {/* Operator assistance bullet points */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700 text-left space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>हेल्पलाइन आपकी कैसे मदद करेगी?</span>
        </h3>

        <ul className="text-xs font-semibold text-slate-300 space-y-2 list-disc list-inside">
          <li>नया प्रोफाइल बनाने में सहायता</li>
          <li>पास के मज़दूर ढूंढने में मदद</li>
          <li>ऐप इस्तेमाल करने की जानकारी</li>
          <li>किसी भी प्रकार की समस्या का समाधान</li>
        </ul>
      </div>
    </div>
  );
}
