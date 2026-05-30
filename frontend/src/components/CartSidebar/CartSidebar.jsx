import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './CartSidebar.css';

const CartSidebar = () => {
  const {
    cartItems, cartCount, cartSubtotal, cartSavings,
    isCartOpen, setIsCartOpen,
    removeFromCart, updateQuantity, clearCart,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            className="cart-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="cart-sidebar__header">
              <div className="cart-sidebar__header-left">
                <span className="material-icons-round">shopping_bag</span>
                <h3>Your Cart</h3>
                {cartCount > 0 && (
                  <span className="cart-sidebar__count">{cartCount}</span>
                )}
              </div>
              <button
                className="cart-sidebar__close"
                onClick={() => setIsCartOpen(false)}
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="cart-sidebar__body">
              {cartItems.length === 0 ? (
                <div className="cart-sidebar__empty">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <span className="material-icons-round">remove_shopping_cart</span>
                  </motion.div>
                  <h4>Your cart is empty</h4>
                  <p>Looks like you haven't added anything to your cart yet.</p>
                  <Link
                    to="/products"
                    className="btn btn-primary"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="cart-sidebar__items">
                  <AnimatePresence>
                    {cartItems.map(item => (
                      <motion.div
                        key={item.id}
                        className="cart-item"
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* Image */}
                        <div className="cart-item__image">
                          <span className="material-icons-round">shopping_bag</span>
                        </div>

                        {/* Info */}
                        <div className="cart-item__info">
                          <Link
                            to={`/products/${item.slug}`}
                            className="cart-item__name"
                            onClick={() => setIsCartOpen(false)}
                          >
                            {item.name}
                          </Link>

                          <div className="cart-item__pricing">
                            <span className="cart-item__price">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            {item.compare_price && (
                              <span className="cart-item__old-price">
                                ${(item.compare_price * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="cart-item__qty">
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <span className="material-icons-round">remove</span>
                            </button>
                            <span className="cart-item__qty-value">{item.quantity}</span>
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <span className="material-icons-round">add</span>
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          className="cart-item__remove"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <span className="material-icons-round">delete_outline</span>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="cart-sidebar__footer">
                {cartSavings > 0 && (
                  <div className="cart-sidebar__savings">
                    <span className="material-icons-round">local_offer</span>
                    You're saving <strong>Tk {cartSavings.toFixed(2)}</strong>!
                  </div>
                )}

                <div className="cart-sidebar__totals">
                  <div className="cart-sidebar__total-row">
                    <span>Subtotal</span>
                    <span className="cart-sidebar__total-value">Tk {cartSubtotal.toFixed(2)}</span>
                  </div>
                  <p className="cart-sidebar__shipping-note">Shipping calculated at checkout</p>
                </div>

                <div className="cart-sidebar__actions">
                  <Link
                    to="/cart"
                    className="btn btn-secondary btn-full"
                    onClick={() => setIsCartOpen(false)}
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    className="btn btn-primary btn-full"
                    onClick={() => setIsCartOpen(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    Checkout
                    <span className="material-icons-round">lock</span>
                  </Link>
                </div>

                <button className="cart-sidebar__clear" onClick={clearCart}>
                  <span className="material-icons-round">delete_sweep</span>
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;