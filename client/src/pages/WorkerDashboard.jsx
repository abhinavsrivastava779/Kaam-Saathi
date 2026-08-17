import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Edit, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateAvailability, updateWorker, getMyWorkerProfile } from '../api/worker';
import AvailabilityToggle from '../components/AvailabilityToggle';
import RateStepper from '../components/RateStepper';
import LocationButton from '../components/LocationButton';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import KycPanel from '../components/KycPanel';
import { getSkillInfo, formatCurrency } from '../utils/formatters';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { worker, updateWorkerState, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [editRate, setEditRate] = useState(worker?.dailyRate || 700);

  const [isEditingArea, setIsEditingArea] = useState(false);
  const [editArea, setEditArea] = useState(worker?.area || '');

  useEffect(() => {
    if (!worker) {
      navigate('/worker/signup');
      return;
    }
    // Fetch latest fresh worker record
    if (worker._id) {
      getMyWorkerProfile()
        .then((res) => {
          if (res.worker) updateWorkerState(res.worker);
        })
        .catch(() => {});
    }
  }, []);

  if (!worker) return <Loading message="प्रोफाइल लोड हो रहा है..." />;

  const skillInfo = getSkillInfo(worker.skill);

  const handleToggleAvailability = async (newVal) => {
    setToggleLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await updateAvailability(worker._id, newVal);
      updateWorkerState({ availability: newVal });
      setSuccessMsg(newVal ? 'आप अब "आज उपलब्ध" हैं! 🎉' : 'आप अब "उपलब्ध नहीं" हैं।');
    } catch (err) {
      setError(err.response?.data?.message || 'स्थिति बदलने में समस्या आई।');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleSaveRate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await updateWorker(worker._id, { dailyRate: editRate });
      updateWorkerState({ dailyRate: editRate });
      setIsEditingRate(false);
      setSuccessMsg('दिहाड़ी अपडेट हो गई!');
    } catch (err) {
      setError('दिहाड़ी अपडेट नहीं हो पाई।');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArea = async () => {
    if (!editArea.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await updateWorker(worker._id, { area: editArea.trim() });
      updateWorkerState({ area: editArea.trim() });
      setIsEditingArea(false);
      setSuccessMsg('इलाका अपडेट हो गया!');
    } catch (err) {
      setError('इलाका अपडेट नहीं हो पाया।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-2 space-y-4">
      {/* Top Banner Header */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=0D9488&color=fff&size=128`}
            alt={worker.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white truncate">
                {worker.name}
              </h2>
              <button
                onClick={logout}
                title="लॉगआउट"
                className="p-2 text-slate-400 hover:text-rose-400 min-h-[44px]"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm font-extrabold text-amber-400 flex items-center gap-1 mt-0.5">
              <span>{skillInfo.emoji}</span>
              <span>{skillInfo.title}</span>
            </p>

            <p className="text-xs font-semibold text-slate-400 mt-1">
              📱 +91 {worker.phone}
            </p>
          </div>
        </div>

        {/* Big Availability Toggle */}
        <AvailabilityToggle
          availability={worker.availability}
          onToggle={handleToggleAvailability}
          loading={toggleLoading}
        />
      </div>

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 p-3 rounded-xl text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}
      <KycPanel />

      {/* Details & Fast Actions */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700 space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
          माई प्रोफाइल विवरण
        </h3>

        {/* Rate Row */}
        <div className="bg-slate-800 rounded-xl p-3.5 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">आपकी 1 दिन की दिहाड़ी:</span>
            <span className="text-lg font-black text-emerald-400">
              {formatCurrency(worker.dailyRate)} / दिन
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditRate(worker.dailyRate);
              setIsEditingRate(!isEditingRate);
            }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-2 px-3 rounded-lg transition min-h-[44px] flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4 text-amber-400" />
            <span>✏️ दिहाड़ी बदलें</span>
          </button>
        </div>

        {isEditingRate && (
          <div className="bg-slate-800/90 rounded-xl p-4 border border-emerald-500/50 space-y-3">
            <RateStepper value={editRate} onChange={setEditRate} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveRate}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl min-h-[44px]"
              >
                सेव करें
              </button>
              <button
                type="button"
                onClick={() => setIsEditingRate(false)}
                className="bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl min-h-[44px]"
              >
                रद्द करें
              </button>
            </div>
          </div>
        )}

        {/* Location Row */}
        <div className="bg-slate-800 rounded-xl p-3.5 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block">काम करने का इलाका:</span>
            <span className="text-base font-extrabold text-white flex items-center gap-1">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              {worker.area}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditArea(worker.area);
              setIsEditingArea(!isEditingArea);
            }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-2 px-3 rounded-lg transition min-h-[44px] flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>📍 लोकेशन बदलें</span>
          </button>
        </div>

        {isEditingArea && (
          <div className="bg-slate-800/90 rounded-xl p-4 border border-emerald-500/50 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              नया इलाका दर्ज करें:
            </label>
            <input
              type="text"
              value={editArea}
              onChange={(e) => setEditArea(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-white font-bold outline-none min-h-[48px]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveArea}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl min-h-[44px]"
              >
                सेव करें
              </button>
              <button
                type="button"
                onClick={() => setIsEditingArea(false)}
                className="bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl min-h-[44px]"
              >
                रद्द करें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
