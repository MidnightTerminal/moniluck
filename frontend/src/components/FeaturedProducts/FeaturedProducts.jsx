import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchFeaturedProducts } from '../../utils/api';
import ProductCard from '../ProductCard/ProductCard';
import './FeaturedProducts.css';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchFeaturedProducts(12);
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => p.category_slug === filter);

  const filters = [
    { key: 'all',            label: 'All' },
    { key: 'home-care',     label: 'Home Care' },
    { key: 'kitchen-care',  label: 'Kitchen' },
    { key: 'personal-care', label: 'Personal' },
    { key: 'clothing-care', label: 'Clothing' },
    { key: 'toilet-care',   label: 'Toilet' },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const cardVariants = {
    hidden:  { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <section className="featured section-padding">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag">Featured</span>
          <h2 className="section-title">Our Best <span>Sellers</span></h2>
          <p className="section-subtitle">Handpicked top-rated products loved by thousands of happy customers.</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="featured__filters"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {filters.map(f => (
            <button
              key={f.key}
              className={`featured__filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="featured__grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-card-skeleton">
                <div className="skeleton" style={{ height: 220, borderRadius: '16px 16px 0 0' }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="featured__grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            key={filter}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <motion.div key={product.id} variants={cardVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="featured__empty">
                <span className="material-icons-round">inventory_2</span>
                <p>No products found in this category.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          className="featured__view-all"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link to="/products" className="btn btn-primary btn-lg">
            <span>View All Products</span>
            <span className="material-icons-round">arrow_forward</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;