const { query }    = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail, sendTelegramMessage } = require('../utils/notificationService');

// ─── SEND CONTACT MESSAGE ─────────────────────────────────────────────────────
exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Send email to admin
    const adminMail = {
      from   : process.env.EMAIL_FROM,
      to     : process.env.EMAIL_USER,
      subject: `[Moniluck Contact] ${subject}`,
      html   : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center">
            <h2 style="color:#fff;margin:0">New Contact Message</h2>
          </div>
          <div style="padding:30px">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border:1px solid #eee;margin:20px 0"/>
            <p><strong>Message:</strong></p>
            <p style="background:#f9f9f9;padding:15px;border-radius:8px;line-height:1.7">${message}</p>
          </div>
        </div>
      `,
    };

    // Send confirmation to user
    const userMail = {
      from   : process.env.EMAIL_FROM,
      to     : email,
      subject: 'Moniluck - We received your message!',
      html   : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center">
            <h2 style="color:#fff;margin:0">Thank You, ${name}!</h2>
          </div>
          <div style="padding:30px">
            <p style="font-size:16px;color:#555;line-height:1.7">We've received your message and our team will get back to you within <strong>24–48 hours</strong>.</p>
            <p style="color:#555">Your enquiry: <em>"${subject}"</em></p>
            <p style="color:#555">In the meantime, feel free to browse our latest products.</p>
          </div>
          <div style="background:#f4f4f4;padding:20px;text-align:center;color:#999;font-size:13px">
            <p>© ${new Date().getFullYear()} Moniluck. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const telegramMessage = [
      'New contact message received',
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Subject: ${subject}`,
      `Message: ${message}`,
    ].filter(Boolean).join('\n');

    await Promise.allSettled([
      sendEmail(adminMail),
      sendEmail(userMail),
      sendTelegramMessage(telegramMessage),
    ]);

    // Newsletter subscription
    const { subscribe_newsletter } = req.body;
    if (subscribe_newsletter) {
      try {
        await query(
          'INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)',
          [email.toLowerCase().trim()]
        );
      } catch {}
    }

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll be in touch soon!',
    });
  } catch (error) {
    next(error);
  }
};

// ─── SUBSCRIBE NEWSLETTER ─────────────────────────────────────────────────────
exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    await query(
      'INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE is_active = 1',
      [email.toLowerCase().trim()]
    );

    res.status(200).json({
      success: true,
      message: 'You have successfully subscribed to our newsletter!',
    });
  } catch (error) {
    next(error);
  }
};