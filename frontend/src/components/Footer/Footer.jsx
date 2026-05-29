import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container">
          <div className="footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <div className="footer__logo-mark">M</div>
                <span className="footer__logo-text">Moni<span>luck</span></span>
              </Link>
              <p className="footer__brand-desc">
                Premium care products for every corner of your life. From home to personal care — we've got you covered.
              </p>
              <div className="footer__socials">
                {['facebook', 'instagram', 'twitter', 'youtube'].map(social => (
                  <motion.a
                    key={social}
                    href="#"
                    className="footer__social-link"
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social}
                  >
                    <span className="footer__social-icon">{social.charAt(0).toUpperCase()}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer__column">
              <h4 className="footer__col-title">Quick Links</h4>
              <nav className="footer__nav">
                <Link to="/">Home</Link>
                <Link to="/about">About Us</Link>
                <Link to="/products">Shop</Link>
                <Link to="/media">Media</Link>
                <Link to="/contact">Contact</Link>
              </nav>
            </div>

            {/* Categories */}
            <div className="footer__column">
              <h4 className="footer__col-title">Categories</h4>
              <nav className="footer__nav">
                <Link to="/category/home-care">Home Care</Link>
                <Link to="/category/kitchen-care">Kitchen Care</Link>
                <Link to="/category/personal-care">Personal Care</Link>
                <Link to="/category/clothing-care">Clothing Care</Link>
                <Link to="/category/toilet-care">Toilet Care</Link>
              </nav>
            </div>

            {/* Contact Info */}
            <div className="footer__column">
              <h4 className="footer__col-title">Get In Touch</h4>
              <div className="footer__contact-list">
                <div className="footer__contact-item">
                  <span className="material-icons-round">location_on</span>
                  <span>123 Care Street, City, Country</span>
                </div>
                <div className="footer__contact-item">
                  <span className="material-icons-round">email</span>
                  <a href="mailto:info@moniluck.com">info@moniluck.com</a>
                </div>
                <div className="footer__contact-item">
                  <span className="material-icons-round">phone</span>
                  <a href="tel:+1234567890">+1 (234) 567-890</a>
                </div>
                <div className="footer__contact-item">
                  <span className="material-icons-round">schedule</span>
                  <span>Mon – Sat: 9AM – 7PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p>© {currentYear} <strong>Moniluck</strong>. All rights reserved.</p>
            <div className="footer__bottom-links">
              <a href="#">Privacy Policy</a>
              <span>•</span>
              <a href="#">Terms of Service</a>
              <span>•</span>
              <a href="#">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;