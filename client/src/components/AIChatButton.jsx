import React from 'react';
import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AIChatButton() {
  const navigate = useNavigate();
  const { worker, employer } = useAuth();
  return (
    <button
      type="button"
      onClick={() => navigate('/ai-chat')}
      aria-label="Kaam Saathi AI Chatbot"
      className="fixed right-4 bottom-24 z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-950/60 border-2 border-emerald-300/40 flex items-center justify-center"
      title={worker || employer ? 'Kaam Saathi AI' : 'Login karke AI Chatbot use karein'}
    >
      <Bot className="w-7 h-7" />
    </button>
  );
}
