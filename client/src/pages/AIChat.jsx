import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, ArrowLeft, LogIn } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendAiMessage } from '../api/ai';
import VoiceInput from '../components/VoiceInput';

export default function AIChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, worker, employer, authReady } = useAuth();
  const loggedIn = !!token;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (loggedIn && messages.length === 0) {
      const name = worker?.name || employer?.name || '';
      setMessages([{
        role: 'assistant',
        content: `Namaste ${name ? name + ' 👋' : '👋'}! Main Kaam Manch AI hoon. Aap Hinglish me mujhse worker, KYC, availability, registration ya app ke baare me pooch sakte ho.`
      }]);
    }
  }, [loggedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!authReady) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="glass-card rounded-3xl p-7 border border-emerald-500/30">
          <Bot className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
          <p className="mt-4 text-slate-300 font-bold">Login session check ho raha hai…</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="glass-card rounded-3xl p-7 border border-emerald-500/30 text-center space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <Bot className="w-11 h-11 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">🤖 Kaam Manch AI</h1>
            <p className="text-sm text-slate-400 mt-2">
              AI Chatbot use karne se pehle mobile OTP se login zaroori hai.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/worker/signup', { state: { from: location.pathname } })}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl py-4 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" /> Worker Login / Register
          </button>
          <button
            type="button"
            onClick={() => navigate('/employer/login', { state: { from: location.pathname } })}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl py-4"
          >
            Employer Login / Register
          </button>
          <p className="text-[11px] text-slate-500">Guest users ko AI chat access nahi milega.</p>
        </div>
      </div>
    );
  }

  const send = async (text = input) => {
    const message = String(text || '').trim();
    if (!message || loading || sendingRef.current) return;
    sendingRef.current = true;

    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : String(m.content || '')
    }));

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAiMessage(message, history);
      const replyText = typeof res?.reply === 'string' && res.reply.trim()
        ? res.reply.trim()
        : (typeof res?.message === 'string' && res.message.trim()
          ? res.message.trim()
          : 'AI response nahi aa paaya. Kripya dubara try karein.');

      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch (err) {
      let errorMsg = 'AI se connect nahi ho paaya. Thodi der baad try karo.';
      if (err.response?.status === 401) {
        errorMsg = 'Login session expire ho gaya. Home se dobara login karo.';
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMsg = 'AI response lene me thoda time lag raha hai. Kripya dubara try karein.';
      } else if (typeof err.response?.data?.message === 'string') {
        errorMsg = err.response.data.message;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg
      }]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-140px)] min-h-[520px] flex flex-col rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-2xl">
      <div className="bg-emerald-950 p-4 border-b border-emerald-900 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-900 text-slate-300 flex items-center justify-center hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-black text-white">Kaam Manch AI</h1>
          <p className="text-[10px] text-emerald-400 font-bold">● Online • Hinglish support</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const contentStr = typeof m?.content === 'string' ? m.content : String(m?.content || '');
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[86%] rounded-2xl p-3 text-sm font-medium whitespace-pre-line leading-relaxed ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
              }`}>
                {contentStr}
              </div>
            </div>
          );
        })}
        {loading && <div className="text-xs text-slate-500 italic">AI reply bana raha hai…</div>}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Hinglish me poochho..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-12 rounded-xl bg-emerald-600 disabled:opacity-40 text-white flex items-center justify-center hover:bg-emerald-500 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <VoiceInput
          label="🎤 Bolkar AI se poochho"
          onSpeechResult={(text) => {
            if (!loading) {
              setInput(text);
              send(text);
            }
          }}
        />
      </div>
    </div>
  );
}
