import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, User, Camera, MapPin, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { sendOtp, verifyOtp } from '../api/auth';
import { createWorker } from '../api/worker';
import { useAuth } from '../context/AuthContext';

import SkillCard from '../components/SkillCard';
import RateStepper from '../components/RateStepper';
import VoiceInput from '../components/VoiceInput';
import LocationButton from '../components/LocationButton';
import OtpInput from '../components/OtpInput';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

import { SKILLS_LIST } from '../utils/formatters';
import { useLocationState } from '../context/LocationContext';

export default function WorkerSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const returnTo = location.state?.from || '/worker/dashboard';
  const { areaText, city, state } = useLocationState();

  const [step, setStep] = useState(1); // Steps 1 through 8
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('mistri');
  const [dailyRate, setDailyRate] = useState(700);
  const [area, setArea] = useState('');
  const [coords, setCoords] = useState(null);
  const [createdWorker, setCreatedWorker] = useState(null);

  // Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      setError('कृपया 10 अंकों का मोबाइल नंबर डालें।');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOtp(phone);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP भेजने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('कृपया 4 अंकों का OTP दर्ज करें।');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(phone, otp);
      setToken(res.token);
      if (res.hasProfile && res.worker) {
        login(res.token, res.worker);
        navigate(returnTo, { replace: true });
        return;
      }
      setStep(3); // Proceed to name
    } catch (err) {
      setError(err.response?.data?.message || 'गलत OTP दर्ज किया गया है।');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: name.trim() || 'Worker',
        phone: phone.trim(),
        photo: photo || photoPreview || '',
        skill: selectedSkill,
        dailyRate: Number(dailyRate),
        area: area.trim() || areaText || city || 'इलाका दर्ज नहीं किया',
        city: city || '',
        state: state || '',
        location: coords || { lat: 27.15, long: 78.39 },
        availability: true,
        registrationSource: 'app'
      };

      const res = await createWorker(payload);
      setCreatedWorker(res.worker);
      login(token, res.worker);
      if (returnTo === '/ai-chat') {
        navigate('/ai-chat', { replace: true });
      } else {
        setStep(8); // Success step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'प्रोफाइल बनाने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-2 space-y-4">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between gap-1 px-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full flex-1 transition-all duration-300 ${
              s <= step ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Step 1: Phone */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="glass-card rounded-2xl p-6 border border-slate-700 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-4xl block">📱</span>
            <h2 className="text-xl font-extrabold text-white">
              अपना मोबाइल नंबर डालें
            </h2>
            <p className="text-xs text-slate-400">
              आपको 4 अंकों का OTP कोड प्राप्त होगा
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              मोबाइल नंबर:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-base font-black text-emerald-400">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="9876543210"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-3 pl-14 pr-4 text-xl font-extrabold text-white outline-none focus:border-emerald-500 min-h-[52px]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-950/60 transition min-h-[52px] text-base"
          >
            {loading ? 'OTP भेजा जा रहा है...' : 'OTP भेजें'}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            OTP आपके मोबाइल पर SMS के जरिए आएगा।
          </p>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="glass-card rounded-2xl p-6 border border-slate-700 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-4xl block">🔐</span>
            <h2 className="text-xl font-extrabold text-white">
              OTP डालें
            </h2>
            <p className="text-xs text-slate-400">
              मोबाइल नंबर <strong className="text-emerald-400">+91 {phone}</strong> पर भेजा गया
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} length={4} />

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-950/60 transition min-h-[52px] text-base"
            >
              {loading ? 'सत्यापित किया जा रहा है...' : 'OTP सत्यापित करें'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-200 py-2 min-h-[44px]"
            >
              नंबर बदलें
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Name */}
      {step === 3 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-700 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-4xl block">👤</span>
            <h2 className="text-xl font-extrabold text-white">
              आपका नाम क्या है?
            </h2>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. रमेश कुमार"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-3 px-4 text-xl font-extrabold text-white outline-none focus:border-emerald-500 min-h-[52px]"
            />

            <VoiceInput onSpeechResult={(txt) => setName(txt)} />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!name.trim()) {
                setError('कृपया अपना नाम दर्ज करें।');
                return;
              }
              setError('');
              setStep(4);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition min-h-[52px] text-base flex items-center justify-center gap-2"
          >
            <span>आगे बढ़ें</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 4: Photo */}
      {step === 4 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-700 space-y-5 text-center">
          <div className="space-y-1">
            <span className="text-4xl block">📸</span>
            <h2 className="text-xl font-extrabold text-white">
              अपनी फोटो लगाएं
            </h2>
            <p className="text-xs text-slate-400">
              फोटो लगाने से काम जल्दी मिलता है
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400">
                <Camera className="w-12 h-12" />
              </div>
            )}

            <label className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-400 font-bold py-2.5 px-4 rounded-xl cursor-pointer transition min-h-[44px] flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>{photoPreview ? 'फोटो बदलें' : 'कैमरा या फोटो अपलोड करें'}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setStep(5)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition min-h-[52px] text-base flex items-center justify-center gap-2"
          >
            <span>{photoPreview ? 'आगे बढ़ें' : 'फोटो के बिना आगे बढ़ें'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 5: Skill */}
      {step === 5 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-700 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-4xl block">🧰</span>
            <h2 className="text-xl font-extrabold text-white">
              आप कौन सा काम करते हैं?
            </h2>
            <p className="text-xs text-slate-400">
              अपना मुख्य काम चुनें
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SKILLS_LIST.map((skill) => (
              <SkillCard
                key={skill.id}
                title={skill.title}
                emoji={skill.emoji}
                selected={selectedSkill === skill.id}
                onClick={() => setSelectedSkill(skill.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(6)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition min-h-[52px] text-base flex items-center justify-center gap-2"
          >
            <span>आगे बढ़ें</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 6: Daily Rate */}
      {step === 6 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-700 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-4xl block">💰</span>
            <h2 className="text-xl font-extrabold text-white">
              अपनी दिहाड़ी तय करें
            </h2>
          </div>

          <RateStepper
            value={dailyRate}
            onChange={(val) => setDailyRate(val)}
          />

          <button
            type="button"
            onClick={() => setStep(7)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition min-h-[52px] text-base flex items-center justify-center gap-2"
          >
            <span>आगे बढ़ें</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 7: Location */}
      {step === 7 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-700 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-4xl block">📍</span>
            <h2 className="text-xl font-extrabold text-white">
              आप कहाँ काम करते हैं?
            </h2>
            <p className="text-xs text-slate-400">
              इलाका या शहर दर्ज करें
            </p>
          </div>

          <div className="space-y-3">
            <LocationButton
              onLocationFetched={(c) => {
                setCoords({ lat: c.lat, long: c.long });
                if (c.area || c.city) {
                  setArea(c.area && c.city && c.area.toLowerCase() !== c.city.toLowerCase()
                    ? `${c.area}, ${c.city}`
                    : (c.area || c.city));
                } else if (areaText) {
                  setArea(areaText);
                }
              }}
            />

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                इलाके या शहर का नाम:
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="उदा. Shikohabad, Firozabad, Agra"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-3 px-4 text-lg font-bold text-white outline-none focus:border-emerald-500 min-h-[52px]"
              />
            </div>

            <VoiceInput onSpeechResult={(txt) => setArea(txt)} />
          </div>

          <button
            type="button"
            onClick={handleFinishSignup}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition min-h-[52px] text-base flex items-center justify-center gap-2"
          >
            {loading ? 'प्रोफाइल बन रहा है...' : 'प्रोफाइल पूरा करें 🎉'}
          </button>
        </div>
      )}

      {/* Step 8: Success */}
      {step === 8 && createdWorker && (
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/60 text-center space-y-5 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">
              🎉 आपका प्रोफाइल बन गया!
            </h2>
            <p className="text-xs text-emerald-400 font-bold">
              अब मालिक आपको काम के लिए ढूंढ सकते हैं
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 text-left border border-slate-700 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <span className="text-xs text-slate-400">नाम:</span>
              <span className="text-sm font-extrabold text-white">{createdWorker.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <span className="text-xs text-slate-400">काम:</span>
              <span className="text-sm font-extrabold text-amber-400">{createdWorker.skill}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <span className="text-xs text-slate-400">दिहाड़ी:</span>
              <span className="text-sm font-extrabold text-emerald-400">₹{createdWorker.dailyRate} / दिन</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">इलाका:</span>
              <span className="text-sm font-extrabold text-slate-200">📍 {createdWorker.area}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/worker/dashboard')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition min-h-[52px] text-base"
          >
            माई डैशबोर्ड पर जाएं 🚀
          </button>
        </div>
      )}
    </div>
  );
}
