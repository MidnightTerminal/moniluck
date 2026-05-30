import React, { useState, useRef, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ collapsed, onToggleSidebar }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className={`admin-header ${collapsed ? 'admin-header--collapsed' : ''}`}>
      <div className="admin-header__left">
        <button className="admin-header__menu-btn" onClick={onToggleSidebar}>
          <span className="material-icons-round">menu</span>
        </button>
      </div>

      <div className="admin-header__right">
        {/* Visit Site */}
        <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="admin-header__link">
          <span className="material-icons-round">open_in_new</span>
          <span className="admin-header__link-text">View Site</span>
        </a>

        {/* Profile Dropdown */}
        <div className="admin-header__profile" ref={dropdownRef}>
          <button
            className="admin-header__profile-btn"
            onClick={() => setDropdownOpen(prev => !prev)}
          >
            <div className="admin-header__avatar">
              {admin?.first_name?.charAt(0)}{admin?.last_name?.charAt(0)}
            </div>
            <div className="admin-header__user-info">
              <span className="admin-header__user-name">{admin?.first_name} {admin?.last_name}</span>
              <span className="admin-header__user-role">Administrator</span>
            </div>
            <span className="material-icons-round admin-header__chevron">
              {dropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {dropdownOpen && (
            <div className="admin-header__dropdown">
              <button className="admin-header__dropdown-item" onClick={() => { navigate('/admin/settings'); setDropdownOpen(false); }}>
                <span className="material-icons-round">settings</span> Settings
              </button>
              <div className="admin-header__dropdown-divider" />
              <button className="admin-header__dropdown-item admin-header__dropdown-logout" onClick={handleLogout}>
                <span className="material-icons-round">logout</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;