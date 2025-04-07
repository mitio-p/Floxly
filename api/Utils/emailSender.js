const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mitko5450@gmail.com',
    pass: process.env.GOOGLE_APP_KEY,
  },
});

async function sendEmail({ email, subject, text }) {
  try {
    transporter.sendMail({
      to: email,
      subject,
      text,
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = sendEmail;
