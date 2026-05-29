const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const { query }    = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id, user.role);

  const userResponse = {
    id        : user.id,
    first_name: user.first_name,
    last_name : user.last_name,
    email     : user.email,
    role      : user.role,
    phone     : user.phone || null,
    avatar_url: user.avatar_url || null,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse,
  });
};

// ─── Mail Transporter ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host  : process.env.EMAIL_HOST,
  port  : parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth  : {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // 1) Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    // 2) Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // 3) Create user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name.trim(), last_name.trim(), email.toLowerCase().trim(), password_hash, phone || null]
    );

    // 4) Fetch created user
    const users = await query(
      'SELECT id, first_name, last_name, email, role, phone, avatar_url FROM users WHERE id = ?',
      [result.insertId]
    );

    createSendToken(users[0], 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    // 1) Find user
    const users = await query(
      'SELECT id, first_name, last_name, email, password_hash, role, phone, avatar_url, is_active FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!users.length) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const user = users[0];

    // 2) Check account active
    if (!user.is_active) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // 3) Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password.', 401));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const users = await query(
      'SELECT id, first_name, last_name, email, role, phone, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users.length) return next(new AppError('User not found.', 404));

    res.status(200).json({ success: true, user: users[0] });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;

    await query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
      [first_name.trim(), last_name.trim(), phone || null, req.user.id]
    );

    const users = await query(
      'SELECT id, first_name, last_name, email, role, phone, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    const token = signToken(users[0].id, users[0].role);

    res.status(200).json({ success: true, token, user: users[0] });
  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const users = await query(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    const isValid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isValid) return next(new AppError('Current password is incorrect.', 400));

    const password_hash = await bcrypt.hash(new_password, 12);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, req.user.id]);

    const token = signToken(req.user.id, req.user.role);
    res.status(200).json({ success: true, token, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const users = await query(
      'SELECT id, first_name, email FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    // Always respond success to prevent email enumeration
    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const user = users[0];

    // Generate token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate old tokens
    await query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);

    // Save new token
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    );

    // Send email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    const mailOptions = {
      from   : process.env.EMAIL_FROM,
      to     : user.email,
      subject: 'Moniluck - Password Reset Request',
      html   : `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 28px; }
            .body { padding: 40px; }
            .body p { color: #555; line-height: 1.7; font-size: 16px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0; }
            .footer { background: #f4f4f4; padding: 24px; text-align: center; color: #999; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="body">
              <p>Hi <strong>${user.first_name}</strong>,</p>
              <p>We received a request to reset the password for your Moniluck account. Click the button below to create a new password:</p>
              <div style="text-align:center">
                <a href="${resetURL}" class="btn">Reset My Password</a>
              </div>
              <p>This link will expire in <strong>1 hour</strong>.</p>
              <p>If you did not request a password reset, please ignore this email — your password will remain unchanged.</p>
              <p>For security, never share this link with anyone.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Moniluck. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const tokens = await query(
      `SELECT prt.*, u.id as user_id, u.email
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > NOW()`,
      [hashedToken]
    );

    if (!tokens.length) {
      return next(new AppError('Password reset link is invalid or has expired.', 400));
    }

    const resetRecord = tokens[0];
    const password_hash = await bcrypt.hash(password, 12);

    // Update password
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, resetRecord.user_id]);

    // Mark token as used
    await query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetRecord.id]);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── VALIDATE RESET TOKEN ─────────────────────────────────────────────────────
exports.validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const tokens = await query(
      'SELECT id FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [hashedToken]
    );

    res.status(200).json({
      success: true,
      valid  : tokens.length > 0,
    });
  } catch (error) {
    next(error);
  }
};