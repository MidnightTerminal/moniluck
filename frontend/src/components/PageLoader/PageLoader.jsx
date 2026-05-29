import React from 'react';
import { motion } from 'framer-motion';
import './PageLoader.css';

const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="page-loader-wrapper">
      <div className="page-loader-content">
        <motion.div
          className="page-loader-logo"
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          M
        </motion.div>
        <div className="page-loader-dots">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="page-loader-dot"
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <p className="page-loader-text">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;