import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, Settings, 
  BookOpen, History, Server, Sparkles, CheckCircle2, 
  HelpCircle, MessageSquare, ShieldCheck, Play, Pause,
  Plus, Trash2, Edit3, Copy, Check, ArrowRight, RefreshCw,
  Search, Filter, ExternalLink, Zap, Users, Clock, Globe,
  Send, Smartphone, Calendar, UserCheck, PhoneCall, BarChart3,
  Sliders, Layers, Radio, AlertCircle, FileText, CheckSquare, X, Key
} from 'lucide-react';

export default function App() {
  const TARGET_NUMBER = "+91 9210728686";
  const API_BASE = "http://localhost:5000";

  const [activeTab, setActiveTab] = useState('real-whatsapp'); // Default to Real WhatsApp Setup
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [executedFunctions, setExecutedFunctions] = useState([]);
  const [latestWhatsAppNotification, setLatestWhatsAppNotification] = useState(null);

  // Real WhatsApp Credentials & Test Form State
  const [realPhoneInput, setRealPhoneInput] = useState('+91');
  const [realMessageInput, setRealMessageInput] = useState('Namaste! 9210728686 AI Calling Agent se yeh real WhatsApp message aapke phone par aaya hai.');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [sendingReal, setSendingReal] = useState(false);
  const [realSendResult, setRealSendResult] = useState(null);

  const [agentConfig, setAgentConfig] = useState({
    agentName: "Vikram (Clear Hindi Agent)",
    phoneNumber: "+91 9210728686",
    language: "hi-IN",
    welcomeGreeting: "Namaste! Main Vikram bol raha hoon 9210728686 helpline se. Bataiye kya kaam hai?"
  });

  const [transcript, setTranscript] = useState([
    { id: 1, speaker: 'Agent', text: `Namaste! Main Vikram bol raha hoon 9210728686 helpline se. Bataiye kya kaam hai?`, time: '00:01' }
  ]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [crmLeads, setCrmLeads] = useState([]);
  const [callLogs, setCallLogs] = useState([]);

  const recognitionRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/data`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.faqs) setFaqs(data.faqs);
          if (data.leads) setCrmLeads(data.leads);
          if (data.logs) setCallLogs(data.logs);
        }
      })
      .catch(err => console.log("Fallback active", err));
  }, []);

  // Send REAL WhatsApp Message API Call
  const handleSendRealWhatsApp = (e) => {
    e.preventDefault();
    if (!realPhoneInput || realPhoneInput === '+91') {
      alert("Kripya apna real mobile number enter karein (+91...)");
      return;
    }

    setSendingReal(true);
    setRealSendResult(null);

    fetch(`${API_BASE}/api/send-real-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: realPhoneInput,
        message: realMessageInput,
        accountSid: twilioSid,
        authToken: twilioToken,
        metaToken: metaToken,
        metaPhoneId: metaPhoneId
      })
    })
      .then(res => res.json())
      .then(data => {
        setSendingReal(false);
        setRealSendResult(data);
        if (data.success) {
          alert(`✅ REAL WhatsApp message dispatched to ${realPhoneInput}! Check your phone!`);
        }
      })
      .catch(err => {
        setSendingReal(false);
        alert("Error sending message: " + err.message);
      });
  };

  const processUserQuestion = (userText) => {
    if (!userText || userText.trim() === '') return;

    fetch(`${API_BASE}/api/process-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speech: userText, callerNumber: realPhoneInput || "+919876543210" })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.whatsappAction) {
            setLatestWhatsAppNotification(data.whatsappAction);
          }
          setTranscript(prev => [
            ...prev,
            { id: Date.now(), speaker: 'Caller', text: userText, time: '00:05' },
            { id: Date.now() + 1, speaker: 'Agent (Vikram)', text: data.answer, time: '00:06' }
          ]);
        }
      });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-white/10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Send className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white">
                Real WhatsApp & Voice Call Integration
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LINE: {TARGET_NUMBER}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Send REAL WhatsApp Messages & PSTN Voice Calls to any actual mobile number (+91)
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('real-whatsapp')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wider transition-all whitespace-nowrap uppercase ${
            activeTab === 'real-whatsapp'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/35 border border-emerald-400/40'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'
          }`}
        >
          <Send className="w-4 h-4 text-emerald-400" />
          📲 Send REAL WhatsApp Message
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all whitespace-nowrap uppercase ${
            activeTab === 'simulator'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/35 border border-violet-400/40'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'
          }`}
        >
          <Phone className="w-4 h-4" />
          Voice Call Simulator
        </button>
      </div>

      {/* TAB: REAL WHATSAPP SENDER FORM */}
      {activeTab === 'real-whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                <Send className="w-6 h-6 text-emerald-400" />
                <h3 className="font-extrabold text-white text-lg">Send REAL WhatsApp Message to Your Mobile Phone</h3>
              </div>

              <form onSubmit={handleSendRealWhatsApp} className="space-y-4">
                <div>
                  <label className="form-label text-emerald-400">Recipient Real Mobile Number (With +91)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={realPhoneInput}
                    onChange={(e) => setRealPhoneInput(e.target.value)}
                    className="form-input text-base font-mono font-bold text-emerald-300"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Apna real mobile number enter karein jise check karna chahte hain.</p>
                </div>

                <div>
                  <label className="form-label">WhatsApp Message Text</label>
                  <textarea
                    rows={3}
                    value={realMessageInput}
                    onChange={(e) => setRealMessageInput(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>

                {/* API Credentials accordion */}
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Key className="w-4 h-4 text-violet-400" /> WhatsApp API Gateway Credentials (Twilio / Meta Cloud API)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold block mb-1">Twilio Account SID</label>
                      <input
                        type="text"
                        placeholder="ACxxxxxxxxxxxxxxxx"
                        value={twilioSid}
                        onChange={(e) => setTwilioSid(e.target.value)}
                        className="form-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold block mb-1">Twilio Auth Token</label>
                      <input
                        type="password"
                        placeholder="Auth Token"
                        value={twilioToken}
                        onChange={(e) => setTwilioToken(e.target.value)}
                        className="form-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">OR Meta WhatsApp Access Token (Optional)</label>
                    <input
                      type="password"
                      placeholder="EAAGxxxxxxxxxxxxxxxx"
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                      className="form-input text-xs font-mono"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={sendingReal}
                  className="btn-primary w-full justify-center text-sm py-3 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl shadow-emerald-900/30"
                >
                  <Send className="w-5 h-5" /> {sendingReal ? 'Sending Real WhatsApp Message...' : 'Send Real WhatsApp Message Now'}
                </button>
              </form>

              {/* Result Status */}
              {realSendResult && (
                <div className={`p-4 rounded-xl text-xs border space-y-1 ${
                  realSendResult.success 
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
                    : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                }`}>
                  <strong className="block text-sm">
                    {realSendResult.success ? '✅ REAL WHATSAPP DISPATCH SUCCESS!' : '⚠️ SIMULATION MODE (MISSING API KEYS)'}
                  </strong>
                  <p>{JSON.stringify(realSendResult.details)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Guide Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-extrabold text-white text-base border-b border-white/10 pb-3">Why API Keys are Required for Real WhatsApp</h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  WhatsApp, Meta & Telecom Networks do not allow sending messages to mobile numbers without verified Business API credentials (to prevent spam).
                </p>
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs">Option A: Twilio Sandbox (Free Test)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Create free account on <a href="https://twilio.com" target="_blank" className="text-cyan-400 font-bold underline">Twilio.com</a></li>
                    <li>Copy your <strong>Account SID</strong> & <strong>Auth Token</strong> into the inputs on the left.</li>
                    <li>Send "join &lt;code&gt;" to Twilio sandbox WhatsApp number.</li>
                    <li>Click <strong>"Send Real WhatsApp Message Now"</strong>!</li>
                  </ol>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-cyan-400 text-xs">Option B: Meta WhatsApp Cloud API (Free 1,000 msgs/month)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Go to <a href="https://developers.facebook.com" target="_blank" className="text-cyan-400 font-bold underline">developers.facebook.com</a></li>
                    <li>Create Meta WhatsApp App & copy Access Token.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="glass-panel p-6">
          <h3 className="text-white font-bold mb-4">In-Browser Call Simulator for {TARGET_NUMBER}</h3>
          <p className="text-slate-400 text-xs">Test microphone voice speech & automated replies!</p>
        </div>
      )}
    </div>
  );
}
