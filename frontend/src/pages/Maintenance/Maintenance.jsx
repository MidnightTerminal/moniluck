import React from 'react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import './Maintenance.css';

const Maintenance = () => {
  const { siteName, siteTagline, contact } = useSiteSettings();

  return (
    <section className="maintenance-page">
      <div className="maintenance-page__bg maintenance-page__bg--one" />
      <div className="maintenance-page__bg maintenance-page__bg--two" />

      <div className="maintenance-page__content container-sm">
        <motion.div
          className="maintenance-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="maintenance-card__badge">
            <span className="material-icons-round">engineering</span>
            Maintenance Mode
          </div>

          <div className="maintenance-card__icon-wrap">
            <div className="maintenance-card__ring maintenance-card__ring--outer" />
            <div className="maintenance-card__ring maintenance-card__ring--inner" />
            <span className="material-icons-round maintenance-card__icon">settings</span>
          </div>

          <h1>We&apos;ll be back soon</h1>
          <p className="maintenance-card__lead">
            {siteName} is temporarily offline for scheduled maintenance and improvements.
          </p>
          <p className="maintenance-card__tagline">{siteTagline}</p>

          <div className="maintenance-card__info-grid">
            <div className="maintenance-card__info-item">
              <span className="material-icons-round">schedule</span>
              <div>
                <strong>What&apos;s happening</strong>
                <p>We&apos;re updating the site to keep it fast, reliable, and secure.</p>
              </div>
            </div>
            <div className="maintenance-card__info-item">
              <span className="material-icons-round">support_agent</span>
              <div>
                <strong>Need help?</strong>
                <p>Email us at <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
              </div>
            </div>
          </div>

          <div className="maintenance-card__contact">
            <a href={`mailto:${contact.email}`} className="maintenance-card__contact-link">
              <span className="material-icons-round">email</span>
              {contact.email}
            </a>
            <a href={`tel:${contact.phone}`} className="maintenance-card__contact-link">
              <span className="material-icons-round">phone</span>
              {contact.phone}
            </a>
          </div>

          <button
            type="button"
            className="btn btn-primary maintenance-card__button"
            onClick={() => window.location.reload()}
          >
            <span className="material-icons-round">refresh</span>
            Check Again
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Maintenance;