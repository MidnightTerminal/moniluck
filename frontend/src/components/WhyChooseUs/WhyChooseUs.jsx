import React from 'react';
import { motion } from 'framer-motion';
import './WhyChooseUs.css';

const features = [
  {
    icon:     'verified',
    title:    'Premium Quality',
    desc:     'Every product undergoes rigorous quality checks to ensure you receive nothing but the best.',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  },
  {
    icon:     'local_shipping',
    title:    'Fast Delivery',
    desc:     'Get your orders delivered quickly and safely to your doorstep with real-time tracking.',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
  },
  {
    icon:     'eco',
    title:    'Eco Friendly',
    desc:     'Our products are formulated with environmentally safe ingredients and sustainable packaging.',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
  },
  {
    icon:     'support_agent',
    title:    '24/7 Support',
    desc:     'Our dedicated support team is always available to help you with any queries or concerns.',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
  },
  {
    icon:     'autorenew',
    title:    'Easy Returns',
    desc:     'Not satisfied? We offer hassle-free returns within 30 days for a full refund.',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
  },
  {
    icon:     'lock',
    title:    'Secure Payments',
    desc:     'Shop with confidence using our fully encrypted and secure payment gateway.',
    gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)',
  },
];

const WhyChooseUs = () => {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="why-choose section-padding">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag">Why Us</span>
          <h2 className="section-title">Why Choose <span>Moniluck</span></h2>
          <p className="section-subtitle">We go the extra mile to ensure your shopping experience is exceptional.</p>
        </motion.div>

        <motion.div
          className="why-choose__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((feature, i) => (
            <motion.div key={i} className="why-choose__card" variants={cardVariants}>
              <div className="why-choose__icon-wrap">
                <div className="why-choose__icon-bg" style={{ background: feature.gradient }} />
                <span className="material-icons-round why-choose__icon">{feature.icon}</span>
              </div>
              <h4 className="why-choose__title">{feature.title}</h4>
              <p className="why-choose__desc">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;