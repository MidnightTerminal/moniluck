import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchMyOrders } from '../../utils/api';
import './Profile.css';

const PROFILE_TABS = [
  { key: 'profile', label: 'Profile', icon: 'person' },
  { key: 'password', label: 'Password', icon: 'lock' },
  { key: 'track', label: 'Track Order', icon: 'local_shipping' },
  { key: 'orders', label: 'Orders', icon: 'receipt_long' },
  { key: 'wishlist', label: 'Wishlist', icon: 'favorite' },
];

const ORDER_TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const TRACKING_STEP_INDEX = {
  pending   : 0,
  confirmed : 1,
  processing: 2,
  shipped   : 3,
  delivered : 4,
};

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { wishlistItems, toggleWishlist } = useCart();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  /* ─── Profile Form ──────────────────────────────────────────────────────── */
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name : user?.last_name  || '',
    phone     : user?.phone      || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors]   = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profileData.first_name.trim()) errs.first_name = 'First name is required.';
    if (!profileData.last_name.trim())  errs.last_name  = 'Last name is required.';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    setProfileLoading(true);
    await updateProfile(profileData);
    setProfileLoading(false);
  };

  /* ─── Password Form ─────────────────────────────────────────────────────── */
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password    : '',
    confirm         : '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors]   = useState({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && PROFILE_TABS.some(item => item.key === tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab !== 'orders' && activeTab !== 'track') return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const { data } = await fetchMyOrders();
        if (data.success) {
          const nextOrders = data.orders || [];
          setOrders(nextOrders);
          setSelectedOrderId(prev => {
            if (nextOrders.length === 0) return '';
            const existingOrder = nextOrders.find(order => String(order.id) === String(prev));
            return existingOrder ? String(existingOrder.id) : String(nextOrders[0].id);
          });
        }
      } catch (error) {
        toast.error('Failed to load orders.');
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [activeTab]);

  const selectedTrackOrder = orders.find(order => String(order.id) === String(selectedOrderId)) || orders[0] || null;
  const selectedOrderStep = TRACKING_STEP_INDEX[selectedTrackOrder?.status] ?? 0;

  const formatTrackingDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordData.current_password) errs.current_password = 'Current password is required.';
    if (!passwordData.new_password) errs.new_password = 'New password is required.';
    else if (passwordData.new_password.length < 8) errs.new_password = 'Minimum 8 characters.';
    else if (!/[A-Z]/.test(passwordData.new_password)) errs.new_password = 'Include an uppercase letter.';
    else if (!/\d/.test(passwordData.new_password)) errs.new_password = 'Include a number.';
    if (!passwordData.confirm) errs.confirm = 'Please confirm new password.';
    else if (passwordData.new_password !== passwordData.confirm) errs.confirm = 'Passwords do not match.';

    if (Object.keys(errs).length) { setPasswordErrors(errs); return; }

    setPasswordLoading(true);
    const result = await changePassword({
      current_password: passwordData.current_password,
      new_password    : passwordData.new_password,
    });
    setPasswordLoading(false);
    if (result.success) setPasswordData({ current_password: '', new_password: '', confirm: '' });
  };

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header__avatar">
            {user?.first_name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header__info">
            <h1 className="profile-header__name">{user?.first_name} {user?.last_name}</h1>
            <p className="profile-header__email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-layout">
          {/* Sidebar / Tabs */}
          <div className="profile-sidebar">
            {PROFILE_TABS.map(tab => (
              <button
                key={tab.key}
                className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="material-icons-round">{tab.icon}</span>
                {tab.label}
                {tab.key === 'wishlist' && wishlistItems.length > 0 && (
                  <span className="profile-tab__badge">{wishlistItems.length}</span>
                )}
              </button>
            ))}
            <div className="profile-sidebar__divider" />
            <button className="profile-tab profile-tab--logout" onClick={logout}>
              <span className="material-icons-round">logout</span>
              Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="profile-content">
            {/* ── Profile Tab ─────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <motion.div
                className="profile-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key="profile"
              >
                <h2 className="profile-section__title">
                  <span className="material-icons-round">person</span>
                  Personal Information
                </h2>
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        className={`form-input ${profileErrors.first_name ? 'error' : ''}`}
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                      />
                      {profileErrors.first_name && <span className="form-error">{profileErrors.first_name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        className={`form-input ${profileErrors.last_name ? 'error' : ''}`}
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                      />
                      {profileErrors.last_name && <span className="form-error">{profileErrors.last_name}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={user?.email || ''}
                      disabled
                    />
                    <span className="form-hint">Email cannot be changed.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="+1 (234) 567-890"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={profileLoading}
                    whileTap={{ scale: 0.98 }}
                  >
                    {profileLoading ? (
                      <div className="btn-loading">
                        <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <>
                        <span className="material-icons-round">save</span>
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── Password Tab ────────────────────────────────────────────── */}
            {activeTab === 'password' && (
              <motion.div
                className="profile-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key="password"
              >
                <h2 className="profile-section__title">
                  <span className="material-icons-round">lock</span>
                  Change Password
                </h2>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <div className="input-icon-wrapper">
                      <span className="material-icons-round input-icon">lock</span>
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        name="current_password"
                        className={`form-input form-input--icon ${passwordErrors.current_password ? 'error' : ''}`}
                        placeholder="Enter current password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                      />
                      <button type="button" className="input-toggle-pass" onClick={() => setShowCurrent(p => !p)} tabIndex={-1}>
                        <span className="material-icons-round">{showCurrent ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {passwordErrors.current_password && <span className="form-error">{passwordErrors.current_password}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-icon-wrapper">
                      <span className="material-icons-round input-icon">lock_open</span>
                      <input
                        type={showNew ? 'text' : 'password'}
                        name="new_password"
                        className={`form-input form-input--icon ${passwordErrors.new_password ? 'error' : ''}`}
                        placeholder="Min 8 characters"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                      />
                      <button type="button" className="input-toggle-pass" onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                        <span className="material-icons-round">{showNew ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {passwordErrors.new_password && <span className="form-error">{passwordErrors.new_password}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-icon-wrapper">
                      <span className="material-icons-round input-icon">lock_outline</span>
                      <input
                        type="password"
                        name="confirm"
                        className={`form-input form-input--icon ${passwordErrors.confirm ? 'error' : ''}`}
                        placeholder="Re-enter new password"
                        value={passwordData.confirm}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    {passwordErrors.confirm && <span className="form-error">{passwordErrors.confirm}</span>}
                  </div>

                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={passwordLoading}
                    whileTap={{ scale: 0.98 }}
                  >
                    {passwordLoading ? (
                      <div className="btn-loading">
                        <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <>
                        <span className="material-icons-round">vpn_key</span>
                        Update Password
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── Wishlist Tab ────────────────────────────────────────────── */}
            {activeTab === 'wishlist' && (
              <motion.div
                className="profile-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key="wishlist"
              >
                <h2 className="profile-section__title">
                  <span className="material-icons-round">favorite</span>
                  My Wishlist
                  {wishlistItems.length > 0 && (
                    <span className="profile-section__count">{wishlistItems.length} items</span>
                  )}
                </h2>

                {wishlistItems.length === 0 ? (
                  <div className="profile-empty">
                    <span className="material-icons-round">favorite_border</span>
                    <h3>Your wishlist is empty</h3>
                    <p>Save your favorite products here for quick access later.</p>
                    <Link to="/products" className="btn btn-primary">Browse Products</Link>
                  </div>
                ) : (
                  <div className="wishlist-grid">
                    {wishlistItems.map(item => (
                      <div key={item.id} className="wishlist-item">
                        <div className="wishlist-item__image">
                          <span className="material-icons-round">shopping_bag</span>
                        </div>
                        <div className="wishlist-item__info">
                          <Link to={`/products/${item.slug}`} className="wishlist-item__name">
                            {item.name}
                          </Link>
                          <span className="wishlist-item__category">{item.category_name}</span>
                          <div className="wishlist-item__pricing">
                            <span className="wishlist-item__price">Tk {parseFloat(item.price).toFixed(2)}</span>
                            {item.compare_price && (
                              <span className="wishlist-item__old-price">
                                Tk {parseFloat(item.compare_price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="wishlist-item__remove"
                          onClick={() => toggleWishlist(item)}
                          title="Remove from wishlist"
                        >
                          <span className="material-icons-round">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Track Order Tab ───────────────────────────────────────── */}
            {activeTab === 'track' && (
              <motion.div
                className="profile-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key="track"
              >
                <h2 className="profile-section__title">
                  <span className="material-icons-round">local_shipping</span>
                  Track My Order
                </h2>

                {ordersLoading ? (
                  <div className="profile-empty">
                    <div className="spinner spinner-sm" />
                    <h3>Loading order tracking...</h3>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="profile-empty">
                    <span className="material-icons-round">local_shipping</span>
                    <h3>No orders to track</h3>
                    <p>Place an order first and you will be able to follow its progress here.</p>
                    <Link to="/products" className="btn btn-primary">Browse Products</Link>
                  </div>
                ) : (
                  <div className="track-order">
                    <div className="track-order__selector">
                      <label className="form-label">Select an order</label>
                      <select
                        className="form-input"
                        value={selectedTrackOrder ? selectedTrackOrder.id : ''}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                      >
                        {orders.map(order => (
                          <option key={order.id} value={order.id}>
                            {order.order_number} - {new Date(order.created_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTrackOrder && (
                      <>
                        <div className="track-order__summary">
                          <div>
                            <span className="track-order__label">Order Number</span>
                            <strong>{selectedTrackOrder.order_number}</strong>
                          </div>
                          <div>
                            <span className="track-order__label">Placed On</span>
                            <strong>{formatTrackingDate(selectedTrackOrder.created_at)}</strong>
                          </div>
                          <div>
                            <span className="track-order__label">Payment Status</span>
                            <strong className={`track-order__payment track-order__payment--${selectedTrackOrder.payment_status}`}>
                              {selectedTrackOrder.payment_status}
                            </strong>
                          </div>
                          <div>
                            <span className="track-order__label">Total</span>
                            <strong>Tk {parseFloat(selectedTrackOrder.total).toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className="track-order__status-row">
                          <span className={`order-status order-status--${selectedTrackOrder.status}`}>
                            {selectedTrackOrder.status}
                          </span>
                          <p className="track-order__status-copy">
                            {selectedTrackOrder.status === 'delivered'
                              ? 'Your order has been delivered.'
                              : `Your order is currently ${selectedTrackOrder.status}.`}
                          </p>
                        </div>

                        <div className="track-order__timeline">
                          {ORDER_TRACKING_STEPS.map((step, index) => {
                            const isComplete = index <= selectedOrderStep;
                            const isCurrent = index === selectedOrderStep;

                            return (
                              <div
                                key={step.key}
                                className={`track-order__step ${isComplete ? 'is-complete' : ''} ${isCurrent ? 'is-current' : ''}`}
                              >
                                <span className="track-order__step-dot">
                                  <span className="material-icons-round">
                                    {isComplete ? 'check' : 'radio_button_unchecked'}
                                  </span>
                                </span>
                                <div>
                                  <strong>{step.label}</strong>
                                  <p>
                                    {index === 0 && 'We have received your order.'}
                                    {index === 1 && 'Your order has been confirmed.'}
                                    {index === 2 && 'We are preparing your package.'}
                                    {index === 3 && 'Your order is on the way.'}
                                    {index === 4 && 'Your order has arrived.'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="track-order__details">
                          <div>
                            <span className="track-order__label">Items</span>
                            <strong>{selectedTrackOrder.item_count}</strong>
                          </div>
                          <div>
                            <span className="track-order__label">Payment Method</span>
                            <strong style={{ textTransform: 'capitalize' }}>{selectedTrackOrder.payment_method}</strong>
                          </div>
                          <div>
                            <span className="track-order__label">Next Step</span>
                            <strong>
                              {selectedTrackOrder.status === 'delivered'
                                ? 'Completed'
                                : ORDER_TRACKING_STEPS[Math.min(selectedOrderStep + 1, ORDER_TRACKING_STEPS.length - 1)]?.label || 'Pending'}
                            </strong>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Orders Tab ──────────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <motion.div
                className="profile-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key="orders"
              >
                <h2 className="profile-section__title">
                  <span className="material-icons-round">receipt_long</span>
                  My Orders
                  {orders.length > 0 && (
                    <span className="profile-section__count">{orders.length} orders</span>
                  )}
                </h2>

                {ordersLoading ? (
                  <div className="profile-empty">
                    <div className="spinner spinner-sm" />
                    <h3>Loading orders...</h3>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="profile-empty">
                    <span className="material-icons-round">receipt_long</span>
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here after you place your first order.</p>
                    <Link to="/products" className="btn btn-primary">Browse Products</Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-card__top">
                          <div>
                            <span className="order-card__number">{order.order_number}</span>
                            <p className="order-card__meta">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`order-status order-status--${order.status}`}>{order.status}</span>
                        </div>
                        <div className="order-card__grid">
                          <div>
                            <span className="order-card__label">Items</span>
                            <strong>{order.item_count}</strong>
                          </div>
                          <div>
                            <span className="order-card__label">Payment</span>
                            <strong style={{ textTransform: 'capitalize' }}>{order.payment_method}</strong>
                          </div>
                          <div>
                            <span className="order-card__label">Total</span>
                            <strong>Tk {parseFloat(order.total).toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;