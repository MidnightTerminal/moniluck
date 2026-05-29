import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from '../../utils/api';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await subscribeToNewsletter(email);
      if (data.success) {
        toast.success(data.message || 'Subscribed successfully! 🎉');
        setEmail('');
      }
    } catch (err) {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter__bg">
        <div className="newsletter__blob newsletter__blob--1" />
        <div className="newsletter__blob newsletter__blob--2" />
      </div>

      <div className="container">
        <motion.div
          className="newsletter__inner"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="newsletter__content">
            <span className="newsletter__icon">💌</span>
            <h2 className="newsletter__title">Stay In The Loop</h2>
            <p className="newsletter__subtitle">
              Subscribe to our newsletter for exclusive deals, product launches, and care tips delivered right to your inbox.
            </p>

            <form className="newsletter__form" onSubmit={handleSubmit}>
              <div className="newsletter__input-wrapper">
                <span className="material-icons-round newsletter__input-icon">email</span>
                <input
                  type="email"
                  className="newsletter__input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <motion.button
                type="submit"
                className="newsletter__btn"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                ) : (
                  <>
                    Subscribe
                    <span className="material-icons-round">send</span>
                  </>
                )}
              </motion.button>
            </form>

            <p className="newsletter__privacy">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;