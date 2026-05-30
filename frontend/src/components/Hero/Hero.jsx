import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveAssetUrl } from '../../utils/helpers';
import './Hero.css';

const slides = [
  {
    id      : 1,
    tag     : 'New Collection',
    title   : ['Transform Your', 'Home Into a', 'Sanctuary'],
    subtitle: 'Premium home care products crafted to keep every corner of your living space spotlessly clean, beautifully fresh, and hygienically safe.',
    cta     : { label: 'Shop Home Care', link: '/category/home-care' },
    cta2    : { label: 'Explore All', link: '/products' },
    category: 'home-care',
    image   : '/images/hero/home-care.jpg',
    accent  : '#667eea',
    accent2 : '#764ba2',
    badge   : { label: 'Best Seller', icon: 'workspace_premium' },
    stats   : [
      { value: '500+', label: 'Products' },
      { value: '50K+', label: 'Happy Customers' },
      { value: '4.8★', label: 'Avg Rating' },
    ],
    floatingCards: [
      { icon: 'cleaning_services', text: 'Deep Clean', color: '#667eea' },
      { icon: 'eco', text: 'Eco Friendly', color: '#10b981' },
      { icon: 'water_drop', text: 'Fresh Scent', color: '#06b6d4' },
    ],
  },
  {
    id      : 2,
    tag     : 'Kitchen Essentials',
    title   : ['Keep Your Kitchen', 'Sparkling Clean', '& Organized'],
    subtitle: 'Discover our powerful kitchen care range — from ultra-concentrated dish gels to heavy-duty degreasers that cut through the toughest grease.',
    cta     : { label: 'Shop Kitchen Care', link: '/category/kitchen-care' },
    cta2    : { label: 'View Deals', link: '/products?featured=true' },
    category: 'kitchen-care',
    image   : '/images/hero/kitchen-care.jpg',
    accent  : '#f093fb',
    accent2 : '#f5576c',
    badge   : { label: 'Top Rated', icon: 'star' },
    stats   : [
      { value: '100+', label: 'Kitchen Products' },
      { value: '99.9%', label: 'Germ Kill Rate' },
      { value: '30min', label: 'Free Delivery' },
    ],
    floatingCards: [
      { icon: 'auto_awesome', text: 'Streak Free', color: '#f093fb' },
      { icon: 'bolt', text: 'Ultra Power', color: '#f5576c' },
      { icon: 'verified_user', text: 'Safe Formula', color: '#667eea' },
    ],
  },
  {
    id      : 3,
    tag     : 'Personal Care',
    title   : ['Nourish Your Skin,', 'Elevate Your', 'Daily Routine'],
    subtitle: 'Luxury personal care formulated with premium natural ingredients. Hydrate, protect, and pamper your skin with our scientifically crafted range.',
    cta     : { label: 'Shop Personal Care', link: '/category/personal-care' },
    cta2    : { label: 'Discover More', link: '/products' },
    category: 'personal-care',
    image   : '/images/hero/personal-care.jpg',
    accent  : '#fa709a',
    accent2 : '#fee140',
    badge   : { label: 'New Arrivals', icon: 'new_releases' },
    stats   : [
      { value: '200+', label: 'Skin Products' },
      { value: '100%', label: 'Natural Extracts' },
      { value: '0%', label: 'Harsh Chemicals' },
    ],
    floatingCards: [
      { icon: 'spa', text: 'Natural', color: '#fa709a' },
      { icon: 'opacity', text: 'Hydrating', color: '#06b6d4' },
      { icon: 'nightlight', text: 'Gentle Care', color: '#764ba2' },
    ],
  },
  {
    id      : 4,
    tag     : 'Clothing Care',
    title   : ['Keep Every Fabric', 'Fresh, Soft &', 'Vibrant'],
    subtitle: 'Professional-grade laundry solutions that protect colors, remove stubborn stains, and leave your clothes irresistibly soft with long-lasting fragrance.',
    cta     : { label: 'Shop Clothing Care', link: '/category/clothing-care' },
    cta2    : { label: 'All Products', link: '/products' },
    category: 'clothing-care',
    image   : '/images/hero/clothing-care.jpg',
    accent  : '#4facfe',
    accent2 : '#00f2fe',
    badge   : { label: 'Fan Favorite', icon: 'favorite' },
    stats   : [
      { value: '80+', label: 'Fabric Products' },
      { value: '48hr', label: 'Fresh Guarantee' },
      { value: '∞', label: 'Washes Protected' },
    ],
    floatingCards: [
      { icon: 'checkroom', text: 'Fabric Safe', color: '#4facfe' },
      { icon: 'air', text: 'Long Lasting', color: '#fa709a' },
      { icon: 'palette', text: 'Color Guard', color: '#667eea' },
    ],
  },
];

const Hero = () => {
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused,    setPaused]    = useState(false);

  /* ─── Auto-play ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const goNext = () => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[current];

  /* ─── Framer Variants ────────────────────────────────────────────────────── */
  const slideVariants = {
    enter : (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit  : (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const textVariants = {
    hidden : { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' },
    }),
  };

  const cardVariants = {
    hidden : { opacity: 0, scale: 0.8, y: 20 },
    visible: (i) => ({
      opacity: 1, scale: 1, y: 0,
      transition: { delay: 0.6 + i * 0.15, duration: 0.5, type: 'spring', stiffness: 200 },
    }),
  };

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ─── Background ──────────────────────────────────────────────── */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={`bg-${current}`}
          className="hero__bg"
          style={{
            background: `linear-gradient(135deg, ${slide.accent}15 0%, ${slide.accent2}15 100%)`,
          }}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </AnimatePresence>

      {/* ─── Decorative Blobs ────────────────────────────────────────── */}
      <div className="hero__blob hero__blob--1"
        style={{ background: `radial-gradient(circle, ${slide.accent}30, transparent)` }}
      />
      <div className="hero__blob hero__blob--2"
        style={{ background: `radial-gradient(circle, ${slide.accent2}20, transparent)` }}
      />
      <div className="hero__grid-pattern" />

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <div className="hero__container">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={`content-${current}`}
            className="hero__content"
            custom={direction}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Left: Text Content */}
            <div className="hero__text">
              {/* Tag */}
              <motion.div
                className="hero__tag"
                variants={textVariants}
                custom={0}
              >
                {slide.tag}
              </motion.div>

              {/* Title */}
              <div className="hero__title">
                {slide.title.map((line, i) => (
                  <motion.h1
                    key={i}
                    variants={textVariants}
                    custom={i + 1}
                  >
                    {i === 1 ? (
                      <span
                        className="hero__title-gradient"
                        style={{
                          background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent2})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {line}
                      </span>
                    ) : line}
                  </motion.h1>
                ))}
              </div>

              {/* Subtitle */}
              <motion.p
                className="hero__subtitle"
                variants={textVariants}
                custom={4}
              >
                {slide.subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="hero__ctas"
                variants={textVariants}
                custom={5}
              >
                <Link
                  to={slide.cta.link}
                  className="hero__btn hero__btn--primary"
                  style={{
                    background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent2})`,
                    boxShadow : `0 8px 30px ${slide.accent}50`,
                  }}
                >
                  <span>{slide.cta.label}</span>
                  <span className="material-icons-round">arrow_forward</span>
                </Link>
                <Link
                  to={slide.cta2.link}
                  className="hero__btn hero__btn--secondary"
                >
                  <span>{slide.cta2.label}</span>
                  <span className="material-icons-round">explore</span>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="hero__stats"
                variants={textVariants}
                custom={6}
              >
                {slide.stats.map((stat, i) => (
                  <div key={i} className="hero__stat">
                    <span
                      className="hero__stat-value"
                      style={{ color: slide.accent }}
                    >
                      {stat.value}
                    </span>
                    <span className="hero__stat-label">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Visual */}
            <div className="hero__visual">
              {/* Main Card */}
              <motion.div
                className="hero__main-card"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.7, type: 'spring', stiffness: 150 }}
                style={{
                  background: `linear-gradient(145deg, ${slide.accent}18, ${slide.accent2}12)`,
                  borderColor: `${slide.accent}30`,
                }}
              >
                {/* Product Image Placeholder */}
                <div className="hero__product-display">
                  <div
                    className="hero__product-circle"
                    style={{
                      background: `linear-gradient(135deg, ${slide.accent}20, ${slide.accent2}20)`,
                    }}
                  >
                    <img
                      src={resolveAssetUrl(slide.image)}
                      alt={`${slide.category} collection`}
                      className="hero__product-image"
                    />
                  </div>

                  {/* Badge */}
                  <motion.div
                    className="hero__badge"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent2})`,
                    }}
                  >
                    <span className="material-icons-round hero__badge-icon">{slide.badge.icon}</span>
                    <span>{slide.badge.label}</span>
                  </motion.div>

                  {/* Rating Card */}
                  <motion.div
                    className="hero__rating-card"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <div className="hero__rating-stars">
                      {'★★★★★'.split('').map((s, i) => (
                        <span key={i} style={{ color: '#f59e0b' }}>{s}</span>
                      ))}
                    </div>
                    <p>4.8 from 50K+ reviews</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              {slide.floatingCards.map((card, i) => (
                <motion.div
                  key={i}
                  className={`hero__floating-card hero__floating-card--${i + 1}`}
                  variants={cardVariants}
                  custom={i}
                  animate={{
                    y: [0, -8 + i * 3, 0],
                    transition: {
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    },
                  }}
                  style={{ borderColor: `${card.color}30` }}
                >
                  <div
                    className="hero__floating-icon"
                    style={{ background: `${card.color}15` }}
                  >
                    <span className="material-icons-round">{card.icon}</span>
                  </div>
                  <span style={{ color: card.color }}>{card.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Navigation ──────────────────────────────────────────────── */}
      <div className="hero__nav">
        {/* Prev */}
        <motion.button
          className="hero__nav-btn hero__nav-btn--prev"
          onClick={goPrev}
          whileHover={{ scale: 1.1, x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-icons-round">chevron_left</span>
        </motion.button>

        {/* Dots */}
        <div className="hero__dots">
          {slides.map((s, i) => (
            <motion.button
              key={s.id}
              className={`hero__dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              style={i === current ? {
                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent2})`,
              } : {}}
            />
          ))}
        </div>

        {/* Next */}
        <motion.button
          className="hero__nav-btn hero__nav-btn--next"
          onClick={goNext}
          whileHover={{ scale: 1.1, x: 3 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-icons-round">chevron_right</span>
        </motion.button>
      </div>

      {/* ─── Progress Bar ────────────────────────────────────────────── */}
      {!paused && (
        <motion.div
          className="hero__progress"
          key={current}
          style={{
            background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent2})`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 6, ease: 'linear' }}
        />
      )}

      {/* ─── Scroll Indicator ────────────────────────────────────────── */}
      <motion.div
        className="hero__scroll"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel" />
        </div>
        <span>Scroll</span>
      </motion.div>
    </section>
  );
};

export default Hero;