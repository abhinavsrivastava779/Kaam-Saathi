import React, { useState } from 'react';
import { Phone, MapPin, AlertCircle, Star } from 'lucide-react';
import { getSkillInfo, formatCurrency } from '../utils/formatters';
import { formatDistance } from '../utils/haversine';
import { shareLocation, addWorkerRating } from '../api/worker';
import { useLocationState } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function WorkerCard({ worker }) {
  const { coords } = useLocationState();
  const { employer } = useAuth();
  const { t } = useLanguage();
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [rating, setRating] = useState(Number(worker.ratingAverage || 0));
  const [ratingCount, setRatingCount] = useState(Number(worker.ratingCount || 0));
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const skillInfo = getSkillInfo(worker.skill);

  const handleSendLocation = async () => {
    setSharing(true);
    setShareError('');

    try {
      if (!coords || !coords.lat || !coords.long) {
        setShareError('लोकेशन नहीं मिल पाई। कृपया फोन की Location चालू करें।');
        setSharing(false);
        return;
      }

      const res = await shareLocation({
        workerPhone: worker.phone,
        employerLat: coords.lat,
        employerLong: coords.long
      });

      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
      } else if (res.smsUrl) {
        window.location.href = res.smsUrl;
      }
    } catch (err) {
      setShareError('लोकेशन शेयर करने में समस्या आई।');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-700/80 shadow-xl space-y-3.5 relative overflow-hidden">
      {/* Top Banner: Availability Status */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide ${
            worker.availability
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}
        >
          {worker.availability ? `🟢 ${t('आज उपलब्ध')}` : `🔴 ${t('आज उपलब्ध नहीं')}`} {worker.kyc?.status === 'verified' ? <span className="ml-2 text-emerald-300">✓ {t('KYC Verified')}</span> : <span className="ml-2 text-amber-300">• Not Verified</span>}
        </span>

        {worker.distanceKm !== null && worker.distanceKm !== undefined && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            {formatDistance(worker.distanceKm)}
          </span>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="flex items-start gap-3.5">
        <div className="relative">
          <img
            src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=0D9488&color=fff&size=128`}
            alt={worker.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-600 bg-slate-800 shadow-md"
          />
          <span className="absolute -bottom-1 -right-1 text-xl bg-slate-900 rounded-full p-0.5 border border-slate-700">
            {skillInfo.emoji}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-white truncate leading-snug">
            {worker.name}
          </h3>
          
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-bold text-amber-400">
              {skillInfo.emoji} {skillInfo.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-0.5" aria-label={`रेटिंग ${rating || 0} स्टार`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-amber-300">
              {rating > 0 ? rating.toFixed(1) : t('नई प्रोफाइल')}
            </span>
            {ratingCount > 0 && (
              <span className="text-[10px] text-slate-500">({ratingCount})</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80">
            <span className="text-xs font-medium text-slate-400">
              📍 {worker.area}
            </span>
            <span className="text-base font-black text-emerald-400">
              {formatCurrency(worker.dailyRate)} <span className="text-xs font-normal text-slate-400">/ दिन</span>
            </span>
          </div>
        </div>
      </div>

      {employer && <div className="flex items-center justify-between rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2.5">
        <div>
          <p className="text-[11px] font-bold text-slate-300">{t('काम कैसा लगा? रेटिंग दें')}</p>
          {ratingMessage && <p className="text-[10px] text-emerald-400 mt-0.5">{ratingMessage}</p>}
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={ratingBusy}
              onClick={async () => {
                setRatingBusy(true);
                setRatingMessage('');
                try {
                  const res = await addWorkerRating(worker._id, star);
                  setRating(Number(res.worker?.ratingAverage || rating));
                  setRatingCount(Number(res.worker?.ratingCount || ratingCount));
                  setRatingMessage(t('रेटिंग सेव हो गई ✓'));
                } catch (err) {
                  setRatingMessage(err.response?.data?.message || 'रेटिंग सेव नहीं हुई।');
                } finally {
                  setRatingBusy(false);
                }
              }}
              className="p-0.5 disabled:opacity-50"
              aria-label={`${star} स्टार`}
            >
              <Star className={`w-5 h-5 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-amber-300'}`} />
            </button>
          ))}
        </div>
      </div>}

      {/* Share Error Alert */}
      {shareError && (
        <div className="bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs rounded-xl p-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{shareError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <a
          onClick={(e) => {
            e.preventDefault();
            const raw = String(worker.phone || '').trim();
            const phone = /^(\+91)?\d{10}$/.test(raw) && raw.length === 10 ? `+91${raw}` : raw;
            window.location.href = `tel:${phone}`;
          }}
          href={`tel:${String(worker.phone || '').replace(/^(?!\+91)(\d{10})$/, '+91$1')}`}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold py-3 px-3 rounded-xl transition shadow-lg shadow-emerald-900/30 text-sm min-h-[48px]"
        >
          <Phone className="w-4 h-4" />
          <span>{t('📞 कॉल करें')}</span>
        </a>

        <button
          type="button"
          onClick={handleSendLocation}
          disabled={sharing}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-emerald-400 font-extrabold py-3 px-3 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition text-sm min-h-[48px]"
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>{sharing ? 'Sending...' : t('📍 लोकेशन भेजें')}</span>
        </button>
      </div>
    </div>
  );
}
