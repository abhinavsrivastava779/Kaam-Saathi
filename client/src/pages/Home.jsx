import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Star,
  X,
  ChevronRight
} from 'lucide-react';

import { getHelplineStatus } from '../api/ivr';
import { submitFeedback } from '../api/feedback';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import AppGuide from '../components/AppGuide';

export default function Home() {
  const navigate = useNavigate();

  const { worker, employer } = useAuth();
  const { t } = useLanguage();

  const [helplineInfo, setHelplineInfo] = useState(null);

  // =====================================================
  // FEEDBACK STATES
  // =====================================================

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // =====================================================
  // HELPLINE
  // =====================================================

  useEffect(() => {
    getHelplineStatus()
      .then((data) => {
        setHelplineInfo(data);
      })
      .catch(() => {});
  }, []);

  // =====================================================
  // SET LOGGED-IN USER NAME
  // =====================================================

  useEffect(() => {
    if (worker) {
      setFeedbackName(worker.name || '');
      return;
    }

    if (employer) {
      setFeedbackName(employer.name || '');
      return;
    }

    setFeedbackName('');
  }, [worker, employer]);

  // =====================================================
  // FEEDBACK HELPERS
  // =====================================================

  const getUserRole = () => {
    if (worker) return 'worker';
    if (employer) return 'employer';

    return 'guest';
  };

  const getUserPhone = () => {
    if (worker?.phone) {
      return worker.phone;
    }

    if (employer?.phone) {
      return employer.phone;
    }

    return '';
  };

  // =====================================================
  // OPEN FEEDBACK MODAL
  // =====================================================

  const openFeedback = () => {
    setFeedbackError('');
    setFeedbackMessage('');
    setFeedbackText('');

    if (worker?.name) {
      setFeedbackName(worker.name);
    } else if (employer?.name) {
      setFeedbackName(employer.name);
    } else {
      setFeedbackName('');
    }

    setShowFeedback(true);
  };

  // =====================================================
  // CLOSE FEEDBACK MODAL
  // =====================================================

  const closeFeedback = () => {
    if (feedbackLoading) {
      return;
    }

    setShowFeedback(false);
    setFeedbackError('');
    setFeedbackMessage('');
  };

  // =====================================================
  // SUBMIT FEEDBACK
  // =====================================================

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    const comment = feedbackText.trim();

    // Empty feedback
    if (!comment) {
      setFeedbackError('कृपया अपना feedback लिखें।');
      return;
    }

    // Minimum feedback length
    if (comment.length < 3) {
      setFeedbackError('Feedback थोड़ा विस्तार से लिखें।');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');
    setFeedbackMessage('');

    try {
      await submitFeedback({
        name: feedbackName.trim() || 'Anonymous',
        phone: getUserPhone(),
        role: getUserRole(),
        comment
      });

      // Success message
      setFeedbackMessage(
        '✓ आपका feedback successfully submit हो गया।'
      );

      // Clear text
      setFeedbackText('');

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackMessage('');
      }, 1500);

    } catch (error) {
      console.error('Feedback submit error:', error);

      setFeedbackError(
        error?.response?.data?.message ||
        error?.message ||
        'Feedback submit नहीं हुआ। कृपया दोबारा कोशिश करें।'
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <div className="space-y-6 pb-6">

        {/* =====================================================
            HERO BRANDING
        ====================================================== */}

        <div className="text-center pt-4 pb-2 space-y-2">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-600/20 border-2 border-emerald-500/40 shadow-xl mb-1">
            <span className="text-5xl select-none">
              👷
            </span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            काम मंच
          </h1>

          <p className="text-base font-bold text-emerald-400 tracking-wide">
            {t('काम और मज़दूर, दोनों आसानी से खोजें')}
          </p>

        </div>


        {/* =====================================================
            APP GUIDE
        ====================================================== */}

        <div className="px-1">
          <AppGuide />
        </div>


        {/* =====================================================
            MAIN ACTION BUTTONS
        ====================================================== */}

        <div className="space-y-3.5 px-1">

          {/* ===================================================
              BUTTON 1: MUJHE KAAM CHAHIYE
          =================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                worker
                  ? '/worker/dashboard'
                  : '/worker/signup'
              )
            }
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white shadow-xl shadow-emerald-950/60 border-2 border-emerald-400/40 transition group min-h-[72px]"
          >

            <div className="flex items-center gap-4 text-left">

              <span className="text-4xl">
                👷
              </span>

              <div>

                <span className="text-xl font-extrabold block leading-tight">
                  {worker
                    ? t('माई प्रोफाइल देखें')
                    : t('मुझे काम चाहिए')}
                </span>

                <span className="text-xs font-semibold opacity-90 block">
                  {worker
                    ? t('अपनी उपलब्धता और दिहाड़ी बदलें')
                    : t('अपना प्रोफाइल बनाएं और रोज़ाना दिहाड़ी पाएं')}
                </span>

              </div>

            </div>

            <ChevronRight className="w-7 h-7 shrink-0 text-emerald-200 group-hover:translate-x-1 transition-transform" />

          </button>


          {/* ===================================================
              BUTTON 2: MUJHE MAZDOOR CHAHIYE
          =================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                employer
                  ? '/employer/dashboard'
                  : '/employer/login'
              )
            }
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:scale-[0.98] text-white shadow-xl border-2 border-amber-500/50 transition group min-h-[72px]"
          >

            <div className="flex items-center gap-4 text-left">

              <span className="text-4xl">
                🏗️
              </span>

              <div>

                <span className="text-xl font-extrabold text-amber-400 block leading-tight">
                  {t('मुझे मज़दूर चाहिए')}
                </span>

                <span className="text-xs font-semibold text-slate-300 block">
                  {t('पास के मिस्त्री, पेंटर, प्लंबर सीधे खोजें')}
                </span>

              </div>

            </div>

            <ChevronRight className="w-7 h-7 shrink-0 text-amber-400 group-hover:translate-x-1 transition-transform" />

          </button>

        </div>


        {/* =====================================================
            REVIEW & FEEDBACK BUTTON
        ====================================================== */}

        <div className="px-1">

          <button
            type="button"
            onClick={openFeedback}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border-2 border-amber-500/40 transition active:scale-[0.98]"
          >

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center">

                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />

              </div>

              <div className="text-left">

                <p className="text-base font-black text-white">
                  ⭐ Review & Feedback
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  हमें बताएं आपका experience कैसा रहा
                </p>

              </div>

            </div>

            <ChevronRight className="w-6 h-6 text-amber-400" />

          </button>

        </div>


        {/* =====================================================
            HELPLINE BANNER
        ====================================================== */}

        <div className="bg-slate-800/90 rounded-2xl p-4 border border-amber-500/30 shadow-lg space-y-2">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">

                <PhoneCall className="w-5 h-5" />

              </div>

              <div>

                <h3 className="text-base font-extrabold text-white">
                  ☎️ मदद चाहिए?
                </h3>

                <p className="text-xs font-medium text-amber-300">
                  हेल्पलाइन — सुबह 6 बजे से शाम 6 बजे तक
                </p>

              </div>

            </div>

            <Link
              to="/help"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 px-3.5 rounded-xl transition min-h-[44px] flex items-center justify-center"
            >
              {t('कॉल करें')}
            </Link>

          </div>

          {helplineInfo && (
            <p className="text-[11px] font-semibold text-slate-400 text-center pt-1 border-t border-slate-700/60">
              {helplineInfo.message}
            </p>
          )}

        </div>


        {/* =====================================================
            LOW-LITERACY PROFILE CREATION OPTIONS
        ====================================================== */}

        <div className="space-y-2.5 pt-2">

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            बिना स्मार्टफोन या ऐप के जुड़ें:
          </h3>

          <div className="grid grid-cols-3 gap-2">

            {/* WhatsApp */}

            <Link
              to="/whatsapp"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition min-h-[80px]"
            >

              <span className="text-2xl mb-1">
                💬
              </span>

              <span className="text-xs font-bold text-emerald-400">
                WhatsApp से ID बनाएं
              </span>

            </Link>


            {/* Missed Call */}

            <Link
              to="/missed-call"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition min-h-[80px]"
            >

              <span className="text-2xl mb-1">
                📵
              </span>

              <span className="text-xs font-bold text-amber-400">
                मिस्ड कॉल
              </span>

            </Link>


            {/* IVR */}

            <Link
              to="/ivr"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition min-h-[80px]"
            >

              <span className="text-2xl mb-1">
                🤖
              </span>

              <span className="text-xs font-bold text-blue-400">
                IVR आवाज़
              </span>

            </Link>

          </div>

        </div>

      </div>


      {/* =====================================================
          FEEDBACK MODAL
      ====================================================== */}

      {showFeedback && (

        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeFeedback();
            }
          }}
        >

          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">

            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between p-5 border-b border-slate-800">

              <div>

                <h2 className="text-xl font-black text-white">
                  ⭐ Review & Feedback
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  App के बारे में अपना feedback दें
                </p>

              </div>

              <button
                type="button"
                onClick={closeFeedback}
                disabled={feedbackLoading}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center disabled:opacity-50"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* =================================================
                MODAL FORM
            ================================================== */}

            <form
              onSubmit={handleFeedbackSubmit}
              className="p-5 space-y-4"
            >

              {/* =================================================
                  NAME
              ================================================== */}

              <div>

                <label className="block text-xs font-bold text-slate-400 mb-2">
                  नाम
                </label>

                <input
                  type="text"
                  value={feedbackName}
                  onChange={(e) => {
                    setFeedbackName(e.target.value);
                  }}
                  placeholder="आपका नाम"
                  maxLength={100}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none"
                />

              </div>


              {/* =================================================
                  FEEDBACK TEXT
              ================================================== */}

              <div>

                <label className="block text-xs font-bold text-slate-400 mb-2">
                  आपका Feedback
                </label>

                <textarea
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);

                    // Clear previous error when user starts typing
                    if (feedbackError) {
                      setFeedbackError('');
                    }

                    if (feedbackMessage) {
                      setFeedbackMessage('');
                    }
                  }}
                  placeholder="App के बारे में अपना feedback लिखें..."
                  rows={5}
                  maxLength={1000}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none resize-none"
                />

                <p className="text-[10px] text-slate-500 text-right mt-1">
                  {feedbackText.length}/1000
                </p>

              </div>


              {/* =================================================
                  ERROR MESSAGE
              ================================================== */}

              {feedbackError && (

                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3">

                  <p className="text-sm text-rose-300 font-semibold">
                    {feedbackError}
                  </p>

                </div>

              )}


              {/* =================================================
                  SUCCESS MESSAGE
              ================================================== */}

              {feedbackMessage && (

                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3">

                  <p className="text-sm text-emerald-300 font-bold">
                    {feedbackMessage}
                  </p>

                </div>

              )}


              {/* =================================================
                  SUBMIT BUTTON
              ================================================== */}

              <button
                type="submit"
                disabled={
                  feedbackLoading ||
                  !feedbackText.trim()
                }
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-black py-3.5 rounded-xl transition active:scale-[0.98]"
              >

                {feedbackLoading
                  ? 'Submit हो रहा है...'
                  : '⭐ Submit Feedback'}

              </button>

            </form>

          </div>

        </div>

      )}

    </>
  );
}