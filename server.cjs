/**
 * AI Voice Calling Agent Backend Server
 * Target Phone Line: +91 9210728686
 * Integrates REAL WhatsApp Dispatching via Twilio & Meta Cloud API
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { sendRealWhatsAppMessage } = require('./whatsapp_service.cjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = __dirname;
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const FAQS_FILE = path.join(DATA_DIR, 'faqs.json');

function readJsonFile(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

let initialFaqs = [
  {
    id: "1",
    question: "Office ya shop kahan par hai?",
    keywords: ["location", "address", "kahan", "office", "pata", "place"],
    answer: "Humara main office New Delhi mein hai. Subah 9 baje se raat 8 baje tak visit kar sakte hain."
  },
  {
    id: "2",
    question: "Working hours aur timings kya hain?",
    keywords: ["time", "timing", "hours", "open", "close", "kab"],
    answer: "Humara office Monday se Saturday, subah 9 baje se raat 8 baje tak khula rehta hai."
  },
  {
    id: "3",
    question: "Services aur pricing details kya hain?",
    keywords: ["service", "price", "rate", "cost", "pricing", "kitna"],
    answer: "Main pricing brochure aapke real WhatsApp number par bhej raha hoon."
  }
];

let agentConfig = {
  phoneNumber: "+919210728686",
  agentName: "Vikram (Clear Hindi Voice Agent)",
  language: "hi-IN",
  welcomeGreeting: "Namaste! Main Vikram bol raha hoon 9210728686 helpline se. Bataiye kya kaam hai?"
};

async function executeTools(userSpeech, callerNumber = "+919876543210") {
  const text = userSpeech.toLowerCase();
  const executedTools = [];
  let whatsappAction = null;

  if (text.includes("price") || text.includes("cost") || text.includes("pricing") || text.includes("rate") || text.includes("catalogue") || text.includes("whatsapp")) {
    const msg = `📄 Hello! Main Vikram 9210728686 helpline se. Yeh raha aapka Official Pricing & Services Brochure: https://9210728686.com/pricing-pdf`;
    
    // Call REAL WhatsApp sender
    const realResult = await sendRealWhatsAppMessage({
      toPhone: callerNumber,
      message: msg
    });

    executedTools.push({ tool: "send_real_whatsapp", status: realResult.success ? "DELIVERED_REAL" : "SIMULATION_MODE" });

    whatsappAction = {
      type: "REAL_WHATSAPP",
      realSent: realResult.success,
      provider: realResult.provider || "SIMULATED",
      message: msg
    };
  }

  return { executedTools, whatsappAction };
}

function getAIAnswer(userSpeech) {
  if (!userSpeech || userSpeech.trim() === "") {
    return "Kripya apna sawal dohraein, aawaz clear nahi aayi.";
  }

  const clean = userSpeech.toLowerCase();
  const faqs = readJsonFile(FAQS_FILE, initialFaqs);

  for (const faq of faqs) {
    const keywords = Array.isArray(faq.keywords) ? faq.keywords : faq.keywords.split(',').map(k => k.trim());
    if (keywords.some(kw => clean.includes(kw.toLowerCase()))) {
      return faq.answer;
    }
  }

  return "Shukriya aapke sawal ke liye! Main details aapke WhatsApp par bhej raha hoon.";
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    faqs: readJsonFile(FAQS_FILE, initialFaqs),
    leads: readJsonFile(LEADS_FILE, []),
    logs: readJsonFile(LOGS_FILE, []),
    config: agentConfig
  });
});

// Endpoint to Trigger REAL WhatsApp message to ANY phone number!
app.post('/api/send-real-whatsapp', async (req, res) => {
  const { phone, message, accountSid, authToken, metaToken, metaPhoneId } = req.body;

  if (accountSid) process.env.TWILIO_ACCOUNT_SID = accountSid;
  if (authToken) process.env.TWILIO_AUTH_TOKEN = authToken;
  if (metaToken) process.env.META_WHATSAPP_TOKEN = metaToken;
  if (metaPhoneId) process.env.META_PHONE_ID = metaPhoneId;

  const result = await sendRealWhatsAppMessage({
    toPhone: phone || "+919876543210",
    message: message || "Hello! Real WhatsApp message from 9210728686 AI Calling Agent!"
  });

  res.json({ success: result.success, details: result });
});

app.post('/api/process-call', async (req, res) => {
  const { speech, callerNumber } = req.body;
  const answer = getAIAnswer(speech);
  const { executedTools, whatsappAction } = await executeTools(speech, callerNumber || "+919876543210");

  res.json({
    success: true,
    question: speech,
    answer,
    executedTools,
    whatsappAction
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🤖 AI VOICE AGENT SERVER WITH REAL WHATSAPP DISPATCH ON PORT ${PORT}`);
  console.log(`===================================================`);
});
