// Script to set Telegram webhook URL directly
const https = require('https');

// Get command line arguments
const args = process.argv.slice(2);
const WEBHOOK_URL = args[0] || 'https://bantuan-kita.vercel.app/api/telegram-webhook';
const TELEGRAM_BOT_TOKEN = args[1] || process.env.TELEGRAM_BOT_TOKEN;

// Display usage information if no token is provided
if (!TELEGRAM_BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN not provided');
  console.log('Usage: node set-webhook.js [WEBHOOK_URL] [BOT_TOKEN]');
  process.exit(1);
}

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function setWebhook() {
  try {
    console.log(`Setting webhook to: ${WEBHOOK_URL}`);
    const setWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    const data = {
      url: WEBHOOK_URL,
      allowed_updates: ['callback_query', 'message'],
      drop_pending_updates: true,
    };

    const result = await makeRequest(setWebhookUrl, 'POST', data);
    console.log('Result:', result);

    if (!result.ok) {
      throw new Error(`Failed to set webhook: ${result.description}`);
    }

    console.log('Webhook set successfully!');
    
    // Get webhook info
    console.log('\nGetting webhook info...');
    const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
    const infoResult = await makeRequest(infoUrl);
    console.log('Webhook info:', infoResult);
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
}

setWebhook();