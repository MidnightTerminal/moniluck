import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchModal from '../SearchModal/SearchModal';
import CartSidebar from '../CartSidebar/CartSidebar';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, setIsCartOpen }      = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [profileDropdown,setProfileDropdown]= useState(false);
  const [activeIndicator,setActiveIndicator]= useState({ left: 0, width: 0 });

  const navRef        = useRef(null);
  const profileRef    = useRef(null);
  const navLinksRef   = useRef([]);

  /* ─── Scroll Effect ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ─── Close mobile menu on route change ─────────────────────────────────── */
  useEffect(() => {
    setMobileOpen(false);
    setProfileDropdown(false);
  }, [location]);

  /* ─── Close profile dropdown on outside click ───────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ─── Lock body scroll when mobile open ─────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* ─── Update Active Indicator ────────────────────────────────────────────── */
  const updateIndicator = useCallback((el) => {
    if (!el || !navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    setActiveIndicator({
      left : elRect.left - navRect.left,
      width: elRect.width,
    });
  }, []);

  const handleNavHover = (e) => updateIndicator(e.currentTarget);
  const handleNavLeave = () => {
    const activeEl = navRef.current?.querySelector('.nav-link.active');
    if (activeEl) updateIndicator(activeEl);
    else setActiveIndicator({ left: 0, width: 0 });
  };

  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/',        label: 'Home',    exact: true },
    { to: '/about',   label: 'About'   },
    { to: '/products',label: 'Shop'    },
    { to: '/media',   label: 'Media'   },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* ─── Main Navbar ──────────────────────────────────────────────────── */}
      <motion.nav
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="navbar__inner">
          {/* ── Logo ────────────────────────────────────────────────────── */}
          <Link to="/" className="navbar__logo">
            <motion.div
              className="navbar__logo-mark"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              M
            </motion.div>
            <span className="navbar__logo-text">
              Moni<span>luck</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ────────────────────────────────────────── */}
          <div
            className="navbar__links"
            ref={navRef}
            onMouseLeave={handleNavLeave}
          >
            {/* Hover Indicator */}
            <motion.div
              className="navbar__indicator"
              animate={{ left: activeIndicator.left, width: activeIndicator.width }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />

            {navLinks.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onMouseEnter={handleNavHover}
                ref={el => (navLinksRef.current[i] = el)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="navbar__actions">
            {/* Search */}
            <motion.button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Search"
            >
              <span className="material-icons-round">search</span>
              <span className="navbar__icon-tooltip">Search</span>
            </motion.button>

            {/* Cart */}
            <motion.button
              className="navbar__icon-btn navbar__cart-btn"
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Cart"
            >
              <span className="material-icons-round">local_mall</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    className="navbar__badge"
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="navbar__icon-tooltip">Cart</span>
            </motion.button>

            {/* Profile */}
            <div className="navbar__profile" ref={profileRef}>
              <motion.button
                className={`navbar__icon-btn navbar__profile-btn ${profileDropdown ? 'active' : ''}`}
                onClick={() => setProfileDropdown(prev => !prev)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Profile"
              >
                {isAuthenticated && user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.first_name}
                    className="navbar__avatar"
                  />
                ) : (
                  <span className="material-icons-round">
                    {isAuthenticated ? 'account_circle' : 'person_outline'}
                  </span>
                )}
                {isAuthenticated && (
                  <span className="navbar__online-dot" />
                )}
                <span className="navbar__icon-tooltip">Account</span>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileDropdown && (
                  <motion.div
                    className="navbar__dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="navbar__dropdown-header">
                          <div className="navbar__dropdown-avatar">
                            {user?.first_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="navbar__dropdown-name">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="navbar__dropdown-email">{user?.email}</p>
                          </div>
                        </div>
                        <div className="navbar__dropdown-divider" />
                        <Link to="/profile" className="navbar__dropdown-item">
                          <span className="material-icons-round">manage_accounts</span>
                          My Profile
                        </Link>
                        <Link to="/profile?tab=orders" className="navbar__dropdown-item">
                          <span className="material-icons-round">receipt_long</span>
                          My Orders
                        </Link>
                        <Link to="/profile?tab=wishlist" className="navbar__dropdown-item">
                          <span className="material-icons-round">favorite_border</span>
                          Wishlist
                        </Link>
                        <div className="navbar__dropdown-divider" />
                        <button
                          className="navbar__dropdown-item navbar__dropdown-logout"
                          onClick={handleLogout}
                        >
                          <span className="material-icons-round">logout</span>
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="navbar__dropdown-auth">
                          <p>Welcome to Moniluck!</p>
                          <p>Sign in for the best experience</p>
                        </div>
                        <div className="navbar__dropdown-divider" />
                        <Link to="/login" className="navbar__dropdown-item">
                          <span className="material-icons-round">login</span>
                          Sign In
                        </Link>
                        <Link to="/signup" className="navbar__dropdown-item">
                          <span className="material-icons-round">person_add</span>
                          Create Account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="navbar__hamburger"
              onClick={() => setMobileOpen(prev => !prev)}
              whileTap={{ scale: 0.95 }}
              aria-label="Menu"
            >
              <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile Menu ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Mobile Header */}
              <div className="mobile-menu__header">
                <Link to="/" className="navbar__logo">
                  <div className="navbar__logo-mark">M</div>
                  <span className="navbar__logo-text">Moni<span>luck</span></span>
                </Link>
                <button
                  className="mobile-menu__close"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="material-icons-round">close</span>
                </button>
              </div>

              {/* Mobile User Info */}
              {isAuthenticated && (
                <div className="mobile-menu__user">
                  <div className="mobile-menu__user-avatar">
                    {user?.first_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="mobile-menu__user-name">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="mobile-menu__user-email">{user?.email}</p>
                  </div>
                </div>
              )}

              {/* Mobile Links */}
              <nav className="mobile-menu__nav">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.exact}
                      className={({ isActive }) =>
                        `mobile-menu__link ${isActive ? 'active' : ''}`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="mobile-menu__divider" />

              {/* Mobile Actions */}
              <div className="mobile-menu__actions">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="mobile-menu__action-link">
                      <span className="material-icons-round">manage_accounts</span>
                      My Profile
                    </Link>
                    <Link to="/profile?tab=wishlist" className="mobile-menu__action-link">
                      <span className="material-icons-round">favorite_border</span>
                      Wishlist
                    </Link>
                    <button
                      className="mobile-menu__action-link mobile-menu__logout"
                      onClick={handleLogout}
                    >
                      <span className="material-icons-round">logout</span>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="mobile-menu__auth-btns">
                    <Link to="/login"  className="btn btn-primary btn-full">Sign In</Link>
                    <Link to="/signup" className="btn btn-secondary btn-full">Create Account</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Search & Cart ────────────────────────────────────────────────── */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartSidebar />
    </>
  );
};

export default Navbar;