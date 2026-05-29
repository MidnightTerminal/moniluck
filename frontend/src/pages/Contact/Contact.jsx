import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendContactForm } from '../../utils/api';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name   : '',
    email  : '',
    phone  : '',
    subject: '',
    message: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())    errs.name    = 'Name is required.';
    if (!formData.email.trim())   errs.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email.';
    if (!formData.subject.trim()) errs.subject = 'Subject is required.';
    if (!formData.message.trim()) errs.message = 'Message is required.';
    else if (formData.message.trim().length < 10) errs.message = 'Minimum 10 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await sendContactForm(formData);
      if (data.success) {
        setSent(true);
        toast.success('Message sent successfully!');
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: 'location_on', title: 'Address',     value: '123 Care Street, City, Country' },
    { icon: 'email',       title: 'Email',       value: 'info@moniluck.com', link: 'mailto:info@moniluck.com' },
    { icon: 'phone',       title: 'Phone',       value: '+1 (234) 567-890',  link: 'tel:+1234567890' },
    { icon: 'schedule',    title: 'Working Hours',value: 'Mon – Sat: 9AM – 7PM' },
  ];

  return (
    <motion.div
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <section className="contact-hero">
        <div className="contact-hero__bg" />
        <div className="container">
          <motion.div
            className="contact-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-tag">Contact</span>
            <h1 className="contact-hero__title">Get In <span>Touch</span></h1>
            <p className="contact-hero__subtitle">
              Have a question, feedback, or need help? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="contact-content section-padding">
        <div className="container">
          <div className="contact-grid">
            {/* Info Side */}
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="contact-info__title">Let's Talk</h2>
              <p className="contact-info__desc">
                Whether you have a question about our products, need assistance with an order, or want to partner with us — reach out. We're here to help.
              </p>

              <div className="contact-info__list">
                {contactInfo.map((item, i) => (
                  <div key={i} className="contact-info__item">
                    <div className="contact-info__icon">
                      <span className="material-icons-round">{item.icon}</span>
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      {item.link ? (
                        <a href={item.link}>{item.value}</a>
                      ) : (
                        <p>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="contact-map-placeholder">
                <span className="material-icons-round">map</span>
                <p>Map will be integrated here</p>
              </div>
            </motion.div>

            {/* Form Side */}
            <motion.div
              className="contact-form-wrapper"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {!sent ? (
                <>
                  <h2 className="contact-form__title">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          className={`form-input ${errors.name ? 'error' : ''}`}
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          className={`form-input ${errors.email ? 'error' : ''}`}
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phone (optional)</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-input"
                          placeholder="+1 (234) 567-890"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Subject *</label>
                        <input
                          type="text"
                          name="subject"
                          className={`form-input ${errors.subject ? 'error' : ''}`}
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                        {errors.subject && <span className="form-error">{errors.subject}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea
                        name="message"
                        className={`form-input form-textarea ${errors.message ? 'error' : ''}`}
                        placeholder="Tell us more about your enquiry..."
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                      />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>

                    <motion.button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <div className="btn-loading">
                          <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <span className="material-icons-round">send</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              ) : (
                <div className="contact-success">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="contact-success__icon"
                  >
                    <span className="material-icons-round">check_circle</span>
                  </motion.div>
                  <h2>Message Sent!</h2>
                  <p>Thank you for reaching out. We'll get back to you within 24–48 hours.</p>
                  <button className="btn btn-primary" onClick={() => { setSent(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                    Send Another Message
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;