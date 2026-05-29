import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            <span className="material-icons-round breadcrumb-home-icon">home</span>
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            <span className="material-icons-round breadcrumb-separator">chevron_right</span>
            {index === items.length - 1 ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="breadcrumb-link">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;