/**
 * AI Calling Agent Webhook & API Server
 * Target Phone Number: +91 9210728686
 * 
 * Features:
 * - Twilio TwiML / Exotel Webhook handlers for live phone calls
 * - AI Voice Speech-to-Text response system
 * - Knowledge Base Q&A matching algorithm
 * - Live Call Analytics & Logs persistence
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Agent Configuration
let agentConfig = {
  phoneNumber: "+919210728686",
  agentName: "Aisha (Hindi & English Voice Agent)",
  language: "hi-IN", // Hindi / English mix
  welcomeGreeting: "Namaste! Aapne 9210728686 pe call kiya hai. Main Aisha hoon, aapki AI assistant. Aapka kya sawal hai?",
  systemPrompt: `You are Aisha, an intelligent, helpful voice calling agent answering calls for number 9210728686.
You speak clearly in polite Hindi/Hinglish and English. Keep responses concise (1-3 sentences) suitable for voice phone calls.`,
  businessDetails: {
    name: "Automated AI Support Helpline",
    hours: "9:00 AM - 8:00 PM (Monday to Saturday)",
    address: "New Delhi, India",
    services: "Customer Assistance, Booking, Information Desk, Support Queries"
  },
  faqs: [
    {
      id: "1",
      question: "Shop / Office location kahan hai?",
      keywords: ["location", "address", "kahan", "kahan hai", "office", "pata", "place"],
      answer: "Humara main office New Delhi, India mein hai. Agar aap direct aana chahte hain toh 9 AM se 8 PM ke beech visit kar sakte hain."
    },
    {
      id: "2",
      question: "Working hours / Timings kya hain?",
      keywords: ["time", "timing", "hours", "kab khula", "open", "close", "kya time"],
      answer: "Humara working hours Monday se Saturday, subah 9:00 baje se raat 8:00 baje tak hai. Sunday ko off rehta hai."
    },
    {
      id: "3",
      question: "Services aur pricing kya hai?",
      keywords: ["service", "price", "rate", "cost", "kitne ka", "pricing", "plans"],
      answer: "Hum customer support, booking services aur general consultation provide karte hain. Detailed pricing ke liye hum aapko WhatsApp pe catalog bhej sakte hain."
    },
    {
      id: "4",
      question: "Appointment book karna hai",
      keywords: ["appointment", "book", "booking", "schedule", "slot", "milna"],
      answer: "Ji bilkul! Main aapka appointment schedule kar sakti hoon. Aap kripya apna naam aur preferred date & time bata dijiye."
    }
  ]
};

// In-Memory Call Logs
let callLogs = [
  {
    id: "CALL-9842",
    phoneNumber: "+91 98765 43210",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    duration: "1m 45s",
    status: "Completed",
    sentiment: "Positive",
    summary: "Customer inquired about working hours and office address.",
    transcript: [
      { speaker: "Agent", text: "Namaste! Aapne 9210728686 pe call kiya hai. Main Aisha hoon, aapka kya sawal hai?", time: "00:02" },
      { speaker: "Caller", text: "Haan hello, aapka office kahan par hai?", time: "00:08" },
      { speaker: "Agent", text: "Humara main office New Delhi, India mein hai. Subah 9 baje se raat 8 baje tak visit kar sakte hain.", time: "00:15" },
      { speaker: "Caller", text: "Okay dhanyawad!", time: "00:20" }
    ]
  },
  {
    id: "CALL-9841",
    phoneNumber: "+91 91234 56789",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    duration: "2m 10s",
    status: "Completed",
    sentiment: "Neutral",
    summary: "Customer requested pricing information for consultation services.",
    transcript: [
      { speaker: "Agent", text: "Namaste! Aapne 9210728686 pe call kiya hai. Main Aisha hoon, aapka kya sawal hai?", time: "00:02" },
      { speaker: "Caller", text: "Mujhe pricing ke baare mein poochna tha.", time: "00:07" },
      { speaker: "Agent", text: "Hum custom consultation provide karte hain. Detailed price chart hum aapko SMS ya WhatsApp pe share kar denge.", time: "00:18" }
    ]
  }
];

// Helper: Match Question to FAQ or AI Response
function getAIResponse(userSpeech) {
  if (!userSpeech || userSpeech.trim() === "") {
    return "Kripya apna sawal punah dohraein, mujhe clear awaz nahi aayi.";
  }

  const cleanSpeech = userSpeech.toLowerCase();

  // Search Knowledge Base FAQs by keywords
  for (const faq of agentConfig.faqs) {
    const isMatch = faq.keywords.some(kw => cleanSpeech.includes(kw.toLowerCase()));
    if (isMatch) {
      return faq.answer;
    }
  }

  // Generic AI Smart Fallback (or Gemini / OpenAI API integration point)
  if (cleanSpeech.includes("hello") || cleanSpeech.includes("namaste") || cleanSpeech.includes("hi")) {
    return "Namaste! Aap 9210728686 helpline pe hain. Bataiye main aapki kya madad kar sakti hoon?";
  }
  
  if (cleanSpeech.includes("bye") || cleanSpeech.includes("thank") || cleanSpeech.includes("dhanyawad")) {
    return "Aapka call karne ke liye dhanyawad! Have a great day ahead!";
  }

  return `Shukriya aapke sawal ke liye. Main aapke query ko note kar rahi hoon. Kripya apna naam bata dijiye taaki hum humari team se contact karwa sakein.`;
}

// -------------------------------------------------------------
// API Endpoints for Frontend Control Center
// -------------------------------------------------------------

// Get Agent Config
app.get('/api/config', (req, res) => {
  res.json({ success: true, data: agentConfig });
});

// Update Agent Config
app.post('/api/config', (req, res) => {
  agentConfig = { ...agentConfig, ...req.body };
  res.json({ success: true, message: "Agent configuration updated successfully!", data: agentConfig });
});

// Get Call Logs
app.get('/api/logs', (req, res) => {
  res.json({ success: true, data: callLogs });
});

// Add Simulated Call Log
app.post('/api/logs', (req, res) => {
  const newLog = {
    id: `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
    phoneNumber: req.body.phoneNumber || "+91 92107 28686",
    timestamp: new Date().toISOString(),
    duration: req.body.duration || "1m 10s",
    status: "Completed",
    sentiment: req.body.sentiment || "Positive",
    summary: req.body.summary || "In-browser voice call test.",
    transcript: req.body.transcript || []
  };
  callLogs.unshift(newLog);
  res.json({ success: true, data: newLog });
});

// Process Query via AI Engine (For Browser Call Simulation & Webhooks)
app.post('/api/ask', (req, res) => {
  const { question } = req.body;
  const answer = getAIResponse(question);
  res.json({ success: true, question, answer });
});

// -------------------------------------------------------------
// Telephony Webhooks (Twilio & Exotel Integration for +91 9210728686)
// -------------------------------------------------------------

// 1. Twilio Incoming Call Endpoint
app.post('/voice/incoming', (req, res) => {
  const callerNumber = req.body.From || "Unknown Caller";
  console.log(`[Twilio Call Received] From: ${callerNumber} to ${agentConfig.phoneNumber}`);

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="hi-IN">${agentConfig.welcomeGreeting}</Say>
    <Gather input="speech" timeout="5" speechTimeout="auto" action="/voice/respond" method="POST">
        <Say voice="Polly.Aditi" language="hi-IN">Aap apna sawal boliye.</Say>
    </Gather>
    <Say voice="Polly.Aditi" language="hi-IN">Aapki awaz nahi sun payi. Call terminate ho raha hai. Dhanyawad.</Say>
</Response>`;

  res.type('text/xml');
  res.send(twimlResponse);
});

// 2. Twilio Speech Response Handler
app.post('/voice/respond', (req, res) => {
  const userSpeech = req.body.SpeechResult || "";
  console.log(`[Twilio User Said]: ${userSpeech}`);

  const aiReply = getAIResponse(userSpeech);

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="hi-IN">${aiReply}</Say>
    <Gather input="speech" timeout="5" speechTimeout="auto" action="/voice/respond" method="POST">
        <Say voice="Polly.Aditi" language="hi-IN">Kyu aur koi jankari chahiye?</Say>
    </Gather>
    <Say voice="Polly.Aditi" language="hi-IN">Aapka call karne ke liye shukriya. Bye!</Say>
</Response>`;

  res.type('text/xml');
  res.send(twimlResponse);
});

// 3. Exotel Webhook Endpoint (For Indian Mobile Numbers like 9210728686)
app.post('/voice/exotel/incoming', (req, res) => {
  const { CallFrom, CallTo } = req.body;
  console.log(`[Exotel Call] From: ${CallFrom} to ${CallTo}`);

  res.json({
    select: {
      action: "passthrough",
      url: `${req.protocol}://${req.get('host')}/voice/exotel/respond`
    }
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🤖 AI CALLING AGENT SERVER IS RUNNING ON PORT ${PORT}`);
  console.log(`📱 Assigned Number: ${agentConfig.phoneNumber}`);
  console.log(`🔗 Twilio Webhook URL: http://localhost:${PORT}/voice/incoming`);
  console.log(`===================================================`);
});
