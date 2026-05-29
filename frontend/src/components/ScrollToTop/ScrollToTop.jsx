import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  /* ─── Scroll to top on route change ─────────────────────────────────────── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  /* ─── Show/hide button ───────────────────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.15, y: -3 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <span className="material-icons-round">keyboard_arrow_up</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;