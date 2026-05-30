import axios from 'axios';
import toast from 'react-hot-toast';

const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('moniluck_admin_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Response interceptor
adminApi.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('moniluck_admin_token');
      localStorage.removeItem('moniluck_admin_user');
      if (!window.location.pathname.includes('/admin/login')) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => { window.location.href = '/admin/login'; }, 1000);
      }
    }
    if (status === 403) toast.error('Access denied.');
    if (status >= 500)  toast.error('Server error. Try again later.');
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────
export const adminLogin    = (data) => adminApi.post('/auth/login', data);
export const getAdminMe    = ()     => adminApi.get('/auth/me');

// ─── Dashboard ────────────────────────────────────────────────
export const getDashboard  = () => adminApi.get('/admin/dashboard');

// ─── Products ─────────────────────────────────────────────────
export const getAdminProducts       = (params) => adminApi.get('/admin/products', { params });
export const getAdminProduct        = (id)     => adminApi.get(`/admin/products/${id}`);
export const createProduct          = (data)   => adminApi.post('/admin/products', data);
export const updateProduct          = (id, data) => adminApi.put(`/admin/products/${id}`, data);
export const deleteProduct          = (id)     => adminApi.delete(`/admin/products/${id}`);
export const toggleProductStatus    = (id)     => adminApi.patch(`/admin/products/${id}/toggle`);

// ─── Categories ───────────────────────────────────────────────
export const getAdminCategories     = ()       => adminApi.get('/admin/categories');
export const createCategory         = (data)   => adminApi.post('/admin/categories', data);
export const updateCategory         = (id, data) => adminApi.put(`/admin/categories/${id}`, data);
export const deleteCategory         = (id)     => adminApi.delete(`/admin/categories/${id}`);

// ─── Orders ───────────────────────────────────────────────────
export const getAdminOrders         = (params) => adminApi.get('/admin/orders', { params });
export const getAdminOrder          = (id)     => adminApi.get(`/admin/orders/${id}`);
export const updateOrderStatus      = (id, data) => adminApi.patch(`/admin/orders/${id}/status`, data);
export const deleteOrder            = (id)     => adminApi.delete(`/admin/orders/${id}`);

// ─── Users ────────────────────────────────────────────────────
export const getAdminUsers          = (params) => adminApi.get('/admin/users', { params });
export const getAdminUser           = (id)     => adminApi.get(`/admin/users/${id}`);
export const updateUser             = (id, data) => adminApi.put(`/admin/users/${id}`, data);
export const deleteUser             = (id)     => adminApi.delete(`/admin/users/${id}`);

// ─── Reviews ──────────────────────────────────────────────────
export const getAdminReviews        = (params) => adminApi.get('/admin/reviews', { params });
export const approveReview          = (id)     => adminApi.patch(`/admin/reviews/${id}/approve`);
export const deleteReview           = (id)     => adminApi.delete(`/admin/reviews/${id}`);

// ─── Subscribers ──────────────────────────────────────────────
export const getSubscribers         = (params) => adminApi.get('/admin/subscribers', { params });
export const deleteSubscriber       = (id)     => adminApi.delete(`/admin/subscribers/${id}`);

// ─── Settings ─────────────────────────────────────────────────
export const getSettings            = ()       => adminApi.get('/admin/settings');
export const updateSettings         = (data)   => adminApi.put('/admin/settings', { settings: data });

export default adminApi;