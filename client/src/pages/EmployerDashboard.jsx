import React, { useEffect, useState } from 'react';
import { Camera, Edit3, LogOut, Search, Star, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEmployerProfile, updateEmployerProfile } from '../api/employer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { employer, updateEmployerState, logout } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(employer || null);
  const [name, setName] = useState(employer?.name || 'Employer');
  const [photo, setPhoto] = useState(employer?.photo || '');
  const [stats, setStats] = useState({ ratingsGiven: 0 });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getEmployerProfile()
      .then((res) => {
        setProfile(res.employer);
        setName(res.employer?.name || 'Employer');
        setPhoto(res.employer?.photo || '');
        setStats(res.stats || { ratingsGiven: 0 });
      })
      .catch(() => {});
  }, []);

  if (!employer && !profile) {
    navigate('/employer/login', { replace: true });
    return null;
  }

  const avatar = photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Employer')}&background=f59e0b&color=0f172a&size=256`;

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage('फोटो 2MB से छोटी रखें।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const res = await updateEmployerProfile({ name, photo });
      setProfile(res.employer);
      updateEmployerState(res.employer);
      setEditing(false);
      setMessage(t('Profile successfully updated ✓'));
    } catch (e) {
      setMessage(e.response?.data?.message || t('Profile update नहीं हुआ।'));
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="rounded-3xl p-5 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img src={avatar} alt={name} className="w-24 h-24 rounded-3xl object-cover border-2 border-amber-400/60 bg-slate-800" />
            {editing && (
              <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center cursor-pointer shadow-lg">
                <Camera className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">{t('Professional Employer Dashboard')}</p>
            {editing ? (
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold" />
            ) : (
              <h1 className="text-2xl font-black text-white mt-1 truncate">{name}</h1>
            )}
            <p className="text-xs text-slate-400 mt-1">+91 {profile?.phone || employer?.phone}</p>
          </div>
        </div>
        {message && <p className="mt-3 text-xs font-bold text-emerald-400">{message}</p>}
        <div className="mt-4 flex gap-2">
          {editing ? (
            <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white font-black rounded-xl py-3">{saving ? t('Saving...') : 'Save Profile'}</button>
          ) : (
            <button onClick={() => setEditing(true)} className="flex-1 bg-slate-800 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2"><Edit3 className="w-4 h-4" /> Edit Profile</button>
          )}
          <button onClick={() => navigate('/employer/search')} className="flex-1 bg-amber-500 text-slate-950 font-black rounded-xl py-3 flex items-center justify-center gap-2"><Search className="w-4 h-4" /> Find Workers</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-slate-700">
          <Star className="w-6 h-6 text-amber-400 mb-2" />
          <p className="text-2xl font-black text-white">{stats.ratingsGiven}</p>
          <p className="text-xs text-slate-400">{t('दी गई रेटिंग')}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-700">
          <UserRound className="w-6 h-6 text-emerald-400 mb-2" />
          <p className="text-sm font-black text-white mt-1">{t('Verified मज़दूर')}</p>
          <p className="text-xs text-slate-400 mt-1">Search results में KYC status दिखेगा</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-slate-700 space-y-3">
        <h2 className="font-black text-white">{t('Employer Quick Actions')}</h2>
        <button onClick={() => navigate('/employer/search')} className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-xl p-4 flex items-center justify-between">
          <span><b className="text-white">मज़दूर खोजें</b><span className="block text-xs text-slate-400 mt-1">काम, दूरी और उपलब्धता के हिसाब से</span></span><span className="text-amber-400 text-xl">→</span>
        </button>
        <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left bg-rose-950/40 border border-rose-900/50 rounded-xl p-4 flex items-center gap-3 text-rose-300 font-bold">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
}
