import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Testimonials.css';

const testimonials = [
  {
    id    : 1,
    name  : 'Mr. Abdul Karim',
    role  : 'Homemaker',
    avatar: 'SJ',
    text  : 'Moniluck products have completely transformed how I clean my home. The all-purpose cleaner is incredible — one bottle does everything! My house has never smelled this fresh.',
    rating: 5,
    color : '#667eea',
  },
  {
    id    : 2,
    name  : 'Chef Sanjay Jha',
    role  : 'Chef & Food Blogger',
    avatar: 'MC',
    text  : 'As a chef, kitchen hygiene is paramount. The Moniluck Kitchen Degreaser is the most effective product I\'ve ever used. It cuts through grease like magic. Absolutely love it!',
    rating: 5,
    color : '#f093fb',
  },
  {
    id    : 3,
    name  : 'Ms. Emily Rose',
    role  : 'Working Professional',
    avatar: 'ER',
    text  : 'The moisturizing body lotion is divine! My skin stays hydrated all day even in winter. Plus, knowing it\'s eco-friendly makes me feel great about my purchase. Highly recommend!',
    rating: 5,
    color : '#fa709a',
  },
  {
    id    : 4,
    name  : 'David Park',
    role  : 'Father of Three',
    avatar: 'DP',
    text  : 'Finding a laundry detergent that handles kids\' messy clothes AND is gentle on sensitive skin was a challenge — until I found Moniluck. It\'s now a permanent item in our shopping list.',
    rating: 5,
    color : '#4facfe',
  },
  {
    id    : 5,
    name  : 'Aisha Patel',
    role  : 'Interior Designer',
    avatar: 'AP',
    text  : 'I recommend Moniluck to all my clients. Their home care range keeps living spaces spotless without any harsh chemical residue. The packaging is also beautifully designed!',
    rating: 5,
    color : '#43e97b',
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);

  const goNext = () => setActive(prev => (prev + 1) % testimonials.length);
  const goPrev = () => setActive(prev => (prev - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[active];

  return (
    <section className="testimonials section-padding">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag">Reviews</span>
          <h2 className="section-title">What Our Customers <span>Say</span></h2>
          <p className="section-subtitle">Real stories from real people who love Moniluck products.</p>
        </motion.div>

        <div className="testimonials__wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              className="testimonial-card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {/* Quote Icon */}
              <div className="testimonial-card__quote" style={{ color: t.color }}>
                <span className="material-icons-round">format_quote</span>
              </div>

              {/* Text */}
              <p className="testimonial-card__text">"{t.text}"</p>

              {/* Stars */}
              <div className="testimonial-card__stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star star--full">★</span>
                ))}
              </div>

              {/* Author */}
              <div className="testimonial-card__author">
                <div
                  className="testimonial-card__avatar"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}80)` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <h4 className="testimonial-card__name">{t.name}</h4>
                  <p className="testimonial-card__role">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="testimonials__nav">
            <motion.button
              className="testimonials__nav-btn"
              onClick={goPrev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="material-icons-round">chevron_left</span>
            </motion.button>

            <div className="testimonials__dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testimonials__dot ${i === active ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>

            <motion.button
              className="testimonials__nav-btn"
              onClick={goNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="material-icons-round">chevron_right</span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;