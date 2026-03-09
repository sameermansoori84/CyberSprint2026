const nodemailer = require("nodemailer");

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

async function sendRegistrationEmail({ to, name, csId, event, qrBuffer }) {
  const qrCid = `qr-${csId}@cybersprint2026`;

  const html = `
    <p>Dear ${name},</p>
    <p>Thank you for registering for <strong>${event}</strong>.</p>
    <p>Your <strong>CyberSprint ID</strong> is: <strong>${csId}</strong></p>
    <p>Please present this QR code at the venue for attendance:</p>
    <p><img src="cid:${qrCid}" alt="CyberSprint QR Code" /></p>
  `;

  const attachments = qrBuffer
    ? [{ filename: `${csId}.png`, content: qrBuffer, cid: qrCid }]
    : [];

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: `CyberSprint 2026 Registration – ${csId}`,
    html,
    attachments,
  });
}

module.exports = { sendRegistrationEmail };
