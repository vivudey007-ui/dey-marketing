import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string };

  if (!name || !email || !message) {
    res.status(400).json({ error: "All fields required." });
    return;
  }

  req.log.info({ name, email }, "Contact form submission");

  res.json({ success: true });

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
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
              <p style="margin:0;color:#3a2612;line-height:1.6">${message.replace(/\n/g, "<br>")}</p>
            </div>
            <p style="margin-top:24px;font-size:12px;color:#aaa">Reply directly to this email to respond to ${name}.</p>
          </div>
        `,
      });
      logger.info({ email }, "Contact email sent");
    } catch (err) {
      logger.error({ err }, "Failed to send contact email");
    }
  }
});

router.post("/calendly-webhook", async (req, res) => {
  res.json({ received: true });

  try {
    const { event, payload } = req.body as {
      event?: string;
      payload?: { invitee?: { name?: string; email?: string }; event?: { start_time?: string } };
    };

    if (event !== "invitee.created") return;

    const name = payload?.invitee?.name ?? "Unknown";
    const email = payload?.invitee?.email ?? "";
    const startTime = payload?.event?.start_time;
    const formatted = startTime
      ? new Date(startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })
      : "Time not available";

    req.log.info({ name, email, formatted }, "Calendly booking received");

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: `"DEY Marketing" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Call Booked: ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#faf8f5;border-radius:12px;">
            <h2 style="color:#1a130d;margin-top:0">New Strategy Call Booked!</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#7a6040;font-size:13px;width:80px">Name</td><td style="padding:8px 0;color:#1a130d;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#7a6040;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#b89968">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#7a6040;font-size:13px">Time</td><td style="padding:8px 0;color:#1a130d;font-weight:600">${formatted} IST</td></tr>
            </table>
          </div>
        `,
      });
    }
  } catch (err) {
    logger.error({ err }, "Calendly webhook error");
  }
});

export default router;
