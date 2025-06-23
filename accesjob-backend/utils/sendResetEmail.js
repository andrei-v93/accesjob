// utils/sendResetEmail.js
const nodemailer = require('nodemailer');

const sendResetEmail = async (email, resetLink) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"AccesJob" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Resetare parolă AccesJob',
        html: `
      <h3>Resetare parolă</h3>
      <p>Dacă ai cerut resetarea parolei, apasă pe linkul de mai jos:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Dacă nu ai cerut tu, ignoră acest mesaj.</p>
    `,
    });
};

module.exports = sendResetEmail;
