const { Vonage } = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

async function sendSMS(from, to, text) {
  const response = await vonage.sms.send({ from, to, text });
  console.log(response);
}

module.exports = sendSMS;
