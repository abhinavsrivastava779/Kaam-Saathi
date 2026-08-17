import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Filter, RefreshCw, MapPin, ArrowLeft, Search } from 'lucide-react';
import { getNearbyWorkers } from '../api/worker';
import WorkerCard from '../components/WorkerCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { SKILLS_LIST, getSkillInfo } from '../utils/formatters';

export default function EmployerResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const skillParam = searchParams.get('skill') || 'all';
  const maxDistParam = searchParams.get('maxDistance') || 'all';
  const latParam = searchParams.get('latitude');
  const longParam = searchParams.get('longitude');
  const areaParam = searchParams.get('area');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (skillParam !== 'all') params.skill = skillParam;
      if (maxDistParam !== 'all') params.maxDistance = maxDistParam;
      if (latParam) params.latitude = latParam;
      if (longParam) params.longitude = longParam;
      if (areaParam) params.area = areaParam;

      const res = await getNearbyWorkers(params);
      setWorkers(res.workers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'मज़दूर सूची लोड करने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [searchParams]);

  const filteredWorkers = workers.filter((w) => (onlyAvailable ? w.availability : true));
  const skillInfo = getSkillInfo(skillParam);

  return (
    <div className="max-w-md mx-auto py-2 space-y-4">
      {/* Top Filter Summary */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">खोज परिणाम:</span>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-1.5">
              <span>{skillInfo.emoji}</span>
              <span>{skillParam === 'all' ? 'सभी कामगार' : skillInfo.title}</span>
            </h2>
          </div>

          <button
            onClick={() => navigate('/employer/search')}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition min-h-[44px] flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>फिल्टर बदलें</span>
          </button>
        </div>

        {/* Toggle Only Available */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-slate-200">
              केवल "🟢 आज उपलब्ध" दिखाएं
            </span>
          </label>

          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
            {filteredWorkers.length} मिले
          </span>
        </div>
      </div>

      {loading && <Loading message="पास के कामगारों की सूची लोड हो रही है..." />}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && filteredWorkers.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center space-y-3 border border-slate-700">
          <span className="text-5xl block">🔍</span>
          <h3 className="text-lg font-black text-white">
            कोई मज़दूर नहीं मिला
          </h3>
          <p className="text-xs text-slate-400">
            कृपया दूरी का दायरा बढ़ाएं या कोई दूसरा काम चुनें।
          </p>
          <button
            onClick={() => navigate('/employer/search')}
            className="bg-amber-500 text-slate-950 font-extrabold py-3 px-6 rounded-xl min-h-[48px] text-sm"
          >
            दूरी या काम बदलें
          </button>
        </div>
      )}

      {/* Workers Cards List */}
      {!loading && !error && filteredWorkers.length > 0 && (
        <div className="space-y-3.5">
          {filteredWorkers.map((worker) => (
            <WorkerCard key={worker._id} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}
