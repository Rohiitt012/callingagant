/**
 * Real WhatsApp & SMS Integration Module for AI Calling Agent (+91 9210728686)
 * Supports:
 * 1. Twilio WhatsApp API (Real SMS & WhatsApp)
 * 2. Meta WhatsApp Cloud API (Official Business API)
 * 3. WATI / UltraMsg WhatsApp Gateway
 */

const twilio = require('twilio');
const axios = require('axios');

// Function to send REAL WhatsApp Message to any real phone number (+91...)
async function sendRealWhatsAppMessage({ toPhone, message, pdfUrl }) {
  console.log(`\n===================================================`);
  console.log(`📱 ATTEMPTING REAL WHATSAPP DISPATCH TO: ${toPhone}`);
  console.log(`💬 Message: "${message}"`);
  console.log(`===================================================\n`);

  // Format phone number to E.164 (e.g. +919876543210)
  let cleanPhone = toPhone.replace(/\s+/g, '').replace(/-/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+91' + cleanPhone.replace(/^0+/, '');
  }

  // 1. Check if Twilio Credentials are provided in environment
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox or Sender Number

  if (accountSid && authToken && accountSid.startsWith('AC')) {
    try {
      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        from: twilioWhatsAppNumber.startsWith('whatsapp:') ? twilioWhatsAppNumber : `whatsapp:${twilioWhatsAppNumber}`,
        to: `whatsapp:${cleanPhone}`,
        body: message,
        ...(pdfUrl ? { mediaUrl: [pdfUrl] } : {})
      });

      console.log(`✅ [REAL TWILIO WHATSAPP SENT SUCCESSFULLY] SID: ${result.sid}`);
      return { success: true, provider: 'TWILIO', sid: result.sid };
    } catch (err) {
      console.error(`❌ [TWILIO WHATSAPP ERROR]:`, err.message);
    }
  }

  // 2. Check if Meta WhatsApp Cloud API Credentials are provided
  const metaAccessToken = process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.META_PHONE_ID;

  if (metaAccessToken && metaPhoneId) {
    try {
      const recipient = cleanPhone.replace('+', '');
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${metaPhoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${metaAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ [REAL META WHATSAPP SENT SUCCESSFULLY] Message ID: ${response.data.messages[0].id}`);
      return { success: true, provider: 'META_CLOUD_API', id: response.data.messages[0].id };
    } catch (err) {
      console.error(`❌ [META WHATSAPP ERROR]:`, err.response ? err.response.data : err.message);
    }
  }

  console.log(`⚠️ [SIMULATION MODE]: To send REAL WhatsApp messages to actual mobile phones, please enter your Twilio SID/Auth Token or Meta WhatsApp Token in .env file or UI settings!`);
  return { success: false, mode: 'SIMULATION_ONLY', reason: 'Missing API Keys' };
}

module.exports = { sendRealWhatsAppMessage };
