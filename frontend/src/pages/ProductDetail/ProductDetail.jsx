import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { fetchProduct } from '../../utils/api';
import { addProductReview } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { resolveAssetUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart, isInCart, getCartItem, updateQuantity, toggleWishlist, isInWishlist } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: '', title: '', body: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchProduct(slug);
        if (data.success) {
          setProduct(data.product);
          setRelated(data.related || []);
          setReviews(data.reviews || []);

          const cartItem = getCartItem?.(data.product.id);
          if (cartItem) setQuantity(cartItem.quantity);
          else setQuantity(1);
        }
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="pd-skeleton">
            <div className="pd-skeleton__image">
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="pd-skeleton__info">
              <div className="skeleton" style={{ width: '30%', height: 16, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '80%', height: 28, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '50%', height: 20, marginBottom: 20 }} />
              <div className="skeleton" style={{ width: '100%', height: 60, marginBottom: 20 }} />
              <div className="skeleton" style={{ width: '60%', height: 48, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="pd-error">
            <span className="material-icons-round">error_outline</span>
            <h2>{error || 'Product not found'}</h2>
            <Link to="/products" className="btn btn-primary">
              <span className="material-icons-round">arrow_back</span>
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const inCart     = isInCart(product.id);
  const wishlisted = isInWishlist(product.id);
  const detailImage = product?.thumbnail || (Array.isArray(product?.images) ? product.images[0] : '');
  const sanitizedDescription = product.description ? DOMPurify.sanitize(product.description) : '';

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

  const handleAddToCart = () => {
    if (inCart) {
      updateQuantity(product.id, quantity);
    } else {
      addToCart(product, quantity);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to add a review.');
      return;
    }

    const rating = parseInt(reviewForm.rating, 10);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast.error('Please choose a rating from 1 to 5.');
      return;
    }

    if (!reviewForm.body.trim()) {
      toast.error('Please write a review message.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const { data } = await addProductReview(slug, {
        rating,
        title: reviewForm.title.trim(),
        body: reviewForm.body.trim(),
      });

      if (data.success) {
        toast.success(data.message || 'Review submitted successfully.');
        setReviewForm({ rating: '', title: '', body: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <motion.div
      className="product-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="material-icons-round breadcrumb__sep">chevron_right</span>
          <Link to="/products" className="breadcrumb__link">Shop</Link>
          <span className="material-icons-round breadcrumb__sep">chevron_right</span>
          {product.category_name && (
            <>
              <Link to={`/category/${product.category_slug}`} className="breadcrumb__link">
                {product.category_name}
              </Link>
              <span className="material-icons-round breadcrumb__sep">chevron_right</span>
            </>
          )}
          <span className="breadcrumb__current">{product.name}</span>
        </nav>

        {/* ─── Product Main ─────────────────────────────────────────── */}
        <div className="pd-main">
          {/* Image */}
          <motion.div
            className="pd-image"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="pd-image__main">
              {detailImage ? (
                <img
                  src={resolveAssetUrl(detailImage)}
                  alt={product.name}
                  className="pd-image__img"
                />
              ) : (
                <div className="pd-image__placeholder">
                  <span className="material-icons-round">shopping_bag</span>
                </div>
              )}

              {/* Badges */}
              <div className="pd-image__badges">
                {discount > 0 && (
                  <span className="pd-badge pd-badge--sale">-{discount}%</span>
                )}
                {product.is_featured === 1 && (
                  <span className="pd-badge pd-badge--featured">⭐ Featured</span>
                )}
              </div>

              {/* Wishlist */}
              <motion.button
                className={`pd-wishlist-btn ${wishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="material-icons-round">
                  {wishlisted ? 'favorite' : 'favorite_border'}
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            className="pd-info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Category */}
            <Link to={`/category/${product.category_slug}`} className="pd-info__category">
              {product.category_name}
            </Link>

            <h1 className="pd-info__name">{product.name}</h1>

            {/* Rating */}
            <div className="pd-info__rating">
              <div className="pd-info__stars">{renderStars(product.rating || 0)}</div>
              <span className="pd-info__rating-value">{product.rating || 0}</span>
              <span className="pd-info__review-count">({product.review_count || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="pd-info__pricing">
              <span className="pd-info__price">Tk {parseFloat(product.price).toFixed(2)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="pd-info__compare-price">
                  Tk {parseFloat(product.compare_price).toFixed(2)}
                </span>
              )}
              {discount > 0 && (
                <span className="pd-info__discount">Save {discount}%</span>
              )}
            </div>

            {/* Short Description */}
            {product.short_desc && (
              <p className="pd-info__short-desc">{product.short_desc}</p>
            )}

            {/* Meta Info */}
            <div className="pd-info__meta">
              <div className="pd-meta-item">
                <span className="pd-meta-label">SKU</span>
                <span className="pd-meta-value">{product.sku}</span>
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-label">Brand</span>
                <span className="pd-meta-value">{product.brand || 'Moniluck'}</span>
              </div>
              <div className="pd-meta-item">
                <span className="pd-meta-label">Availability</span>
                <span className={`pd-meta-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="pd-actions">
                <div className="pd-qty">
                  <button
                    className="pd-qty__btn"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    <span className="material-icons-round">remove</span>
                  </button>
                  <span className="pd-qty__value">{quantity}</span>
                  <button
                    className="pd-qty__btn"
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <span className="material-icons-round">add</span>
                  </button>
                </div>

                <motion.button
                  className={`pd-add-to-cart ${inCart ? 'in-cart' : ''}`}
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="material-icons-round">
                    {inCart ? 'check' : 'add_shopping_cart'}
                  </span>
                  {inCart ? 'Update Cart' : 'Add to Cart'}
                </motion.button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="pd-trust">
              <div className="pd-trust__item">
                <span className="material-icons-round">local_shipping</span>
                <span>Free Shipping</span>
              </div>
              <div className="pd-trust__item">
                <span className="material-icons-round">autorenew</span>
                <span>30-Day Returns</span>
              </div>
              <div className="pd-trust__item">
                <span className="material-icons-round">verified_user</span>
                <span>Secure Checkout</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Tabs ────────────────────────────────────────────────── */}
        <div className="pd-tabs">
          <div className="pd-tabs__nav">
            {['description', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`pd-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="pd-tabs__content">
            {activeTab === 'description' && (
              <motion.div
                className="pd-tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key="description"
              >
                {sanitizedDescription ? (
                  <div
                    className="pd-rich-content"
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                  />
                ) : (
                  <p>{product.short_desc || 'No description available.'}</p>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                className="pd-tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key="reviews"
              >
                <div className="pd-review-form-card">
                  <div className="pd-review-form-card__header">
                    <div>
                      <h3>Write a Review</h3>
                      <p>
                        Share your experience with this product.
                        {isAuthenticated ? ` Posting as ${user?.first_name || 'you'}.` : ' Please log in to submit a review.'}
                      </p>
                    </div>
                    {!isAuthenticated && (
                      <Link to="/login" className="btn btn-primary btn-sm">
                        Log In
                      </Link>
                    )}
                  </div>

                  {isAuthenticated && (
                    <form className="pd-review-form" onSubmit={handleReviewSubmit}>
                      <div className="pd-review-form__rating">
                        <label className="form-label">Rating *</label>
                        <div className="pd-review-rating-options">
                          {[5, 4, 3, 2, 1].map(value => (
                            <button
                              key={value}
                              type="button"
                              className={`pd-review-rating-btn ${parseInt(reviewForm.rating, 10) === value ? 'active' : ''}`}
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: String(value) }))}
                            >
                              {'★'.repeat(value)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pd-review-form__grid">
                        <div className="form-group">
                          <label className="form-label">Review Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={reviewForm.title}
                            onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Short summary of your experience"
                          />
                        </div>
                        <div className="form-group pd-review-form__textarea-group">
                          <label className="form-label">Review *</label>
                          <textarea
                            className="form-input pd-review-form__textarea"
                            value={reviewForm.body}
                            onChange={e => setReviewForm(prev => ({ ...prev, body: e.target.value }))}
                            placeholder="Tell other customers what you liked or what could be improved..."
                            rows="5"
                          />
                        </div>
                      </div>

                      <div className="pd-review-form__actions">
                        <p className="pd-review-form__hint">
                          Reviews are checked before publishing.
                        </p>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={reviewSubmitting || authLoading}
                        >
                          {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="pd-no-reviews">
                    <span className="material-icons-round">rate_review</span>
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="pd-reviews-list">
                    {reviews.map(review => (
                      <div key={review.id} className="pd-review">
                        <div className="pd-review__header">
                          <div className="pd-review__avatar">
                            {review.reviewer_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4>{review.reviewer_name}</h4>
                            <div className="pd-review__stars">{renderStars(review.rating)}</div>
                          </div>
                          <span className="pd-review__date">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && <h5 className="pd-review__title">{review.title}</h5>}
                        {review.body && <p className="pd-review__body">{review.body}</p>}
                        {review.admin_reply && (
                          <div className="pd-review__reply">
                            <span className="pd-review__reply-label">Admin Reply</span>
                            <p>{review.admin_reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── Related Products ────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="pd-related section-padding-sm">
            <div className="section-header">
              <span className="section-tag">Related</span>
              <h2 className="section-title">You May Also <span>Like</span></h2>
            </div>
            <div className="pd-related__grid">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};

export default ProductDetail;