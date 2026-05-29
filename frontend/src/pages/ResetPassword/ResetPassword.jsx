import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { validateResetToken } from '../../utils/api';
import toast from 'react-hot-toast';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token }        = useParams();
  const { resetPassword } = useAuth();
  const navigate          = useNavigate();

  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [valid, setValid]       = useState(false);
  const [success, setSuccess]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  /* ─── Validate Token on Mount ────────────────────────────────────────────── */
  useEffect(() => {
    const checkToken = async () => {
      try {
        const { data } = await validateResetToken(token);
        setValid(data.valid);
      } catch {
        setValid(false);
      } finally {
        setChecking(false);
      }
    };
    checkToken();
  }, [token]);

  /* ─── Password Strength ─────────────────────────────────────────────────── */
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)          score++;
    if (pwd.length >= 12)         score++;
    if (/[A-Z]/.test(pwd))       score++;
    if (/[a-z]/.test(pwd))       score++;
    if (/\d/.test(pwd))          score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: 'Weak', color: '#ef4444', percent: 33 };
    if (score <= 4) return { label: 'Medium', color: '#f59e0b', percent: 66 };
    return { label: 'Strong', color: '#10b981', percent: 100 };
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.password) errs.password = 'Password is required.';
    else {
      if (formData.password.length < 8) errs.password = 'Minimum 8 characters.';
      else if (!/[A-Z]/.test(formData.password)) errs.password = 'Include at least one uppercase letter.';
      else if (!/[a-z]/.test(formData.password)) errs.password = 'Include at least one lowercase letter.';
      else if (!/\d/.test(formData.password)) errs.password = 'Include at least one number.';
    }
    if (!formData.confirm) errs.confirm = 'Please confirm your password.';
    else if (formData.password !== formData.confirm) errs.confirm = 'Passwords do not match.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await resetPassword(token, formData.password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    }
  };

  /* ─── Loading State ──────────────────────────────────────────────────────── */
  if (checking) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto var(--space-lg)' }} />
          <p style={{ color: 'var(--text-mid)' }}>Validating your reset link...</p>
        </div>
      </div>
    );
  }

  /* ─── Invalid Token ──────────────────────────────────────────────────────── */
  if (!valid && !success) {
    return (
      <div className="auth-page">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="reset-invalid">
            <div className="reset-invalid__icon">
              <span className="material-icons-round">link_off</span>
            </div>
            <h2 className="auth-title">Invalid or Expired Link</h2>
            <p className="auth-subtitle">
              This password reset link is no longer valid. It may have been used or expired.
            </p>
            <Link to="/forgot-password" className="btn btn-primary btn-full">
              <span className="material-icons-round">refresh</span>
              Request New Link
            </Link>
          </div>
          <p className="auth-footer">
            <Link to="/login">Back to Sign In</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  /* ─── Success State ──────────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="auth-page">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="reset-success">
            <motion.div
              className="reset-success__icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <span className="material-icons-round">check_circle</span>
            </motion.div>
            <h2 className="auth-title">Password Reset!</h2>
            <p className="auth-subtitle">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link to="/login" className="btn btn-primary btn-full btn-lg">
              <span className="material-icons-round">login</span>
              Sign In Now
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Reset Form ─────────────────────────────────────────────────────────── */
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

        <div className="forgot-icon-wrapper">
          <div className="forgot-icon">
            <span className="material-icons-round">lock_open</span>
          </div>
        </div>

        <h2 className="auth-title">Set New Password</h2>
        <p className="auth-subtitle">Create a strong password that you haven't used before.</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-password">New Password</label>
            <div className="input-icon-wrapper">
              <span className="material-icons-round input-icon">lock</span>
              <input
                id="reset-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                className={`form-input form-input--icon ${errors.password ? 'error' : ''}`}
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="input-toggle-pass"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >
                <span className="material-icons-round">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.password && (
              <span className="form-error">
                <span className="material-icons-round" style={{ fontSize: '0.85rem' }}>error</span>
                {errors.password}
              </span>
            )}
          </div>

          {/* Strength Meter */}
          {formData.password && (
            <div className="password-strength">
              <div className="password-strength__bar">
                <motion.div
                  className="password-strength__fill"
                  style={{ background: strength.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.percent}%` }}
                />
              </div>
              <span className="password-strength__label" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirm">Confirm Password</label>
            <div className="input-icon-wrapper">
              <span className="material-icons-round input-icon">lock_outline</span>
              <input
                id="reset-confirm"
                type={showConf ? 'text' : 'password'}
                name="confirm"
                className={`form-input form-input--icon ${errors.confirm ? 'error' : ''}`}
                placeholder="Re-enter password"
                value={formData.confirm}
                onChange={handleChange}
              />
              <button
                type="button"
                className="input-toggle-pass"
                onClick={() => setShowConf(p => !p)}
                tabIndex={-1}
              >
                <span className="material-icons-round">{showConf ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.confirm && (
              <span className="form-error">
                <span className="material-icons-round" style={{ fontSize: '0.85rem' }}>error</span>
                {errors.confirm}
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
                <span>Resetting...</span>
              </div>
            ) : (
              <>
                <span>Reset Password</span>
                <span className="material-icons-round">check</span>
              </>
            )}
          </motion.button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;