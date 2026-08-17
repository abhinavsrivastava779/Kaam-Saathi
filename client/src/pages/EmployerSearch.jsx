import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, ArrowRight } from 'lucide-react';
import SkillCard from '../components/SkillCard';
import LocationButton from '../components/LocationButton';
import { SKILLS_LIST } from '../utils/formatters';
import { useLocationState } from '../context/LocationContext';
import { searchLocation } from '../api/location';
import { useAuth } from '../context/AuthContext';

export default function EmployerSearch() {
  const navigate = useNavigate();
  const { coords, setCoords, areaText, setAreaText, city } = useLocationState();
  const { employer } = useAuth();

  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all'); // 0.5, 1, 2, 5, all
  if (!employer) { navigate('/employer/login', { replace: true }); return null; }

  const distanceFilters = [
    { value: '0.5', label: '500 मीटर' },
    { value: '1', label: '1 KM' },
    { value: '2', label: '2 KM' },
    { value: '5', label: '5 KM' },
    { value: 'all', label: 'सभी दूरी' },
  ];

  const handleSearch = async () => {
    const params = new URLSearchParams();
    let searchCoords = coords;

    // A manually entered area must take priority over the browser GPS.
    // This prevents a GPS point in one place from being used when the user
    // explicitly searched for another place such as Shikohabad.
    if (areaText.trim()) {
      try {
        const location = await searchLocation(areaText.trim());
        if (location?.lat && location?.long) {
          searchCoords = { lat: Number(location.lat), long: Number(location.long) };
        }
      } catch (error) {
        if (!searchCoords) {
          window.alert('यह इलाका नहीं मिला। कृपया सही शहर/इलाका डालें या मेरी लोकेशन लें।');
          return;
        }
      }
    }
    if (selectedSkill && selectedSkill !== 'all') params.append('skill', selectedSkill);
    if (selectedDistance && selectedDistance !== 'all') params.append('maxDistance', selectedDistance);
    if (searchCoords && searchCoords.lat && searchCoords.long) {
      params.append('latitude', searchCoords.lat);
      params.append('longitude', searchCoords.long);
    }
    if (areaText) params.append('area', areaText);

    navigate(`/employer/results?${params.toString()}`);
  };

  return (
    <div className="max-w-md mx-auto py-2 space-y-5">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-4xl block">🔎</span>
        <h2 className="text-xl font-extrabold text-white">
          आपको कौन सा काम करने वाला चाहिए?
        </h2>
        <p className="text-xs text-slate-400">
          कोई लॉगिन आवश्यक नहीं है। सीधे कॉल करें या लोकेशन भेजें।
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 shadow-lg">
        <p className="text-sm font-black text-amber-300">⚠️ जरूरी सूचना</p>
        <p className="text-xs leading-5 text-amber-100/80 mt-1">
          काम पर रखने से पहले <b className="text-amber-300">Verified Worker</b> को प्राथमिकता दें।
          KYC verification पहचान की पुष्टि में मदद करती है, फिर भी काम शुरू करने से पहले
          अपनी तरफ से जरूरी सावधानी और पहचान की जांच करें।
        </p>
      </div>

      {/* Skill Selection Grid */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          कौशल (Skill) चुनें:
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <SkillCard
            title="सभी काम"
            emoji="🛠️"
            selected={selectedSkill === 'all'}
            onClick={() => setSelectedSkill('all')}
          />
          {SKILLS_LIST.map((s) => (
            <SkillCard
              key={s.id}
              title={s.title}
              emoji={s.emoji}
              selected={selectedSkill === s.id}
              onClick={() => setSelectedSkill(s.id)}
            />
          ))}
        </div>
      </div>

      {/* Distance Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>दूरी (Distance) चुनें:</span>
          {coords && <span className="text-emerald-400 text-[11px] font-bold">✓ GPS एक्टिव</span>}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {distanceFilters.map((df) => (
            <button
              key={df.value}
              type="button"
              onClick={() => setSelectedDistance(df.value)}
              className={`py-2.5 px-2 rounded-xl text-xs font-black transition border min-h-[48px] ${
                selectedDistance === df.value
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-2">
          <LocationButton onLocationFetched={(c) => setCoords(c)} />

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 shrink-0">इलाका:</span>
            <input
              type="text"
              value={areaText}
              onChange={(e) => setAreaText(e.target.value)}
              placeholder="उदा. कृष्णा नगर"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none min-h-[40px]"
            />
          </div>
        </div>
      </div>

      {/* Submit Search Button */}
      <button
        type="button"
        onClick={handleSearch}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-amber-950/60 transition text-lg flex items-center justify-center gap-3 min-h-[60px]"
      >
        <Search className="w-6 h-6 text-slate-950" />
        <span>मज़दूर खोजें</span>
      </button>
    </div>
  );
}
