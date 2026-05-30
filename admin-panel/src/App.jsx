import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/Layout/AdminLayout';
import './App.css';

const Login        = lazy(() => import('./pages/Login/Login'));
const Dashboard    = lazy(() => import('./pages/Dashboard/Dashboard'));
const Products     = lazy(() => import('./pages/Products/Products'));
const ProductForm  = lazy(() => import('./pages/Products/ProductForm'));
const Categories   = lazy(() => import('./pages/Categories/Categories'));
const Orders       = lazy(() => import('./pages/Orders/Orders'));
const OrderDetail  = lazy(() => import('./pages/Orders/OrderDetail'));
const Users        = lazy(() => import('./pages/Users/Users'));
const Reviews      = lazy(() => import('./pages/Reviews/Reviews'));
const Subscribers  = lazy(() => import('./pages/Subscribers/Subscribers'));
const Settings     = lazy(() => import('./pages/Settings/Settings'));

const LoadingFallback = () => (
  <div className="admin-loading-page">
    <div className="admin-spinner" />
    <p style={{ color: 'var(--admin-text-secondary)' }}>Loading...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <LoadingFallback />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <LoadingFallback />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/admin/login" element={<AuthRoute><Login /></AuthRoute>} />

        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="users" element={<Users />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="subscribers" element={<Subscribers />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a', color: '#f8fafc',
              borderRadius: '10px', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AdminAuthProvider>
    </Router>
  );
}

export default App;