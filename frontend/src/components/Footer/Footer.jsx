import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { CONTACT_INFO, SOCIAL_LINKS, FOOTER_LINKS } from '../../utils/constants';
import './Footer.css';

const SOCIAL_ICONS = {
  facebook : FaFacebookF,
  instagram: FaInstagram,
  twitter  : FaXTwitter,
  youtube  : FaYoutube,
};

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
                {SOCIAL_LINKS.map(({ platform, url, label }) => {
                  const Icon = SOCIAL_ICONS[platform];

                  return (
                  <motion.a
                    key={platform}
                    href={url}
                    className="footer__social-link"
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={platform}
                    onClick={url === '#' ? (event) => event.preventDefault() : undefined}
                  >
                    {Icon ? <Icon className="footer__social-icon" /> : <span className="footer__social-icon">{label}</span>}
                  </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer__column">
              <h4 className="footer__col-title">Quick Links</h4>
              <nav className="footer__nav">
                {FOOTER_LINKS.quickLinks.map(link => (
                  <Link key={link.to} to={link.to}>{link.label}</Link>
                ))}
              </nav>
            </div>

            {/* Categories */}
            <div className="footer__column">
              <h4 className="footer__col-title">Categories</h4>
              <nav className="footer__nav">
                {FOOTER_LINKS.categories.map(link => (
                  <Link key={link.to} to={link.to}>{link.label}</Link>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="footer__column">
              <h4 className="footer__col-title">Get In Touch</h4>
              <div className="footer__contact-list">
                <div className="footer__contact-item">
                  <span className="material-icons-round">location_on</span>
                  <span>{CONTACT_INFO.address}</span>
                </div>
                <div className="footer__contact-item">
                  <span className="material-icons-round">email</span>
                  <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
                </div>
                <div className="footer__contact-item">
                  <span className="material-icons-round">phone</span>
                  <a href="tel:+1234567890">{CONTACT_INFO.phone}</a>
                </div>
                <div className="footer__contact-item">
                  <span className="material-icons-round">schedule</span>
                  <span>{CONTACT_INFO.hours}</span>
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