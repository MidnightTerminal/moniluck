import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">
          <Link to="/"><span className="auth-logo-text">Moniluck</span></Link>
        </div>

        {!sent ? (
          <>
            <div className="forgot-icon-wrapper">
              <motion.div
                className="forgot-icon"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <span className="material-icons-round">lock_reset</span>
              </motion.div>
            </div>

            <h2 className="auth-title">Forgot Password?</h2>
            <p className="auth-subtitle">
              No worries! Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <div className="input-icon-wrapper">
                  <span className="material-icons-round input-icon">email</span>
                  <input
                    id="forgot-email"
                    type="email"
                    className={`form-input form-input--icon ${error ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="email"
                  />
                </div>
                {error && (
                  <span className="form-error">
                    <span className="material-icons-round" style={{ fontSize: '0.85rem' }}>error</span>
                    {error}
                  </span>
                )}
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary btn-full btn-lg auth-submit-btn"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                    <span>Sending Link...</span>
                  </div>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="material-icons-round">send</span>
                  </>
                )}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="forgot-success">
            <motion.div
              className="forgot-success__icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <span className="material-icons-round">mark_email_read</span>
            </motion.div>
            <h2 className="auth-title">Check Your Email</h2>
            <p className="auth-subtitle">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and spam folder.
            </p>
            <p className="forgot-success__note">
              The link will expire in <strong>1 hour</strong>.
            </p>
            <button
              className="btn btn-secondary btn-full"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              <span className="material-icons-round">refresh</span>
              Resend Link
            </button>
          </div>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;