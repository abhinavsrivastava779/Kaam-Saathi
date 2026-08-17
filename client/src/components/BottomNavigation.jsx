import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNavigation() {
  const { worker, employer } = useAuth();
  const { t } = useLanguage();

  const navItems = employer
    ? [
        { to: '/', label: t('होम'), icon: '🏠' },
        { to: '/employer/search', label: t('मज़दूर खोजें'), icon: '🔎' },
        { to: '/employer/dashboard', label: t('Employer Dashboard'), icon: '👔' },
        { to: '/ivr', label: t('बिना नेट (IVR)'), icon: '🤖' },
        { to: '/help', label: t('मदद'), icon: '☎️' },
      ]
    : [
        { to: '/', label: t('होम'), icon: '🏠' },
        { to: '/employer/login', label: t('खोजें'), icon: '🔎' },
        { to: worker ? '/worker/dashboard' : '/worker/signup', label: worker ? t('माई प्रोफाइल') : t('काम पाएं'), icon: '👷' },
        { to: '/ivr', label: t('बिना नेट (IVR)'), icon: '🤖' },
        { to: '/help', label: t('मदद'), icon: '☎️' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 py-1.5 px-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-center transition min-h-[48px] ${
                isActive ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}>
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[11px] font-medium leading-tight mt-0.5 truncate w-full">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
