import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Volume2, Mic, CheckCircle2, RotateCcw } from 'lucide-react';
import { startIvr, sendIvrInput } from '../api/ivr';
import ErrorMessage from '../components/ErrorMessage';

export default function IvrSimulator() {
  const [inCall, setInCall] = useState(false);
  const [phone, setPhone] = useState('+919876543210');
  const [currentStep, setCurrentStep] = useState('WELCOME');
  const [promptText, setPromptText] = useState('काम साथी IVR कॉल शुरू करने के लिए डायल बटन दबाएं।');
  const [sessionData, setSessionData] = useState({});
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  // Speak prompt text using SpeechSynthesis hi-IN if available
  const speakPrompt = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartCall = async () => {
    setLoading(true);
    setError('');
    setCompleted(false);

    try {
      const res = await startIvr(phone);
      setInCall(true);
      setCurrentStep(res.currentStep);
      setPromptText(res.promptText);
      setSessionData(res.data || {});
      speakPrompt(res.promptText);
    } catch (err) {
      setError('IVR कॉल शुरू नहीं हो पाई।');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setInCall(false);
    setPromptText('कॉल समाप्त हो गई है।');
  };

  const handleKeyPress = async (key) => {
    if (!inCall || completed) return;
    setLoading(true);
    setError('');

    try {
      const res = await sendIvrInput({
        phone,
        inputKey: key.toString(),
        inputText: textInput || key.toString()
      });

      setCurrentStep(res.currentStep);
      setPromptText(res.promptText);
      setSessionData(res.data || {});
      setTextInput('');
      speakPrompt(res.promptText);

      if (res.isCompleted) {
        setCompleted(true);
      }
    } catch (err) {
      setError('कीपैड इनपुट प्रोसेस करने में त्रुटि।');
    } finally {
      setLoading(false);
    }
  };

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <div className="max-w-md mx-auto py-2 space-y-4">
      {/* Phone Screen Container */}
      <div className="glass-card rounded-3xl p-5 border-2 border-slate-700 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Top Call Status Bar */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${inCall ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
              {inCall ? 'कॉल चालू है (In Call)' : 'कॉल कटी हुई है'}
            </span>
            <span>🤖 IVR SIMULATOR</span>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-left min-h-[90px] flex items-start gap-2.5">
            <Volume2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs font-extrabold text-amber-200 leading-relaxed">
              {promptText}
            </p>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Input box for text/name/area steps */}
        {inCall && !completed && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 block">
              वैकल्पिक: नाम / इलाका / दिहाड़ी टाइप करें (या कीपैड दबाएं):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="उदा. रमेश कुमार / 700 / Shikohabad"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              />
              <button
                type="button"
                onClick={() => handleKeyPress(textInput || '1')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs"
              >
                भेजें
              </button>
            </div>
          </div>
        )}

        {/* Dial Keypad Grid */}
        <div className="space-y-2 pt-1">
          {keypad.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-3 gap-2.5">
              {row.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeyPress(k)}
                  disabled={!inCall || completed || loading}
                  className={`py-3.5 rounded-2xl text-2xl font-black transition active:scale-90 flex flex-col items-center justify-center min-h-[56px] ${
                    inCall && !completed
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <span>{k}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Call Control Actions */}
        <div className="pt-2">
          {!inCall ? (
            <button
              type="button"
              onClick={handleStartCall}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-950/60 transition text-base flex items-center justify-center gap-2 min-h-[56px]"
            >
              <Phone className="w-5 h-5" />
              <span>📞 IVR कॉल चालू करें</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEndCall}
              className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-rose-950/60 transition text-base flex items-center justify-center gap-2 min-h-[56px]"
            >
              <PhoneOff className="w-5 h-5" />
              <span>कॉल समाप्त करें</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Progress Card */}
      {inCall && sessionData && (
        <div className="glass-card rounded-2xl p-4 border border-slate-700 text-xs space-y-1.5">
          <h4 className="font-extrabold text-emerald-400">IVR डेटा स्थिति:</h4>
          <pre className="bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
