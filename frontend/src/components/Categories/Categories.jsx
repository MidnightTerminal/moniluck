import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories } from '../../utils/api';
import './Categories.css';

const categoryIcons = {
  'home-care':     { icon: '🏠', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  'kitchen-care':  { icon: '🍳', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  'personal-care': { icon: '🌸', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  'clothing-care': { icon: '👗', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  'toilet-care':   { icon: '🚿', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchCategories();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const cardVariants = {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (loading) {
    return (
      <section className="categories section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Categories</span>
            <h2 className="section-title">Shop by <span>Category</span></h2>
            <p className="section-subtitle">Find exactly what you need across our curated care categories.</p>
          </div>
          <div className="categories__grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="category-card category-card--skeleton">
                <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: '60%', height: 20, marginTop: 16 }} />
                <div className="skeleton" style={{ width: '80%', height: 14, marginTop: 8 }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories section-padding">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag">Categories</span>
          <h2 className="section-title">Shop by <span>Category</span></h2>
          <p className="section-subtitle">Find exactly what you need across our curated care categories.</p>
        </motion.div>

        <motion.div
          className="categories__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {categories.map((cat) => {
            const config = categoryIcons[cat.slug] || { icon: '📦', gradient: 'var(--gradient-primary)' };
            return (
              <motion.div key={cat.id} variants={cardVariants}>
                <Link to={`/category/${cat.slug}`} className="category-card">
                  {/* Glow Background */}
                  <div className="category-card__glow" style={{ background: config.gradient }} />

                  {/* Icon */}
                  <div className="category-card__icon-wrapper">
                    <div className="category-card__icon-bg" style={{ background: config.gradient }} />
                    <span className="category-card__icon">{config.icon}</span>
                  </div>

                  {/* Text */}
                  <h3 className="category-card__name">{cat.name}</h3>
                  <p className="category-card__desc">{cat.description}</p>

                  {/* Product Count */}
                  <div className="category-card__count">
                    <span>{cat.product_count || 0}</span> Products
                  </div>

                  {/* Arrow */}
                  <div className="category-card__arrow">
                    <span className="material-icons-round">arrow_forward</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;