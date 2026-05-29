import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './EmptyState.css';

const EmptyState = ({
  icon = 'inbox',
  title = 'Nothing here yet',
  message = 'Content will appear here once available.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="empty-state__icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
      >
        <span className="material-icons-round">{icon}</span>
      </motion.div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {actionLabel && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary">
            {actionLabel}
          </Link>
        ) : (
          <button className="btn btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        )
      )}
    </motion.div>
  );
};

export default EmptyState;