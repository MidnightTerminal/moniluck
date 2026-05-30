import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './About.css';

const milestones = [
  { year: '2018', title: 'Founded', desc: 'Moniluck Group of Industries established with a vision to transform the care products industry in Bangladesh.' },
  { year: '2019', title: 'First Factory', desc: 'Set up our first state-of-the-art manufacturing facility in Jhalokathi with modern lab and production lines.' },
  { year: '2020', title: 'Nationwide Reach', desc: 'Expanded sales and distribution channels across Bangladesh, reaching every corner of the country.' },
  { year: '2021', title: 'Dhaka HQ & Factory', desc: 'Established our National Headquarters and second factory in Dhaka to meet growing demand.' },
  { year: '2023', title: 'Product Innovation', desc: 'Launched new product lines in Hair Care, Skin Care, Cleaning and Hygiene categories with global standards.' },
  { year: '2024', title: 'Digital Expansion', desc: 'Launched our e-commerce platform to serve customers nationwide with doorstep delivery.' },
];

const values = [
  { icon: 'diamond',       title: 'Quality',      desc: 'We never compromise on quality. Every product meets global manufacturing standards.',               color: '#667eea' },
  { icon: 'handshake',     title: 'Integrity',     desc: 'Transparency and honesty are the foundation of every business relationship we build.',              color: '#10b981' },
  { icon: 'lightbulb',     title: 'Innovation',    desc: 'We constantly invest in the latest technology and R&D to bring better products to the market.',     color: '#f59e0b' },
  { icon: 'favorite',      title: 'Customer First', desc: 'Every decision we make is guided by the needs and expectations of our valued customers.',         color: '#ef4444' },
  { icon: 'groups',        title: 'Teamwork',      desc: 'Our talented and passionate team is our greatest asset, driving excellence every single day.',       color: '#8b5cf6' },
  { icon: 'eco',           title: 'Sustainability', desc: 'We are committed to sustainable manufacturing practices and eco-friendly product development.',    color: '#06b6d4' },
];

const stats = [
  { value: '500+', label: 'Products',          icon: 'inventory_2' },
  { value: '50K+', label: 'Happy Customers',    icon: 'sentiment_satisfied' },
  { value: '2',    label: 'Factories',          icon: 'factory' },
  { value: '64',   label: 'Districts Covered',  icon: 'location_on' },
  { value: '200+', label: 'Team Members',       icon: 'groups' },
  { value: '4',    label: 'Brand Partners',     icon: 'handshake' },
];

const teamMembers = [
  { name: 'Team Member 1', role: 'CEO & Founder',     initials: 'TM', color: '#667eea' },
  { name: 'Team Member 2', role: 'Managing Director', initials: 'TM', color: '#f093fb' },
  { name: 'Team Member 3', role: 'Head of Operations', initials: 'TM', color: '#fa709a' },
  { name: 'Team Member 4', role: 'Chief Marketing Officer', initials: 'TM', color: '#4facfe' },
];

const About = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero__bg">
          <div className="about-hero__blob about-hero__blob--1" />
          <div className="about-hero__blob about-hero__blob--2" />
          <div className="about-hero__grid-pattern" />
        </div>

        <div className="container">
          <motion.div
            className="about-hero__content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">About Us</span>
            <h1 className="about-hero__title">
              Caring for Every Corner<br />
              of Your <span>Life</span>
            </h1>
            <p className="about-hero__subtitle">
              Moniluck Cosmetic & Consumer Products Ltd. — a concern of the fast-growing 
              <strong> Moniluck Group of Industries</strong>, committed to manufacturing 
              world-class care products right here in Bangladesh.
            </p>
            <div className="about-hero__ctas">
              <Link to="/products" className="btn btn-primary btn-lg">
                <span>Explore Products</span>
                <span className="material-icons-round">arrow_forward</span>
              </Link>
              <Link to="/contact" className="btn btn-white btn-lg">
                <span>Get in Touch</span>
                <span className="material-icons-round">chat</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Bar ─────────────────────────────────────────────── */}
      <section className="about-stats">
        <div className="container">
          <motion.div
            className="about-stats__grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {stats.map((stat, i) => (
              <motion.div key={i} className="about-stat" variants={cardVariants}>
                <span className="material-icons-round about-stat__icon">{stat.icon}</span>
                <span className="about-stat__value">{stat.value}</span>
                <span className="about-stat__label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Who We Are ─────────────────────────────────────────────── */}
      <section className="about-who section-padding">
        <div className="container">
          <div className="about-who__grid">
            {/* Image Side */}
            <motion.div
              className="about-who__visual"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="about-who__image-card about-who__image-card--main">
                <img
                  src="/images/hero/home-care.jpg"
                  alt="Moniluck care products and manufacturing"
                  className="about-who__image"
                />
                <div className="about-who__image-overlay">
                  <span className="material-icons-round">factory</span>
                  <p>Factory & Operations</p>
                </div>
              </div>
              <div className="about-who__image-card about-who__image-card--small">
                <img
                  src="/images/hero/personal-care.jpg"
                  alt="Modern laboratory and product innovation"
                  className="about-who__image"
                />
                <div className="about-who__image-overlay about-who__image-overlay--small">
                  <span className="material-icons-round">science</span>
                  <p>Modern Lab</p>
                </div>
              </div>
              <motion.div
                className="about-who__experience-badge"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="about-who__exp-number">6+</span>
                <span className="about-who__exp-text">Years of Excellence</span>
              </motion.div>
            </motion.div>

            {/* Text Side */}
            <motion.div
              className="about-who__text"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <span className="section-tag">Who We Are</span>
              <h2 className="about-who__title">
                Manufacturing Global Standard<br />
                <span>Care Products</span> in Bangladesh
              </h2>
              <p className="about-who__desc">
                <strong>Moniluck Cosmetic & Consumer Products Ltd.</strong> is a concern of the fast-growing 
                conglomerate <strong>Moniluck Group of Industries</strong>. We are desirous to manufacture 
                global standard Hair Care, Skin Care, Cosmetic, Consumer, Cleaning and Hygiene Products 
                in Bangladesh.
              </p>
              <p className="about-who__desc">
                With our National Headquarters in <strong>Dhaka</strong> and manufacturing facilities in 
                <strong> Jhalokathi</strong> and <strong>Dhaka</strong>, we are a rapidly growing company 
                enriched with the most updated technology and state-of-the-art factory and lab setup, 
                including nationwide sales and distribution channels.
              </p>

              <div className="about-who__highlights">
                <div className="about-who__highlight">
                  <div className="about-who__highlight-icon" style={{ background: 'rgba(102,126,234,0.1)' }}>
                    <span className="material-icons-round" style={{ color: '#667eea' }}>location_city</span>
                  </div>
                  <div>
                    <h4>NHQ in Dhaka</h4>
                    <p>National Headquarters & Operations Center</p>
                  </div>
                </div>
                <div className="about-who__highlight">
                  <div className="about-who__highlight-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <span className="material-icons-round" style={{ color: '#10b981' }}>precision_manufacturing</span>
                  </div>
                  <div>
                    <h4>Factory in Jhalokathi & Dhaka</h4>
                    <p>State-of-the-art manufacturing with modern labs</p>
                  </div>
                </div>
                <div className="about-who__highlight">
                  <div className="about-who__highlight-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <span className="material-icons-round" style={{ color: '#f59e0b' }}>local_shipping</span>
                  </div>
                  <div>
                    <h4>Nationwide Distribution</h4>
                    <p>Reaching every corner of Bangladesh with quality products</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Philosophy ─────────────────────────────────────────────── */}
      <section className="about-philosophy section-padding">
        <div className="container">
          <motion.div
            className="section-header"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="section-tag">Our Philosophy</span>
            <h2 className="section-title">What Drives <span>Us Forward</span></h2>
            <p className="section-subtitle">
              Our business philosophy is built on innovation, quality, and an unwavering commitment 
              to our customers' success and satisfaction.
            </p>
          </motion.div>

          <div className="about-philosophy__grid">
            {/* Philosophy Card */}
            <motion.div
              className="about-philosophy__card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="about-philosophy__card-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <span className="material-icons-round">auto_awesome</span>
              </div>
              <h3>Business Philosophy</h3>
              <p>
                Our business policy is to always be unique and lead towards a source of new style 
                as well as new way of attaining success. We are dedicated to the betterment and 
                for all the solutions of our customer's needs and demands.
              </p>
              <p>
                Get in touch with all kinds of services provided by us and experience the best of 
                helping hand. We believe in delivering quality services with all kinds of integrity 
                as well as transparency.
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              className="about-philosophy__card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="about-philosophy__card-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                <span className="material-icons-round">rocket_launch</span>
              </div>
              <h3>Our Mission</h3>
              <p>
                Our mission aims at meeting all the needs of our clients as well as business partners 
                in terms of delivery, design as well as pricing of our services. We consider these as 
                our key factors in building lasting relationships.
              </p>
              <p>
                We are very proud of meeting all the expectations of our customers and succeeding our 
                graph of progress with each passing day. We lead a culture of excellence where loyalty, 
                talent, creativity, open communication as well as integrity are our core values.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              className="about-philosophy__card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="about-philosophy__card-icon" style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)' }}>
                <span className="material-icons-round">visibility</span>
              </div>
              <h3>Our Vision</h3>
              <p>
                Our vision is to constantly improve the project delivery associated with us and to help 
                our clients by meeting their commercial goals through equipping and empowering our team.
              </p>
              <p>
                We constantly strive to be the leading cosmetic and consumer products manufacturer by 
                offering high-quality products and services that meet all the expectations of our 
                customers in terms of requirements, quality, and financial values.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Core Values ────────────────────────────────────────────── */}
      <section className="about-values section-padding">
        <div className="container">
          <motion.div
            className="section-header"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="section-tag">Our Values</span>
            <h2 className="section-title">The Values We <span>Stand By</span></h2>
            <p className="section-subtitle">
              These core principles guide everything we do — from manufacturing to customer service.
            </p>
          </motion.div>

          <motion.div
            className="about-values__grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {values.map((val, i) => (
              <motion.div
                key={i}
                className="about-value-card"
                variants={cardVariants}
              >
                <div
                  className="about-value-card__icon"
                  style={{ background: `${val.color}14` }}
                >
                  <span className="material-icons-round" style={{ color: val.color }}>
                    {val.icon}
                  </span>
                </div>
                <h4 className="about-value-card__title">{val.title}</h4>
                <p className="about-value-card__desc">{val.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Journey / Timeline ─────────────────────────────────────── */}
      <section className="about-timeline section-padding">
        <div className="container">
          <motion.div
            className="section-header"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="section-tag">Our Journey</span>
            <h2 className="section-title">Milestones of <span>Growth</span></h2>
            <p className="section-subtitle">A timeline of our growth and achievements since inception.</p>
          </motion.div>

          <div className="timeline">
            <div className="timeline__line" />
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                className={`timeline__item ${i % 2 === 0 ? 'timeline__item--left' : 'timeline__item--right'}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="timeline__dot" />
                <div className="timeline__card">
                  <span className="timeline__year">{m.year}</span>
                  <h4 className="timeline__title">{m.title}</h4>
                  <p className="timeline__desc">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Team ───────────────────────────────────────────────────── */}
      <section className="about-team section-padding">
        <div className="container">
          <motion.div
            className="section-header"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="section-tag">Our Team</span>
            <h2 className="section-title">Meet the <span>Leadership</span></h2>
            <p className="section-subtitle">The passionate people behind Moniluck's success story.</p>
          </motion.div>

          <motion.div
            className="about-team__grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                className="team-card"
                variants={cardVariants}
              >
                <div className="team-card__avatar" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}>
                  {member.initials}
                </div>
                <h4 className="team-card__name">{member.name}</h4>
                <p className="team-card__role">{member.role}</p>
                <div className="team-card__socials">
                  {[
                    { label: 'L', href: 'https://www.linkedin.com' },
                    { label: 'T', href: 'https://x.com' },
                    { label: 'E', href: 'mailto:info@moniluck.com' },
                  ].map((social, si) => (
                    <a key={si} href={social.href} className="team-card__social" target="_blank" rel="noreferrer">
                      {social.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────── */}
      <section className="about-cta">
        <div className="about-cta__bg">
          <div className="about-cta__blob about-cta__blob--1" />
          <div className="about-cta__blob about-cta__blob--2" />
        </div>
        <div className="container">
          <motion.div
            className="about-cta__content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>Ready to Experience Premium Care Products?</h2>
            <p>Join thousands of satisfied customers across Bangladesh who trust Moniluck for their daily care needs.</p>
            <div className="about-cta__buttons">
              <Link to="/products" className="btn btn-white btn-lg">
                <span>Shop Now</span>
                <span className="material-icons-round">shopping_bag</span>
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                <span>Contact Us</span>
                <span className="material-icons-round">arrow_forward</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;