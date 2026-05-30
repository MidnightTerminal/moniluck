import axios from 'axios';
import toast from 'react-hot-toast';

/* ─── Axios Instance ─────────────────────────────────────────────────────────── */
const api = axios.create({
  baseURL        : process.env.REACT_APP_API_URL || '/api',
  timeout        : 15000,
  headers        : { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/* ─── Request Interceptor ────────────────────────────────────────────────────── */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('moniluck_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/* ─── Response Interceptor ───────────────────────────────────────────────────── */
api.interceptors.response.use(
  response => response,
  error => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    // Session expired
    if (status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login')
        || error.config?.url?.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('moniluck_token');
        delete api.defaults.headers.common['Authorization'];
        // Only redirect if not already on auth page
        if (!window.location.pathname.startsWith('/login')) {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => { window.location.href = '/login'; }, 1500);
        }
      }
    }

    // Server error
    if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // Rate limit
    if (status === 429) {
      toast.error('Too many requests. Please slow down.');
    }

    return Promise.reject(error);
  }
);

/* ─── API Helper Functions ───────────────────────────────────────────────────── */

// Products
export const fetchProducts         = (params = {}) => api.get('/products', { params });
export const fetchProduct          = (slug)         => api.get(`/products/${slug}`);
export const fetchFeaturedProducts = (limit = 8)    => api.get('/products/featured', { params: { limit } });
export const fetchCategories       = ()             => api.get('/products/categories');
export const fetchProductsByCategory = (slug, params = {}) => api.get(`/products/category/${slug}`, { params });
export const searchProducts        = (q, limit = 10) => api.get('/products/search', { params: { q, limit } });
export const addProductReview      = (slug, data)   => api.post(`/products/${slug}/reviews`, data);

// Auth
export const loginUser             = (data) => api.post('/auth/login', data);
export const registerUser          = (data) => api.post('/auth/register', data);
export const getCurrentUser        = ()     => api.get('/auth/me');
export const fetchMyOrders         = ()     => api.get('/auth/orders');
export const updateUserProfile     = (data) => api.put('/auth/profile', data);
export const changeUserPassword    = (data) => api.put('/auth/password', data);
export const forgotPasswordReq     = (email) => api.post('/auth/forgot-password', { email });
export const resetPasswordReq      = (token, password) => api.post(`/auth/reset-password/${token}`, { password });
export const validateResetToken    = (token) => api.get(`/auth/validate-reset-token/${token}`);

// Cart
export const validateCartItems     = (items) => api.post('/cart/validate', { items });
export const checkProductStock     = (id)    => api.get(`/cart/stock/${id}`);
export const placeOrder            = (data)   => api.post('/cart/checkout', data);

// Contact
export const sendContactForm       = (data) => api.post('/contact', data);
export const subscribeToNewsletter = (email) => api.post('/contact/newsletter', { email });

export default api;