import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProducts } from '../../utils/api';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  /* ─── Focus input on open ───────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setSearched(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* ─── Keyboard shortcut ────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* ─── Debounced Search ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const { data } = await searchProducts(query);
        if (data.success) setResults(data.products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleResultClick = () => onClose();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="search-modal"
            initial={{ opacity: 0, y: -30, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -30, scale: 0.95, x: '-50%' }}
            transition={{ duration: 0.3 }}
          >
            {/* Search Input */}
            <form className="search-modal__form" onSubmit={handleSubmit}>
              <span className="material-icons-round search-modal__icon">search</span>
              <input
                ref={inputRef}
                type="text"
                className="search-modal__input"
                placeholder="Search products, categories, brands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="search-modal__clear"
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                >
                  <span className="material-icons-round">close</span>
                </button>
              )}
              <button type="button" className="search-modal__close-btn" onClick={onClose}>
                <span className="search-modal__esc-badge">ESC</span>
              </button>
            </form>

            {/* Results */}
            <div className="search-modal__body">
              {loading && (
                <div className="search-modal__loading">
                  <div className="spinner spinner-sm" />
                  <span>Searching...</span>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="search-modal__results">
                  <p className="search-modal__results-count">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </p>
                  {results.map(product => (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      className="search-result-item"
                      onClick={handleResultClick}
                    >
                      <div className="search-result-item__image">
                        <span className="material-icons-round">shopping_bag</span>
                      </div>
                      <div className="search-result-item__info">
                        <h4>{product.name}</h4>
                        <span className="search-result-item__category">{product.category_name}</span>
                      </div>
                      <div className="search-result-item__price">
                        Tk {parseFloat(product.price).toFixed(2)}
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="search-result-item__old-price">
                            Tk {parseFloat(product.compare_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <button
                    className="search-modal__view-all"
                    onClick={() => { navigate(`/products?search=${encodeURIComponent(query)}`); onClose(); }}
                  >
                    View all results
                    <span className="material-icons-round">arrow_forward</span>
                  </button>
                </div>
              )}

              {!loading && searched && results.length === 0 && (
                <div className="search-modal__empty">
                  <span className="material-icons-round">search_off</span>
                  <h4>No products found</h4>
                  <p>Try a different search term or browse our categories.</p>
                </div>
              )}

              {!loading && !searched && (
                <div className="search-modal__suggestions">
                  <p className="search-modal__suggestions-title">Popular Searches</p>
                  <div className="search-modal__tags">
                    {['Home Cleaner', 'Dish Wash', 'Body Lotion', 'Laundry Detergent', 'Toilet Cleaner'].map(tag => (
                      <button
                        key={tag}
                        className="search-modal__tag"
                        onClick={() => setQuery(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;