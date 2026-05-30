import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAdminAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email.';
    if (!form.password) e.password = 'Password required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) navigate('/admin');
  };

  return (
    <div className="admin-login">
      <motion.div
        className="admin-login__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="admin-login__header">
          <div className="admin-login__logo">M</div>
          <h1>Admin Panel</h1>
          <p>Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input
              type="email" className={`admin-input ${errors.email ? 'error' : ''}`}
              placeholder="admin@moniluck.com" value={form.email}
              onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
            />
            {errors.email && <span className="admin-form-error">{errors.email}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className={`admin-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter password" value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--admin-text-light)', cursor: 'pointer' }}>
                <span className="material-icons-round" style={{ fontSize: '1.15rem' }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && <span className="admin-form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: 8 }}>
            {loading ? <><div className="admin-spinner admin-spinner-sm" style={{ borderTopColor: '#fff' }} /> Signing in...</>
              : <><span className="material-icons-round">login</span> Sign In</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;