import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveAssetUrl } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }
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
    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
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
        {/* Logo */}
        <div className="auth-logo">
          <Link to="/">
            <img src={resolveAssetUrl('/shared/monilucklogo1.png')} alt="Moniluck Logo" className="auth-logo-image" />
          </Link>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue shopping with Moniluck</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-icon-wrapper">
              <span className="material-icons-round input-icon">email</span>
              <input
                id="login-email"
                type="email"
                name="email"
                className={`form-input form-input--icon ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="form-error">
                <span className="material-icons-round" style={{ fontSize: '0.85rem' }}>error</span>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="form-forgot-link">
                Forgot Password?
              </Link>
            </div>
            <div className="input-icon-wrapper">
              <span className="material-icons-round input-icon">lock</span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                className={`form-input form-input--icon ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle-pass"
                onClick={() => setShowPass(prev => !prev)}
                tabIndex={-1}
              >
                <span className="material-icons-round">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <span className="form-error">
                <span className="material-icons-round" style={{ fontSize: '0.85rem' }}>error</span>
                {errors.password}
              </span>
            )}
          </div>

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
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-icons-round">arrow_forward</span>
              </>
            )}
          </motion.button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;