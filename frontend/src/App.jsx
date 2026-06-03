import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import PageLoader from './components/PageLoader/PageLoader';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

/* ─── Lazy Pages ─────────────────────────────────────────────────────────────── */
const Home = lazy(() => import('./pages/Home/Home'));
const About = lazy(() => import('./pages/About/About'));
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const Media = lazy(() => import('./pages/Media/Media'));
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/Signup/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Maintenance = lazy(() => import('./pages/Maintenance/Maintenance'));


/* ─── Auth Route (redirect if logged in) ─────────────────────────────────────── */
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('moniluck_token');
  return token ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <SiteSettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SiteSettingsProvider>
  );
}

function AppContent() {
  const { loading, maintenanceMode } = useSiteSettings();

  if (loading) {
    return <PageLoader />;
  }

  if (maintenanceMode) {
    return (
      <>
        <Suspense fallback={<PageLoader />}>
          <Maintenance />
        </Suspense>

        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<Products />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/media" element={<Media />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* Auth Routes — redirect to home if already logged in */}
                <Route path="/login" element={
                  <AuthRoute><Login /></AuthRoute>
                } />
                <Route path="/signup" element={
                  <AuthRoute><Signup /></AuthRoute>
                } />
                <Route path="/forgot-password" element={
                  <AuthRoute><ForgotPassword /></AuthRoute>
                } />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;