import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { resolveAssetUrl } from '../../utils/helpers';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart, toggleWishlist, isInWishlist } = useCart();
  const productImage = product?.thumbnail || '';

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const inCart    = isInCart(product.id);
  const wishlisted = isInWishlist(product.id);

  const renderStars = (rating) => {
    const stars = [];
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<span key={i} className="star star--full">★</span>);
      else if (i === full && half) stars.push(<span key={i} className="star star--half">★</span>);
      else stars.push(<span key={i} className="star star--empty">★</span>);
    }
    return stars;
  };

  return (
    <div className="product-card">
      {/* Image Section */}
      <div className="product-card__image-wrapper">
        <Link to={`/products/${product.slug}`} className="product-card__image-link">
          {productImage ? (
            <img
              src={resolveAssetUrl(productImage)}
              alt={product.name}
              className="product-card__image"
              loading="lazy"
            />
          ) : (
            <div className="product-card__image-placeholder">
              <span className="material-icons-round">shopping_bag</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="product-card__badges">
          {discount > 0 && (
            <span className="product-card__badge product-card__badge--sale">
              -{discount}%
            </span>
          )}
          {product.is_featured === 1 && (
            <span className="product-card__badge product-card__badge--featured">
              ⭐ Featured
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="product-card__badge product-card__badge--low">
              Few Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="product-card__badge product-card__badge--out">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="product-card__quick-actions">
          <motion.button
            className={`product-card__action-btn ${wishlisted ? 'wishlisted' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <span className="material-icons-round">
              {wishlisted ? 'favorite' : 'favorite_border'}
            </span>
          </motion.button>
          <motion.button
            className="product-card__action-btn"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Quick View"
          >
            <Link to={`/products/${product.slug}`} style={{ color: 'inherit', display: 'flex' }}>
              <span className="material-icons-round">visibility</span>
            </Link>
          </motion.button>
        </div>
      </div>

      {/* Info Section */}
      <div className="product-card__info">
        {/* Category */}
        <span className="product-card__category">{product.category_name}</span>

        {/* Name */}
        <Link to={`/products/${product.slug}`} className="product-card__name-link">
          <h3 className="product-card__name">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="product-card__rating">
          <div className="product-card__stars">{renderStars(product.rating || 0)}</div>
          <span className="product-card__review-count">
            ({product.review_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="product-card__pricing">
          <span className="product-card__price">${parseFloat(product.price).toFixed(2)}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="product-card__compare-price">
              ${parseFloat(product.compare_price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <motion.button
          className={`product-card__cart-btn ${inCart ? 'in-cart' : ''} ${product.stock === 0 ? 'disabled' : ''}`}
          onClick={() => product.stock > 0 && addToCart(product)}
          whileHover={product.stock > 0 ? { scale: 1.02 } : {}}
          whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
          disabled={product.stock === 0}
        >
          <span className="material-icons-round">
            {product.stock === 0 ? 'remove_shopping_cart' : inCart ? 'check' : 'add_shopping_cart'}
          </span>
          <span>
            {product.stock === 0 ? 'Out of Stock' : inCart ? 'Added to Cart' : 'Add to Cart'}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard;