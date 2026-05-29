import React from 'react';
import { motion } from 'framer-motion';
import './Brands.css';

const brands = [
  { id: 1, name: 'Brand One',   placeholder: 'B1' },
  { id: 2, name: 'Brand Two',   placeholder: 'B2' },
  { id: 3, name: 'Brand Three', placeholder: 'B3' },
  { id: 4, name: 'Brand Four',  placeholder: 'B4' },
];

const Brands = () => {
  return (
    <section className="brands section-padding-sm">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
        >
          <span className="section-tag">Partners</span>
          <h2 className="section-title">Our Trusted <span>Brands</span></h2>
          <p className="section-subtitle">We proudly partner with industry-leading brands to bring you the finest care products.</p>
        </motion.div>

        <motion.div
          className="brands__grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              className="brand-card"
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="brand-card__logo-placeholder">
                <span>{brand.placeholder}</span>
              </div>
              <p className="brand-card__name">{brand.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Brands;