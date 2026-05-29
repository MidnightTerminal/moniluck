import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [token,   setToken]   = useState(() => localStorage.getItem('moniluck_token'));

  /* ─── Initialize: load user from token ──────────────────────────────────── */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('moniluck_token');
      if (!storedToken) { setLoading(false); return; }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ─── Helpers ────────────────────────────────────────────────────────────── */
  const saveAuth = (token, userData) => {
    localStorage.setItem('moniluck_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem('moniluck_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  /* ─── Register ───────────────────────────────────────────────────────────── */
  const register = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      if (data.success) {
        saveAuth(data.token, data.user);
        toast.success(`Welcome to Moniluck, ${data.user.first_name}! 🎉`);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      const errors  = error.response?.data?.errors  || null;
      toast.error(message);
      return { success: false, message, errors };
    }
  };

  /* ─── Login ──────────────────────────────────────────────────────────────── */
  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      if (data.success) {
        saveAuth(data.token, data.user);
        toast.success(`Welcome back, ${data.user.first_name}! 👋`);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  /* ─── Logout ─────────────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    clearAuth();
    toast.success('You have been logged out. See you soon! 👋');
  }, []);

  /* ─── Update Profile ─────────────────────────────────────────────────────── */
  const updateProfile = async (formData) => {
    try {
      const { data } = await api.put('/auth/profile', formData);
      if (data.success) {
        saveAuth(data.token, data.user);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  /* ─── Change Password ────────────────────────────────────────────────────── */
  const changePassword = async (passwordData) => {
    try {
      const { data } = await api.put('/auth/password', passwordData);
      if (data.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  /* ─── Forgot Password ────────────────────────────────────────────────────── */
  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed. Please try again.';
      return { success: false, message };
    }
  };

  /* ─── Reset Password ─────────────────────────────────────────────────────── */
  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      if (data.success) {
        toast.success('Password reset successfully! Please log in.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Reset failed. Link may have expired.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;