import React from 'react';
import { motion } from 'framer-motion';
import { resolveAssetUrl } from '../../utils/helpers';
import './Brands.css';

const brands = [
  { id: 1, name: 'MEMINE', image: '/images/brands/memine.png' },
  { id: 2, name: 'RANGILA', image: '/images/brands/rangila.png' },
  { id: 3, name: 'RUPOSHI', image: '/images/brands/ruposi.png' },
  { id: 4, name: 'NIRMOL', image: '/images/brands/nirmol.png' },
  { id: 5, name: 'MEEM', image: '/images/brands/meem.png' },
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
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              className="brand-card"
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="brand-card__logo-placeholder">
                <img src={resolveAssetUrl(brand.image)} alt={`${brand.name} logo`} loading="lazy" />
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