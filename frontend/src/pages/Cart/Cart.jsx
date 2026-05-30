import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
    const {
        cartItems, cartCount, cartSubtotal, cartSavings,
        removeFromCart, updateQuantity, clearCart,
    } = useCart();

    if (cartItems.length === 0) {
        return (
            <motion.div
                className="cart-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="container">
                    <div className="cart-empty">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        >
                            <span className="material-icons-round">remove_shopping_cart</span>
                        </motion.div>
                        <h2>Your Cart is Empty</h2>
                        <p>Looks like you haven't added any products to your cart yet. Start exploring!</p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            <span className="material-icons-round">shopping_bag</span>
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="cart-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="container">
                {/* Header */}
                <div className="cart-page-header">
                    <div>
                        <h1 className="cart-page-title">Shopping <span>Cart</span></h1>
                        <p className="cart-page-count">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
                    </div>
                    <button className="cart-clear-all" onClick={clearCart}>
                        <span className="material-icons-round">delete_sweep</span>
                        Clear All
                    </button>
                </div>

                <div className="cart-layout">
                    {/* ── Items ─────────────────────────────────────────────── */}
                    <div className="cart-items-section">
                        {/* Column Headers */}
                        <div className="cart-table-header hide-mobile">
                            <span className="cart-th cart-th--product">Product</span>
                            <span className="cart-th cart-th--price">Price</span>
                            <span className="cart-th cart-th--qty">Quantity</span>
                            <span className="cart-th cart-th--total">Total</span>
                            <span className="cart-th cart-th--action"></span>
                        </div>

                        <AnimatePresence>
                            {cartItems.map(item => (
                                <motion.div
                                    key={item.id}
                                    className="cart-row"
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Product */}
                                    <div className="cart-row__product">
                                        <div className="cart-row__image">
                                            <span className="material-icons-round">shopping_bag</span>
                                        </div>
                                        <div className="cart-row__info">
                                            <Link to={`/products/${item.slug}`} className="cart-row__name">
                                                {item.name}
                                            </Link>
                                            <span className="cart-row__brand">{item.brand || 'Moniluck'}</span>
                                            {item.category_name && (
                                                <span className="cart-row__category">{item.category_name}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="cart-row__price" data-label="Price">
                                        <span className="cart-row__current-price">
                                            Tk {parseFloat(item.price).toFixed(2)}
                                        </span>
                                        {item.compare_price && item.compare_price > item.price && (
                                            <span className="cart-row__old-price">
                                                Tk {parseFloat(item.compare_price).toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className="cart-row__qty" data-label="Quantity">
                                        <div className="cart-qty-control">
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <span className="material-icons-round">remove</span>
                                            </button>
                                            <input
                                                type="number"
                                                className="cart-qty-input"
                                                value={item.quantity}
                                                min="1"
                                                max={item.stock}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (val > 0) updateQuantity(item.id, val);
                                                }}
                                            />
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                            >
                                                <span className="material-icons-round">add</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="cart-row__total" data-label="Total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>

                                    {/* Remove */}
                                    <div className="cart-row__action">
                                        <motion.button
                                            className="cart-remove-btn"
                                            onClick={() => removeFromCart(item.id)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Remove item"
                                        >
                                            <span className="material-icons-round">delete_outline</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Continue Shopping */}
                        <div className="cart-continue">
                            <Link to="/products" className="cart-continue__link">
                                <span className="material-icons-round">arrow_back</span>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* ── Summary ───────────────────────────────────────────── */}
                    <div className="cart-summary">
                        <h3 className="cart-summary__title">Order Summary</h3>

                        <div className="cart-summary__rows">
                            <div className="cart-summary__row">
                                <span>Tk {cartSubtotal.toFixed(2)}</span>
                                <span>${cartSubtotal.toFixed(2)}</span>
                            </div>

                            {cartSavings > 0 && (
                                <div className="cart-summary__row cart-summary__row--savings">
                                    <span>
                                        <span className="material-icons-round" style={{ fontSize: '1rem', marginRight: 4 }}>
                                            local_offer
                                        </span>
                                        Savings
                                    </span>
                                    <span>-Tk {cartSavings.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="cart-summary__row">
                                <span>Shipping</span>
                                <span className="cart-summary__free">
                                    {cartSubtotal >= 50 ? 'Free' : 'Tk 5.99'}
                                </span>
                            </div>

                            {cartSubtotal < 50 && (
                                <div className="cart-summary__free-shipping-msg">
                                    <span className="material-icons-round">info</span>
                                    Add Tk {(50 - cartSubtotal).toFixed(2)} more for <strong>free shipping</strong>
                                </div>
                            )}

                            <div className="cart-summary__divider" />

                            <div className="cart-summary__row cart-summary__row--total">
                                <span>Total</span>
                                <span>
                                    Tk {(cartSubtotal + (cartSubtotal >= 50 ? 0 : 5.99)).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Link to="/checkout" className="btn btn-primary btn-full btn-lg cart-checkout-btn" style={{ textDecoration: 'none' }}>
                            <span className="material-icons-round">lock</span>
                            Proceed to Checkout
                        </Link>

                        {/* Payment icons */}
                        <div className="cart-summary__payment">
                            <p>We accept</p>
                            <div className="cart-summary__payment-icons">
                                {['Visa', 'MC', 'Amex', 'PayPal'].map(brand => (
                                    <div key={brand} className="payment-icon-placeholder">{brand}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Cart;