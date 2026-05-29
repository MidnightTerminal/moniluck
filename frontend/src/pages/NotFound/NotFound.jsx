import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFound.css';

const NotFound = () => {
  return (
    <motion.div
      className="notfound-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="notfound-content">
        <motion.div
          className="notfound-code"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          404
        </motion.div>
        <motion.h1
          className="notfound-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Page Not Found
        </motion.h1>
        <motion.p
          className="notfound-message"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </motion.p>
        <motion.div
          className="notfound-actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/" className="btn btn-primary btn-lg">
            <span className="material-icons-round">home</span>
            Go Home
          </Link>
          <Link to="/products" className="btn btn-secondary btn-lg">
            <span className="material-icons-round">shopping_bag</span>
            Browse Products
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;