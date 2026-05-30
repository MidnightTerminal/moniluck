import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, getAdminMe } from '../utils/adminApi';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState(() => localStorage.getItem('moniluck_admin_token'));

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('moniluck_admin_token');
      if (!stored) { setLoading(false); return; }

      try {
        const { data } = await getAdminMe();
        if (data.success && data.user.role === 'admin') {
          setAdmin(data.user);
          setToken(stored);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('moniluck_admin_token');
    localStorage.removeItem('moniluck_admin_user');
    setToken(null);
    setAdmin(null);
  };

  const login = async (credentials) => {
    try {
      const { data } = await adminLogin(credentials);
      if (data.success) {
        if (data.user.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          return { success: false };
        }
        localStorage.setItem('moniluck_admin_token', data.token);
        localStorage.setItem('moniluck_admin_user', JSON.stringify(data.user));
        setToken(data.token);
        setAdmin(data.user);
        toast.success(`Welcome, ${data.user.first_name}!`);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully.');
  };

  return (
    <AdminAuthContext.Provider value={{
      admin, token, loading,
      isAuthenticated: !!token && !!admin,
      login, logout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

export default AdminAuthContext;