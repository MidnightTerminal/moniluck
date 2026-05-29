import React from 'react';
import { motion } from 'framer-motion';
import './Media.css';

const Media = () => {
  return (
    <motion.div
      className="media-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <section className="media-hero">
        <div className="media-hero__bg" />
        <div className="container">
          <motion.div
            className="media-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-tag">Media</span>
            <h1 className="media-hero__title">Media & <span>Gallery</span></h1>
            <p className="media-hero__subtitle">
              Explore our latest media content, campaigns, and brand stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Placeholder */}
      <section className="media-content section-padding">
        <div className="container">
          <div className="media-placeholder">
            <span className="material-icons-round">perm_media</span>
            <h2>Content Coming Soon</h2>
            <p>Media gallery and content will be added here shortly. Stay tuned!</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Media;