import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhoneCall, MessageSquare, PhoneMissed, Bot, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getHelplineStatus } from '../api/ivr';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { worker, employer } = useAuth();
  const { t } = useLanguage();
  const [helplineInfo, setHelplineInfo] = useState(null);

  useEffect(() => {
    getHelplineStatus()
      .then((data) => setHelplineInfo(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Branding Box */}
      <div className="text-center pt-4 pb-2 space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-600/20 border-2 border-emerald-500/40 shadow-xl mb-1">
          <span className="text-5xl select-none">👷</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight leading-none">
          काम मंची
        </h1>
        <p className="text-base font-bold text-emerald-400 tracking-wide">
          {t('काम और मज़दूर, दोनों आसानी से खोजें')}
        </p>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-3.5 px-1">
        {/* Button 1: Mujhe Kaam Chahiye */}
        <button
          type="button"
          onClick={() => navigate(worker ? '/worker/dashboard' : '/worker/signup')}
          className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white shadow-xl shadow-emerald-950/60 border-2 border-emerald-400/40 transition group min-h-[72px]"
        >
          <div className="flex items-center gap-4 text-left">
            <span className="text-4xl">👷</span>
            <div>
              <span className="text-xl font-extrabold block leading-tight">
                {worker ? t('माई प्रोफाइल देखें') : t('मुझे काम चाहिए')}
              </span>
              <span className="text-xs font-semibold opacity-90 block">
                {worker ? t('अपनी उपलब्धता और दिहाड़ी बदलें') : t('अपना प्रोफाइल बनाएं और रोज़ाना दिहाड़ी पाएं')}
              </span>
            </div>
          </div>
          <ChevronRight className="w-7 h-7 shrink-0 text-emerald-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Button 2: Mujhe Mazdoor Chahiye */}
        <button
          type="button"
          onClick={() => navigate(employer ? '/employer/dashboard' : '/employer/login')}
          className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:scale-[0.98] text-white shadow-xl border-2 border-amber-500/50 transition group min-h-[72px]"
        >
          <div className="flex items-center gap-4 text-left">
            <span className="text-4xl">🏗️</span>
            <div>
              <span className="text-xl font-extrabold text-amber-400 block leading-tight">
                {t('मुझे मज़दूर चाहिए')}
              </span>
              <span className="text-xs font-semibold text-slate-300 block">
                {t('पास के मिस्त्री, पेंटर, प्लंबर सीधे खोजें')}
              </span>
            </div>
          </div>
          <ChevronRight className="w-7 h-7 shrink-0 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Helpline Banner */}
      <div className="bg-slate-800/90 rounded-2xl p-4 border border-amber-500/30 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                ☎️ मदद चाहिए?
              </h3>
              <p className="text-xs font-medium text-amber-300">
                हेल्पलाइन — सुबह 6 बजे से शाम 6 बजे तक
              </p>
            </div>
          </div>

          <Link
            to="/help"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 px-3.5 rounded-xl transition min-h-[44px] flex items-center justify-center"
          >
            {t('कॉल करें')}
          </Link>
        </div>
        {helplineInfo && (
          <p className="text-[11px] font-semibold text-slate-400 text-center pt-1 border-t border-slate-700/60">
            {helplineInfo.message}
          </p>
        )}
      </div>

      {/* Other Low-Literacy Profile Creation Options */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          बिना स्मार्टफोन या ऐप के जुड़ें:
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/whatsapp"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition min-h-[80px]"
          >
            <span className="text-2xl mb-1">💬</span>
            <span className="text-xs font-bold text-emerald-400">WhatsApp से ID बनाएं</span>
          </Link>

          <Link
            to="/missed-call"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition min-h-[80px]"
          >
            <span className="text-2xl mb-1">📵</span>
            <span className="text-xs font-bold text-amber-400">मिस्ड कॉल</span>
          </Link>

          <Link
            to="/ivr"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition min-h-[80px]"
          >
            <span className="text-2xl mb-1">🤖</span>
            <span className="text-xs font-bold text-blue-400">IVR आवाज़</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
