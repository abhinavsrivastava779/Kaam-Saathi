import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendEmployerOtp, verifyEmployerOtp, updateEmployerProfile } from '../api/employer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import OtpInput from '../components/OtpInput';

export default function EmployerLogin() {
  const nav = useNavigate();
  const location = useLocation();
  const { loginEmployer } = useAuth();
  const returnTo = location.state?.from || '/employer/dashboard';
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError(t('10 अंकों का mobile number डालें।'));
      return;
    }
    setLoading(true); setError('');
    try {
      await sendEmployerOtp(phone);
      setStep(2);
    } catch (x) {
      setError(x.response?.data?.message || 'OTP नहीं भेजा गया।');
    } finally { setLoading(false); }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(otp)) {
      setError(t('कृपया 4 अंकों का OTP दर्ज करें।'));
      return;
    }
    setLoading(true); setError('');
    try {
      const r = await verifyEmployerOtp(phone, otp);
      setToken(r.token);
      loginEmployer(r.token, r.employer);

      // New employer must complete a basic identity profile before entering dashboard.
      if (r.isNewEmployer || !r.employer?.name) {
        setName(r.employer?.name || '');
        setPhoto(r.employer?.photo || '');
        setStep(3);
      } else {
        nav(returnTo, { replace: true });
      }
    } catch (x) {
      setError(x.response?.data?.message || t('गलत OTP'));
    } finally { setLoading(false); }
  };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setError('फोटो image हो और 2MB से छोटी हो।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('कृपया अपना नाम दर्ज करें।');
    setLoading(true); setError('');
    try {
      const r = await updateEmployerProfile({ name: name.trim(), photo });
      loginEmployer(token, r.employer);
      nav(returnTo, { replace: true });
    } catch (x) {
      setError(x.response?.data?.message || 'Profile save नहीं हुई।');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="glass-card rounded-2xl p-6 border border-slate-700 space-y-5">
        <h2 className="text-2xl font-black text-white text-center">🏗️ {step === 3 ? 'Employer Profile बनाएं' : t('Employer Login')}</h2>
        {error && <p className="text-xs text-rose-300 font-bold bg-rose-950/40 p-3 rounded-xl">{error}</p>}

        {step === 1 && (
          <form onSubmit={send} className="space-y-4">
            <p className="text-xs text-slate-400">पहले mobile OTP से login/register करें।</p>
            <input value={phone} maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white" />
            <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black rounded-xl py-4">
              {loading ? t('OTP भेजा जा रहा है...') : t('OTP भेजें')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verify} className="space-y-4">
            <p className="text-xs text-slate-400 text-center">+91 {phone}</p>
            <OtpInput value={otp} onChange={setOtp} length={4} />
            <button disabled={loading} className="w-full bg-emerald-600 text-white font-black rounded-xl py-4">
              {loading ? 'Verifying...' : t('Login करें')}
            </button>
            <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-xs text-slate-400 py-2">{t('नंबर बदलें')}</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={saveProfile} className="space-y-4">
            <p className="text-xs text-slate-400">
              Employer ID पूरा करने के लिए अपना नाम और profile photo दें।
            </p>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="आपका नाम / कंपनी का नाम"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white" />

            <div className="text-center">
              {photo ? (
                <img src={photo} alt="Employer" className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-amber-400" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-slate-800 border border-dashed border-slate-600 mx-auto flex items-center justify-center text-4xl">📷</div>
              )}
              <label className="inline-block mt-3 bg-slate-800 border border-slate-700 text-amber-300 font-bold px-4 py-3 rounded-xl cursor-pointer">
                📷 Photo लें / Upload करें (Optional)
                <input type="file" accept="image/*" capture="user" onChange={pickPhoto} className="hidden" />
              </label>
            </div>

            <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black rounded-xl py-4">
              {loading ? 'Profile save हो रही है...' : 'Employer ID पूरा करें'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
