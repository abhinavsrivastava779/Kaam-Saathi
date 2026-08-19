import React from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  useLocation,
  useNavigate
} from 'react-router-dom';

export default function FloatingBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Home page par button hide rahega
  if (location.pathname === '/') {
    return null;
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      title="एक कदम पीछे"
      className="fixed left-3 bottom-24 z-50 w-12 h-12 rounded-full bg-slate-800/95 border border-slate-600 text-white shadow-2xl flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}