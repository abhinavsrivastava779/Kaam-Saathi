import React, { useState } from 'react';
import { MessageSquare, Send, MapPin } from 'lucide-react';
import API from '../api/axios';
import LocationButton from '../components/LocationButton';
import VoiceInput from '../components/VoiceInput';
import { useLocationState } from '../context/LocationContext';

export default function WhatsappOnboarding() {
  const [botStep, setBotStep] = useState('ASK_PHONE');
  const [botData, setBotData] = useState({});
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'नमस्ते! काम साथी में आपका स्वागत है। Chatbot से ID बनाने के लिए अपना मोबाइल नंबर बताएं।'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { areaText, city, state } = useLocationState();

  const handleStartRealWhatsapp = () => {
    const number = String(import.meta.env.VITE_WHATSAPP_NUMBER || '918533860377').replace(/\D/g, '');
    const message = 'Namaste Kaam Saathi 👋\nMujhe Kaam Saathi par ID banani hai.';
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSendBotMessage = async (textToSend, locationPayload = null) => {
    const text = String(textToSend ?? userInput).trim();
    if (!text && !locationPayload) return;

    const displayText = locationPayload
      ? `📍 Location share: ${locationPayload.area || areaText || 'GPS location'}`
      : text;

    const newMessages = [...messages, { sender: 'user', text: displayText }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const res = await API.post('/whatsapp/process', {
        step: botStep,
        phone: botData.phone || '+919876543210',
        text,
        data: botData,
        location: locationPayload
      });

      if (res.data.success) {
        setBotStep(res.data.currentStep);
        setBotData(res.data.data);
        setMessages([
          ...newMessages,
          { sender: 'bot', text: res.data.replyMessage }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: 'bot', text: err.response?.data?.message || 'कुछ समस्या आई। कृपया दोबारा प्रयास करें।' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBotLocation = async (coords) => {
    if (!coords) return;

    const locationPayload = {
      lat: coords.lat,
      long: coords.long,
      area: coords.area || areaText || '',
      city: coords.city || city || '',
      state: coords.state || state || ''
    };

    await handleSendBotMessage('', locationPayload);
  };

  const showLocationButton = botStep === 'ASK_LOCATION' && !loading;

  return (
    <div className="max-w-md mx-auto py-2 space-y-5">
      <div className="glass-card rounded-2xl p-6 border border-emerald-500/40 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
          <MessageSquare className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">📱 WhatsApp से ID बनाएं</h2>
          <p className="text-xs font-semibold text-slate-300">
            WhatsApp पर सीधे बात करके अपनी Kaam Saathi ID बनाएं। नीचे वाला simulator केवल demo/testing के लिए है।
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartRealWhatsapp}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg transition min-h-[52px] text-base flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          <span>📱 WhatsApp se ID banaye</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-700 overflow-hidden">
        <div className="bg-emerald-950 p-3.5 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl">🤖</div>
          <div>
            <h3 className="text-sm font-extrabold text-white">काम साथी ID Bot (Demo)</h3>
            <span className="text-[10px] text-emerald-400 font-bold block">
              ● ऑनलाइन • Location + Voice enabled
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3 min-h-[260px] max-h-[360px] overflow-y-auto bg-slate-950/60">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs font-semibold whitespace-pre-line leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-slate-400 font-semibold italic">
              Chatbot जवाब तैयार कर रहा है...
            </div>
          )}
        </div>

        {showLocationButton && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>GPS से इलाका + शहर अपने-आप भरें</span>
            </div>
            <LocationButton
              onLocationFetched={handleBotLocation}
              label="📍 मेरी location लें"
            />
            <p className="text-[10px] text-slate-500 text-center">उदाहरण: कृष्णा नगर, मथुरा</p>
          </div>
        )}

        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendBotMessage()}
              placeholder="जवाब दर्ज करें..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => handleSendBotMessage()}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <VoiceInput
            label="🎤 Chatbot को बोलकर जवाब दें"
            onSpeechResult={(text) => {
              setUserInput(text);
              handleSendBotMessage(text);
            }}
          />
        </div>
      </div>
    </div>
  );
}
