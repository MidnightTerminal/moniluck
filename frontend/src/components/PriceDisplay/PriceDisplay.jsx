import React from 'react';
import './PriceDisplay.css';

const PriceDisplay = ({ price, comparePrice, size = 'md', showBadge = true }) => {
  const current  = parseFloat(price);
  const compare  = comparePrice ? parseFloat(comparePrice) : null;
  const discount = compare && compare > current
    ? Math.round(((compare - current) / compare) * 100)
    : 0;

  return (
    <div className={`price-display price-display--${size}`}>
      <span className="price-display__current">${current.toFixed(2)}</span>
      {compare && compare > current && (
        <span className="price-display__compare">${compare.toFixed(2)}</span>
      )}
      {showBadge && discount > 0 && (
        <span className="price-display__badge">-{discount}%</span>
      )}
    </div>
  );
};

export default PriceDisplay;