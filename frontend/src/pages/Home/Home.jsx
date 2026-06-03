import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../../components/Hero/Hero';
import Categories from '../../components/Categories/Categories';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import TrendingBanner from '../../components/TrendingBanner/TrendingBanner';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import Brands from '../../components/Brands/Brands';
import Testimonials from '../../components/Testimonials/Testimonials';
import Newsletter from '../../components/Newsletter/Newsletter';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import './Home.css';

const Home = () => {
  const { shipping } = useSiteSettings();

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Hero />

      {/* Stats Bar */}
      <section className="home-stats">
        <div className="container">
          <div className="home-stats__grid">
            <div className="home-stats__item">
              <span className="material-icons-round">local_shipping</span>
              <div>
                <h4>{shipping.freeShippingEnabled ? 'Free Shipping' : 'Shipping Offer'}</h4>
                <p>
                  {shipping.freeShippingEnabled
                    ? `On orders over Tk ${shipping.freeShippingMin}`
                    : `Standard shipping starts at Tk ${shipping.standard.cost}`}
                </p>
              </div>
            </div>
            <div className="home-stats__item">
              <span className="material-icons-round">verified_user</span>
              <div>
                <h4>Secure Payment</h4>
                <p>100% protected</p>
              </div>
            </div>
            <div className="home-stats__item">
              <span className="material-icons-round">support_agent</span>
              <div>
                <h4>24/7 Support</h4>
                <p>Dedicated help</p>
              </div>
            </div>
            <div className="home-stats__item">
              <span className="material-icons-round">autorenew</span>
              <div>
                <h4>Easy Returns</h4>
                <p>30-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Categories />
      <FeaturedProducts />
      <TrendingBanner />
      <WhyChooseUs />
      <Brands />
      <Testimonials />
      <Newsletter />
    </motion.div>
  );
};

export default Home;