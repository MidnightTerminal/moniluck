import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Sidebar.css';

const menuItems = [
  { path: '/admin',             icon: 'dashboard',       label: 'Dashboard',    exact: true },
  { path: '/admin/products',    icon: 'inventory_2',     label: 'Products' },
  { path: '/admin/categories',  icon: 'category',        label: 'Categories' },
  { path: '/admin/orders',      icon: 'receipt_long',    label: 'Orders' },
  { path: '/admin/users',       icon: 'people',          label: 'Users' },
  { path: '/admin/reviews',     icon: 'rate_review',     label: 'Reviews' },
  { path: '/admin/subscribers', icon: 'mark_email_read', label: 'Subscribers' },
  { path: '/admin/settings',    icon: 'settings',        label: 'Settings' },
];

const Sidebar = ({ collapsed, mobileOpen, onToggle, onMobileClose }) => {
  const location = useLocation();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__mark">M</div>
        {!collapsed && (
          <motion.span
            className="sidebar-logo__text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Admin
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onMobileClose}
            title={collapsed ? item.label : ''}
          >
            <span className="material-icons-round sidebar-link__icon">{item.icon}</span>
            {!collapsed && (
              <motion.span
                className="sidebar-link__label"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                {item.label}
              </motion.span>
            )}
            {!collapsed && (
              <div className="sidebar-link__indicator" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop) */}
      <button className="sidebar-toggle hide-mobile-btn" onClick={onToggle}>
        <span className="material-icons-round">
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Overlay + Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              className="sidebar sidebar--mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="sidebar-mobile-header">
                <div className="sidebar-logo">
                  <div className="sidebar-logo__mark">M</div>
                  <span className="sidebar-logo__text">Admin</span>
                </div>
                <button className="sidebar-mobile-close" onClick={onMobileClose}>
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <nav className="sidebar-nav">
                {menuItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onMobileClose}
                  >
                    <span className="material-icons-round sidebar-link__icon">{item.icon}</span>
                    <span className="sidebar-link__label">{item.label}</span>
                    <div className="sidebar-link__indicator" />
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;