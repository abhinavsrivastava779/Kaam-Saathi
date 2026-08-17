import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, PhoneCall, Shield, MessageSquare, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ title, showBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  return <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-md">
    <div className="max-w-md mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {showBack ? <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl bg-slate-800 text-slate-200 min-h-[48px] min-w-[48px] flex items-center justify-center"><ArrowLeft className="w-6 h-6" /></button> : <Link to="/" className="flex items-center gap-2 min-w-0"><span className="text-3xl">👷</span><div><h1 className="text-xl font-extrabold text-white tracking-tight leading-none">काम साथी</h1><span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Kaam Saathi</span></div></Link>}
        {title && showBack && <h2 className="text-lg font-bold text-white truncate max-w-[150px]">{title}</h2>}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')} title="Language" className="px-2.5 rounded-xl bg-slate-800 text-emerald-300 font-black text-xs min-h-[44px] flex items-center gap-1"><Globe className="w-4 h-4" />{language === 'hi' ? 'EN' : 'हिं'}</button>
        <Link to="/help" title={language === 'hi' ? 'हेल्पलाइन' : 'Help'} className="p-2 rounded-xl text-amber-400 hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"><PhoneCall className="w-5 h-5" /></Link>
        <Link to="/whatsapp" title="WhatsApp" className="p-2 rounded-xl text-emerald-400 hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"><MessageSquare className="w-5 h-5" /></Link>
        <Link to="/admin" title="Admin" className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"><Shield className="w-5 h-5" /></Link>
      </div>
    </div>
  </header>;
}
