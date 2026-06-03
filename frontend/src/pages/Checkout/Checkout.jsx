import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeOrder as submitOrder } from '../../utils/api';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { resolveAssetUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Checkout.css';

const STEPS = ['Information', 'Shipping', 'Payment', 'Confirmation'];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, cartSavings, cartCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { shipping, siteName } = useSiteSettings();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId]         = useState('');

  /* ─── Form State ─────────────────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    // Contact
    email     : user?.email || '',
    phone     : user?.phone || '',
    // Shipping
    first_name: user?.first_name || '',
    last_name : user?.last_name  || '',
    address   : '',
    address2  : '',
    city      : '',
    state     : '',
    zip       : '',
    country   : 'Bangladesh',
    // Shipping Method
    shipping_method: 'standard',
    // Payment
    payment_method : 'cod',
    card_number    : '',
    card_expiry    : '',
    card_cvc       : '',
    card_name      : '',
    // Extra
    notes          : '',
    save_info      : true,
  });

  const [errors, setErrors] = useState({});

  const hasFreeShipping = shipping.freeShippingEnabled && cartSubtotal >= shipping.freeShippingMin;
  const getShippingCost = (methodId) => {
    if (methodId === 'standard') {
      return hasFreeShipping ? 0 : shipping.standard.cost;
    }

    if (methodId === 'express') {
      return shipping.express.cost;
    }

    if (methodId === 'same_day') {
      return shipping.sameDay.cost;
    }

    return shipping.standard.cost;
  };

  const shippingCost = getShippingCost(formData.shipping_method);
  const orderTotal   = cartSubtotal + shippingCost;

  /* ─── Redirect if cart empty ─────────────────────────────────────────── */
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <motion.div className="checkout-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container">
          <div className="checkout-empty">
            <span className="material-icons-round">remove_shopping_cart</span>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart before proceeding to checkout.</p>
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ─── Handlers ───────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (step) => {
    const errs = {};

    if (step === 0) {
      if (!formData.email.trim())                                   errs.email      = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email      = 'Enter a valid email.';
      if (!formData.phone.trim())                                    errs.phone      = 'Phone number is required.';
      if (!formData.first_name.trim())                               errs.first_name = 'First name is required.';
      if (!formData.last_name.trim())                                errs.last_name  = 'Last name is required.';
      if (!formData.address.trim())                                  errs.address    = 'Address is required.';
      if (!formData.city.trim())                                     errs.city       = 'City is required.';
      if (!formData.zip.trim())                                      errs.zip        = 'ZIP / Postal code is required.';
    }

    if (step === 2 && formData.payment_method === 'card') {
      if (!formData.card_number.trim())  errs.card_number = 'Card number is required.';
      else if (formData.card_number.replace(/\s/g,'').length < 16) errs.card_number = 'Enter a valid card number.';
      if (!formData.card_expiry.trim())  errs.card_expiry = 'Expiry is required.';
      if (!formData.card_cvc.trim())     errs.card_cvc    = 'CVC is required.';
      if (!formData.card_name.trim())    errs.card_name   = 'Name on card is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const placeOrder = async () => {
    if (!validateStep(currentStep)) return;
    if (!isAuthenticated) {
      toast.error('Please log in to place your order.');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
        email: formData.email,
        phone: formData.phone,
        first_name: formData.first_name,
        last_name: formData.last_name,
        address: formData.address,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        notes: formData.notes,
      };

      const { data } = await submitOrder(payload);
      if (data.success) {
        setOrderId(data.order.order_number);
        setOrderPlaced(true);
        setCurrentStep(3);
        clearCart();
        toast.success('Order placed successfully! 🎉');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Format Card Number ─────────────────────────────────────────────── */
  const formatCardNumber = (value) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '');
    const matches = v.match(/\d{1,4}/g);
    return matches ? matches.join(' ').substring(0, 19) : '';
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  /* ─── Render Step ────────────────────────────────────────────────────── */
  const renderStep = () => {
    switch (currentStep) {
      /* ── STEP 0: Contact & Address ────────────────────────────── */
      case 0:
        return (
          <motion.div
            className="checkout-step"
            key="step-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <h2 className="checkout-step__title">
              <span className="material-icons-round">person</span>
              Contact & Shipping Information
            </h2>

            {/* Contact */}
            <div className="checkout-section">
              <h3 className="checkout-section__heading">Contact Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" name="email" className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input type="tel" name="phone" className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="+880 1XXX-XXXXXX" value={formData.phone} onChange={handleChange} />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-section">
              <h3 className="checkout-section__heading">Shipping Address</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input type="text" name="first_name" className={`form-input ${errors.first_name ? 'error' : ''}`}
                    value={formData.first_name} onChange={handleChange} />
                  {errors.first_name && <span className="form-error">{errors.first_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input type="text" name="last_name" className={`form-input ${errors.last_name ? 'error' : ''}`}
                    value={formData.last_name} onChange={handleChange} />
                  {errors.last_name && <span className="form-error">{errors.last_name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <input type="text" name="address" className={`form-input ${errors.address ? 'error' : ''}`}
                  placeholder="Street address, House/Flat no." value={formData.address} onChange={handleChange} />
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Address Line 2 (optional)</label>
                <input type="text" name="address2" className="form-input"
                  placeholder="Apartment, suite, unit, etc." value={formData.address2} onChange={handleChange} />
              </div>

              <div className="form-row form-row--3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" name="city" className={`form-input ${errors.city ? 'error' : ''}`}
                    placeholder="Dhaka" value={formData.city} onChange={handleChange} />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">State / Division</label>
                  <input type="text" name="state" className="form-input"
                    placeholder="Dhaka Division" value={formData.state} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP / Postal Code *</label>
                  <input type="text" name="zip" className={`form-input ${errors.zip ? 'error' : ''}`}
                    placeholder="1205" value={formData.zip} onChange={handleChange} />
                  {errors.zip && <span className="form-error">{errors.zip}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input type="text" name="country" className="form-input" value={formData.country} disabled />
              </div>
            </div>
          </motion.div>
        );

      /* ── STEP 1: Shipping Method ──────────────────────────────── */
      case 1:
        return (
          <motion.div
            className="checkout-step"
            key="step-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <h2 className="checkout-step__title">
              <span className="material-icons-round">local_shipping</span>
              Shipping Method
            </h2>

            <div className="checkout-section">
              <div className="shipping-methods">
                {[
                  { id: 'standard', name: 'Standard Delivery', time: shipping.standard.time, price: hasFreeShipping ? 'Free' : `Tk ${shipping.standard.cost}`, icon: 'local_shipping' },
                  { id: 'express',  name: 'Express Delivery',  time: shipping.express.time, price: `Tk ${shipping.express.cost}`, icon: 'flight_takeoff' },
                  { id: 'same_day', name: 'Same Day Delivery',  time: shipping.sameDay.time, price: `Tk ${shipping.sameDay.cost}`, icon: 'bolt' },
                ].map(method => (
                  <label
                    key={method.id}
                    className={`shipping-method ${formData.shipping_method === method.id ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="shipping_method"
                      value={method.id}
                      checked={formData.shipping_method === method.id}
                      onChange={handleChange}
                    />
                    <div className="shipping-method__radio" />
                    <span className="material-icons-round shipping-method__icon">{method.icon}</span>
                    <div className="shipping-method__info">
                      <h4>{method.name}</h4>
                      <p>{method.time}</p>
                    </div>
                    <span className="shipping-method__price">{method.price}</span>
                  </label>
                ))}
              </div>

              {/* Order Notes */}
              <div className="form-group" style={{ marginTop: 'var(--space-xl)' }}>
                <label className="form-label">Order Notes (optional)</label>
                <textarea
                  name="notes"
                  className="form-input form-textarea"
                  rows="3"
                  placeholder="Any special instructions for delivery..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.div>
        );

      /* ── STEP 2: Payment ──────────────────────────────────────── */
      case 2:
        return (
          <motion.div
            className="checkout-step"
            key="step-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <h2 className="checkout-step__title">
              <span className="material-icons-round">payment</span>
              Payment Method
            </h2>

            <div className="checkout-section">
              <div className="payment-methods">
                {[
                  { id: 'cod',    name: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: 'payments' },
                  { id: 'card',   name: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex', icon: 'credit_card' },
                  { id: 'bkash',  name: 'bKash',  desc: 'Mobile banking payment', icon: 'phone_android' },
                  { id: 'nagad',  name: 'Nagad',   desc: 'Digital payment service', icon: 'account_balance_wallet' },
                ].map(method => (
                  <label
                    key={method.id}
                    className={`payment-method ${formData.payment_method === method.id ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={formData.payment_method === method.id}
                      onChange={handleChange}
                    />
                    <div className="payment-method__radio" />
                    <span className="material-icons-round payment-method__icon">{method.icon}</span>
                    <div className="payment-method__info">
                      <h4>{method.name}</h4>
                      <p>{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Card Details */}
              <AnimatePresence>
                {formData.payment_method === 'card' && (
                  <motion.div
                    className="card-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="form-group">
                      <label className="form-label">Card Number *</label>
                      <div className="input-icon-wrapper">
                        <span className="material-icons-round input-icon">credit_card</span>
                        <input type="text" name="card_number"
                          className={`form-input form-input--icon ${errors.card_number ? 'error' : ''}`}
                          placeholder="1234 5678 9012 3456" maxLength="19"
                          value={formData.card_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, card_number: formatCardNumber(e.target.value) }))}
                        />
                      </div>
                      {errors.card_number && <span className="form-error">{errors.card_number}</span>}
                    </div>

                    <div className="form-row form-row--3">
                      <div className="form-group">
                        <label className="form-label">Expiry *</label>
                        <input type="text" name="card_expiry"
                          className={`form-input ${errors.card_expiry ? 'error' : ''}`}
                          placeholder="MM/YY" maxLength="5"
                          value={formData.card_expiry}
                          onChange={(e) => setFormData(prev => ({ ...prev, card_expiry: formatExpiry(e.target.value) }))}
                        />
                        {errors.card_expiry && <span className="form-error">{errors.card_expiry}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVC *</label>
                        <input type="text" name="card_cvc"
                          className={`form-input ${errors.card_cvc ? 'error' : ''}`}
                          placeholder="123" maxLength="4"
                          value={formData.card_cvc}
                          onChange={(e) => setFormData(prev => ({ ...prev, card_cvc: e.target.value.replace(/\D/g, '') }))}
                        />
                        {errors.card_cvc && <span className="form-error">{errors.card_cvc}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Name on Card *</label>
                        <input type="text" name="card_name"
                          className={`form-input ${errors.card_name ? 'error' : ''}`}
                          placeholder="John Doe" value={formData.card_name} onChange={handleChange}
                        />
                        {errors.card_name && <span className="form-error">{errors.card_name}</span>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Secure Badge */}
              <div className="checkout-secure">
                <span className="material-icons-round">lock</span>
                <span>Your payment information is secure and encrypted.</span>
              </div>
            </div>
          </motion.div>
        );

      /* ── STEP 3: Confirmation ─────────────────────────────────── */
      case 3:
        return (
          <motion.div
            className="checkout-step checkout-step--confirmation"
            key="step-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="confirmation-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <span className="material-icons-round">check_circle</span>
            </motion.div>

            <h2 className="confirmation-title">Order Placed Successfully!</h2>
            <p className="confirmation-order-id">Order ID: <strong>{orderId}</strong></p>
            <p className="confirmation-message">
              Thank you for shopping with {siteName}! Your order has been confirmed and 
              you will receive an email confirmation shortly at <strong>{formData.email}</strong>.
            </p>

            <div className="confirmation-summary">
              <div className="confirmation-summary__row">
                <span>Order Total</span>
                <span className="confirmation-total">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="confirmation-summary__row">
                <span>Payment Method</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {formData.payment_method === 'cod' ? 'Cash on Delivery' : formData.payment_method}
                </span>
              </div>
              <div className="confirmation-summary__row">
                <span>Shipping To</span>
                <span>{formData.city}, {formData.country}</span>
              </div>
            </div>

            <div className="confirmation-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                <span className="material-icons-round">shopping_bag</span>
                Continue Shopping
              </Link>
              <Link to="/" className="btn btn-secondary btn-lg">
                <span className="material-icons-round">home</span>
                Go Home
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="checkout-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="checkout-header">
          <Link to="/cart" className="checkout-back">
            <span className="material-icons-round">arrow_back</span>
            Back to Cart
          </Link>
          <h1 className="checkout-title">Checkout</h1>
        </div>

        {/* ── Progress Steps ────────────────────────────────────── */}
        <div className="checkout-progress">
          {STEPS.map((step, i) => (
            <div key={step} className={`checkout-progress__step ${i <= currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}>
              <div className="checkout-progress__circle">
                {i < currentStep ? (
                  <span className="material-icons-round">check</span>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="checkout-progress__label">{step}</span>
              {i < STEPS.length - 1 && <div className="checkout-progress__line" />}
            </div>
          ))}
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="checkout-layout">
          {/* Form Area */}
          <div className="checkout-form-area">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <div className="checkout-nav-buttons">
                {currentStep > 0 && (
                  <button className="btn btn-secondary" onClick={prevStep}>
                    <span className="material-icons-round">arrow_back</span>
                    Back
                  </button>
                )}

                {currentStep < 2 ? (
                  <motion.button
                    className="btn btn-primary"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                    <span className="material-icons-round">arrow_forward</span>
                  </motion.button>
                ) : (
                  <motion.button
                    className="btn btn-primary btn-lg checkout-place-order"
                    onClick={placeOrder}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="btn-loading">
                        <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                        <span>Placing Order...</span>
                      </div>
                    ) : (
                      <>
                        <span className="material-icons-round">lock</span>
                        Place Order — ${orderTotal.toFixed(2)}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep < 3 && (
            <div className="checkout-summary">
              <h3 className="checkout-summary__title">Order Summary</h3>

              {/* Items */}
              <div className="checkout-summary__items">
                {cartItems.map(item => (
                  <div key={item.id} className="checkout-summary__item">
                    <div className="checkout-summary__item-image">
                      {item.thumbnail ? (
                        <img
                          src={resolveAssetUrl(item.thumbnail)}
                          alt={item.name}
                          className="checkout-summary__item-media"
                          loading="lazy"
                        />
                      ) : (
                        <span className="material-icons-round">shopping_bag</span>
                      )}
                      <span className="checkout-summary__item-qty">{item.quantity}</span>
                    </div>
                    <div className="checkout-summary__item-info">
                      <h4>{item.name}</h4>
                      <p>{item.brand}</p>
                    </div>
                    <span className="checkout-summary__item-price">
                      Tk {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary__divider" />

              {/* Totals */}
              <div className="checkout-summary__rows">
                <div className="checkout-summary__row">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>Tk {cartSubtotal.toFixed(2)}</span>
                </div>
                {cartSavings > 0 && (
                  <div className="checkout-summary__row checkout-summary__row--green">
                    <span>Savings</span>
                    <span>-Tk {cartSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="checkout-summary__row">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'checkout-summary__free' : ''}>
                    {hasFreeShipping ? 'Free' : `Tk ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="checkout-summary__divider" />
                <div className="checkout-summary__row checkout-summary__row--total">
                  <span>Total</span>
                  <span>Tk {orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;