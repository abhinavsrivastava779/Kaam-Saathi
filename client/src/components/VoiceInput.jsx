import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

/**
 * Reliable browser speech input.
 * Web Speech API can stop automatically after a pause, so while the user has
 * explicitly started listening we restart it a few times instead of leaving
 * the UI stuck in a "listening" state.
 */
export default function VoiceInput({ onSpeechResult, label = '🎤 बोलकर बताएं' }) {
  const [listening, setListening] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);
  const restartTimerRef = useRef(null);
  const resultDeliveredRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(Boolean(SpeechRecognition));

    return () => {
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.abort(); } catch (_) {}
    };
  }, []);

  const stopListening = () => {
    shouldKeepListeningRef.current = false;
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch (_) {}
    setListening(false);
  };

  const handleStartListening = () => {
    setErrorText('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setErrorText('इस ब्राउज़र में voice input उपलब्ध नहीं है। Chrome/Edge में localhost या HTTPS पर खोलें।');
      return;
    }

    shouldKeepListeningRef.current = true;
    resultDeliveredRef.current = false;

    const startRecognition = () => {
      if (!shouldKeepListeningRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
          setListening(true);
          setErrorText('');
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript.trim() && !resultDeliveredRef.current) {
            resultDeliveredRef.current = true;
            shouldKeepListeningRef.current = false;
            onSpeechResult?.(finalTranscript.trim());
            setListening(false);
            try { recognition.stop(); } catch (_) {}
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            shouldKeepListeningRef.current = false;
            setErrorText('माइक्रोफोन की अनुमति दें। Chrome में address bar के 🔒 icon से Microphone → Allow करें।');
            setListening(false);
            return;
          }

          if (event.error === 'audio-capture') {
            shouldKeepListeningRef.current = false;
            setErrorText('माइक्रोफोन नहीं मिला। कोई दूसरा mic चुनें या उसे reconnect करें।');
            setListening(false);
            return;
          }

          if (event.error !== 'aborted') {
            setErrorText('आवाज़ समझ नहीं आई। फिर से बोलें।');
          }
        };

        recognition.onend = () => {
          if (!shouldKeepListeningRef.current || resultDeliveredRef.current) {
            setListening(false);
            return;
          }

          // Chrome often ends recognition after a short silence. Restart it
          // so the user can continue speaking without pressing the button again.
          restartTimerRef.current = window.setTimeout(startRecognition, 250);
        };

        recognition.start();
      } catch (err) {
        if (shouldKeepListeningRef.current) {
          restartTimerRef.current = window.setTimeout(startRecognition, 400);
        } else {
          setListening(false);
          setErrorText('वॉइस इनपुट शुरू नहीं हो पाया। दोबारा कोशिश करें।');
        }
      }
    };

    startRecognition();
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={listening ? stopListening : handleStartListening}
        className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border font-bold text-sm transition min-h-[48px] active:scale-95 ${
          listening
            ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
        }`}
      >
        {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-400" />}
        <span>{listening ? 'सुन रहा हूँ… बोलते रहें (रोकने के लिए दबाएं)' : label}</span>
      </button>

      {!supported && !errorText && (
        <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl">
          Voice input के लिए Chrome/Edge का उपयोग करें।
        </div>
      )}

      {errorText && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs p-2.5 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorText}</span>
        </div>
      )}
    </div>
  );
}
