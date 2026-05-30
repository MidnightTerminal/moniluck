import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import '../../App.css';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className="admin-app">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(prev => !prev)}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`admin-main ${collapsed ? 'collapsed' : ''}`}>
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => {
            if (window.innerWidth <= 768) setMobileOpen(prev => !prev);
            else setCollapsed(prev => !prev);
          }}
        />
        <div className="admin-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;