import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';
import { adminLogin } from '../api/admin';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await adminLogin(username, password);
      localStorage.setItem('kaam_saathi_admin_token', res.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'लॉगिन असफल हुआ।');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={submit} className="w-full glass-card rounded-3xl p-6 border border-blue-500/30 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <ShieldCheck className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Login</h1>
          <p className="text-xs text-slate-400">काम मंच प्रबंधन पैनल</p>
        </div>
        {error && <div className="rounded-xl bg-rose-950/60 border border-rose-700 p-3 text-sm text-rose-200">{error}</div>}
        <label className="block">
          <span className="text-xs font-bold text-slate-300">यूज़रनेम</span>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white min-h-[50px] outline-none focus:border-blue-500" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-300">पासवर्ड</span>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white min-h-[50px] outline-none focus:border-blue-500" />
          </div>
        </label>
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl min-h-[52px] flex items-center justify-center gap-2">
          {loading ? 'लॉगिन हो रहा है...' : <>Admin Dashboard <ArrowRight className="w-5 h-5" /></>}
        </button>
        <p className="text-[11px] text-center text-slate-500">Demo: admin / admin123</p>
      </form>
    </div>
  );
}
