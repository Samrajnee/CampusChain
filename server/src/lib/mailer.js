import nodemailer from 'nodemailer';

// ── Transport ─────────────────────────────────────────────────────────────────
// Only created if SMTP credentials are present.
// If missing, sendEmail() becomes a no-op that logs a warning.

let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true only for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection on startup
  transporter.verify((err) => {
    if (err) {
      console.error('[Mailer] SMTP connection failed:', err.message);
    } else {
      console.log('[Mailer] SMTP ready');
    }
  });
} else {
  console.warn('[Mailer] SMTP_USER or SMTP_PASS not set — email sending disabled');
}

// ── sendEmail() ───────────────────────────────────────────────────────────────
// Fire-and-forget. Never throws. Logs on failure.
// Every service calls this — they don't need to know if email is enabled.

export async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.warn(`[Mailer] Skipped email to ${to} — mailer not configured`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"CampusChain" <no-reply@campuschain.dev>',
      to,
      subject,
      html,
    });
    console.log(`[Mailer] Sent to ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[Mailer] Failed to send to ${to}:`, err.message);
  }
}