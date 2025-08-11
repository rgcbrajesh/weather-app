const twilio = require('twilio');

// Initialize Twilio client only if credentials are available
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    console.warn('Twilio client initialization failed:', error.message);
    client = null;
  }
}

/**
 * Send SMS using Twilio
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS message content
 * @returns {Promise} - Twilio response
 */
const sendSMS = async (to, message) => {
  try {
    if (!client) {
      throw new Error('Twilio client not configured. Please check your environment variables.');
    }

    // Format phone number (remove + if present and add country code if needed)
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      // Add +1 for US numbers (you can modify this for your country)
      formattedNumber = `+1${to.replace(/\D/g, '')}`;
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log(`SMS sent successfully to ${to}. SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

/**
 * Send low stock alert to admin
 * @param {Array} lowStockParts - Array of parts with low stock
 * @param {string} adminPhone - Admin phone number
 * @returns {Promise} - SMS response
 */
const sendLowStockAlert = async (lowStockParts, adminPhone) => {
  try {
    const message = `LOW STOCK ALERT!\n\n${lowStockParts.map(part => 
      `${part.name}: ${part.quantity} remaining (threshold: ${part.threshold})`
    ).join('\n')}\n\nPlease restock soon!`;
    
    return await sendSMS(adminPhone, message);
  } catch (error) {
    console.error('Low stock alert failed:', error);
    throw error;
  }
};

/**
 * Send custom SMS message
 * @param {string} to - Recipient phone number
 * @param {string} message - Custom message
 * @returns {Promise} - SMS response
 */
const sendCustomSMS = async (to, message) => {
  return await sendSMS(to, message);
};

module.exports = {
  sendSMS,
  sendLowStockAlert,
  sendCustomSMS
};
