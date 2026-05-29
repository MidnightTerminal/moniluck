import React from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, size = 'md', showValue = false, reviewCount = null }) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('full');
    else if (i === full && half) stars.push('half');
    else stars.push('empty');
  }

  return (
    <div className={`star-rating star-rating--${size}`}>
      <div className="star-rating__stars">
        {stars.map((type, i) => (
          <span key={i} className={`star-icon star-icon--${type}`}>★</span>
        ))}
      </div>
      {showValue && (
        <span className="star-rating__value">{parseFloat(rating).toFixed(1)}</span>
      )}
      {reviewCount !== null && (
        <span className="star-rating__count">({reviewCount})</span>
      )}
    </div>
  );
};

export default StarRating;