require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
} else {
  console.warn('SUPABASE_URL or SUPABASE_ANON_KEY not set — Supabase integration disabled');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function makeTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Contact form → email Vivaan
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required.' });
  }

  try {
    if (supabase) {
      await supabase.from('leads').insert({ name, email, message });
    }

    await makeTransport().sendMail({
      from: `"DEY Marketing Site" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New inquiry from ${name} — DEY Marketing`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#faf8f5;border-radius:12px;">
          <h2 style="color:#1a130d;margin-top:0">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#7a6040;font-size:13px;width:80px">Name</td><td style="padding:8px 0;color:#1a130d;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#7a6040;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#b89968">${email}</a></td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e8e0d4;">
            <p style="margin:0;color:#3a2612;line-height:1.6">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#aaa">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.status(500).json({ error: 'Failed to send. Please try WhatsApp.' });
  }
});

// Calendly webhook → instant booking notification
app.post('/api/calendly-webhook', async (req, res) => {
  res.json({ received: true });

  try {
    const { event, payload } = req.body;
    if (event !== 'invitee.created') return;

    const { name, email } = payload.invitee;
    const startTime = payload.event?.start_time;
    const formatted = startTime
      ? new Date(startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })
      : 'Time not available';

    await makeTransport().sendMail({
      from: `"DEY Marketing" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🗓 New Call Booked: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#faf8f5;border-radius:12px;">
          <h2 style="color:#1a130d;margin-top:0">📅 New Strategy Call Booked!</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#7a6040;font-size:13px;width:80px">Name</td><td style="padding:8px 0;color:#1a130d;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#7a6040;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#b89968">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#7a6040;font-size:13px">Time</td><td style="padding:8px 0;color:#1a130d;font-weight:600">${formatted} IST</td></tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#aaa">Booked via Calendly on deymarketing.in</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Calendly webhook error:', err.message);
  }
});

// Fallback — serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DEY Marketing running on http://localhost:${PORT}`);
});
