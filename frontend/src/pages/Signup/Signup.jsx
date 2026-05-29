import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Signup.css';

const Signup = () => {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name : '',
    email     : '',
    phone     : '',
    password  : '',
    confirm   : '',
  });

  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  /* ─── Password Strength ─────────────────────────────────────────────────── */
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)     score++;
    if (pwd.length >= 12)    score++;
    if (/[A-Z]/.test(pwd))   score++;
    if (/[a-z]/.test(pwd))   score++;
    if (/\d/.test(pwd))      score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 'weak',   label: 'Weak',   color: '#ef4444', percent: 33 };
    if (score <= 4) return { level: 'medium', label: 'Medium', color: '#f59e0b', percent: 66 };
    return { level: 'strong', label: 'Strong', color: '#10b981', percent: 100 };
  };

  const strength = getPasswordStrength(formData.password);

  /* ─── Validation ─────────────────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};

    if (!formData.first_name.trim()) errs.first_name = 'First name is required.';
    else if (formData.first_name.trim().length < 2) errs.first_name = 'Minimum 2 characters.';

    if (!formData.last_name.trim()) errs.last_name = 'Last name is required.';
    else if (formData.last_name.trim().length < 2) errs.last_name = 'Minimum 2 characters.';

    if (!formData.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email.';

    if (formData.phone && !/^[+]?[\d\s()-]{7,20}$/.test(formData.phone)) {
      errs.phone = 'Enter a valid phone number.';
    }

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
    const { confirm, ...submitData } = formData;
    const result = await register(submitData);
    setLoading(false);

    if (result.success) navigate('/');
  };

  /* ─── Render Input ───────────────────────────────────────────────────────── */
  const renderField = (name, label, type = 'text', icon, placeholder, options = {}) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`signup-${name}`}>{label}</label>
      <div className="input-icon-wrapper">
        <span className="material-icons-round input-icon">{icon}</span>
        <input
          id={`signup-${name}`}
          type={
            name === 'password' ? (showPass ? 'text' : 'password') :
            name === 'confirm'  ? (showConf ? 'text' : 'password') : type
          }
          name={name}
          className={`form-input form-input--icon ${errors[name] ? 'error' : ''}`}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          {...options}
        />
        {name === 'password' && (
          <button
            type="button"
            className="input-toggle-pass"
            onClick={() => setShowPass(p => !p)}
            tabIndex={-1}
          >
            <span className="material-icons-round">{showPass ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
        {name === 'confirm' && (
          <button
            type="button"
            className="input-toggle-pass"
            onClick={() => setShowConf(p => !p)}
            tabIndex={-1}
          >
            <span className="material-icons-round">{showConf ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </div>
      {errors[name] && (
        <span className="form-error">
          <span className="material-icons-round" style={{ fontSize: '0.85rem' }}>error</span>
          {errors[name]}
        </span>
      )}
    </div>
  );

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card auth-card--wide"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <Link to="/">
            <span className="auth-logo-text">Moniluck</span>
          </Link>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join Moniluck and start shopping premium care products</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Row */}
          <div className="form-row">
            {renderField('first_name', 'First Name', 'text', 'person', 'John')}
            {renderField('last_name', 'Last Name', 'text', 'badge', 'Doe')}
          </div>

          {renderField('email', 'Email Address', 'email', 'email', 'you@example.com')}
          {renderField('phone', 'Phone (optional)', 'tel', 'phone', '+1 (234) 567-890')}
          {renderField('password', 'Password', 'password', 'lock', 'Min 8 characters')}

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="password-strength">
              <div className="password-strength__bar">
                <motion.div
                  className="password-strength__fill"
                  style={{ background: strength.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.percent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="password-strength__label" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}

          {renderField('confirm', 'Confirm Password', 'password', 'lock_outline', 'Re-enter password')}

          {/* Submit */}
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
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <span className="material-icons-round">arrow_forward</span>
              </>
            )}
          </motion.button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;