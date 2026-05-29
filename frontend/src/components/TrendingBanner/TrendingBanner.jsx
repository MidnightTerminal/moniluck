import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './TrendingBanner.css';

const TrendingBanner = () => {
  return (
    <section className="trending-banner section-padding-sm">
      <div className="container">
        <div className="trending-banner__grid">
          {/* Banner 1 */}
          <motion.div
            className="trending-banner__card trending-banner__card--large"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ background: 'linear-gradient(135deg, #667eea20, #764ba220)' }}
          >
            <div className="trending-banner__content">
              <span className="trending-banner__tag">🔥 Trending Now</span>
              <h3 className="trending-banner__title">
                Premium Home Care<br />
                <span style={{ color: '#667eea' }}>Up to 40% Off</span>
              </h3>
              <p className="trending-banner__desc">
                Transform every room with our bestselling cleaners, fresheners and more.
              </p>
              <Link to="/category/home-care" className="trending-banner__btn" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                Shop Now
                <span className="material-icons-round">arrow_forward</span>
              </Link>
            </div>
            <div className="trending-banner__emoji">🏠</div>
          </motion.div>

          {/* Banner 2 */}
          <motion.div
            className="trending-banner__card trending-banner__card--small"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ background: 'linear-gradient(135deg, #fa709a20, #fee14020)' }}
          >
            <div className="trending-banner__content">
              <span className="trending-banner__tag">🌸 Self Care</span>
              <h3 className="trending-banner__title">
                Personal Care<br />
                <span style={{ color: '#fa709a' }}>Essentials</span>
              </h3>
              <Link to="/category/personal-care" className="trending-banner__link" style={{ color: '#fa709a' }}>
                Explore
                <span className="material-icons-round">east</span>
              </Link>
            </div>
            <div className="trending-banner__emoji trending-banner__emoji--sm">🌸</div>
          </motion.div>

          {/* Banner 3 */}
          <motion.div
            className="trending-banner__card trending-banner__card--small"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ background: 'linear-gradient(135deg, #4facfe20, #00f2fe20)' }}
          >
            <div className="trending-banner__content">
              <span className="trending-banner__tag">✨ Fresh Clothes</span>
              <h3 className="trending-banner__title">
                Laundry Solutions<br />
                <span style={{ color: '#4facfe' }}>That Work</span>
              </h3>
              <Link to="/category/clothing-care" className="trending-banner__link" style={{ color: '#4facfe' }}>
                Explore
                <span className="material-icons-round">east</span>
              </Link>
            </div>
            <div className="trending-banner__emoji trending-banner__emoji--sm">👗</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingBanner;