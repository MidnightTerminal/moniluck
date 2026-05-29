import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useMemo
} from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const STORAGE_KEY = 'moniluck_cart';
const WISHLIST_KEY = 'moniluck_wishlist';

export const CartProvider = ({ children }) => {
  /* ─── State ──────────────────────────────────────────────────────────────── */
  const [cartItems,    setCartItems]    = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  /* ─── Persist to localStorage ────────────────────────────────────────────── */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  /* ─── Cart Computed Values ───────────────────────────────────────────────── */
  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const cartSavings = useMemo(
    () => cartItems.reduce((acc, item) => {
      if (item.compare_price && item.compare_price > item.price) {
        return acc + (item.compare_price - item.price) * item.quantity;
      }
      return acc;
    }, 0),
    [cartItems]
  );

  /* ─── Add to Cart ────────────────────────────────────────────────────────── */
  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > (product.stock || 99)) {
          toast.error(`Only ${product.stock} items available in stock.`);
          return prev;
        }
        toast.success(`Updated cart: ${product.name}`);
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      if (quantity > (product.stock || 99)) {
        toast.error(`Only ${product.stock} items available in stock.`);
        return prev;
      }

      toast.success(`${product.name} added to cart! 🛒`);
      return [...prev, {
        id           : product.id,
        name         : product.name,
        slug         : product.slug,
        price        : parseFloat(product.price),
        compare_price: product.compare_price ? parseFloat(product.compare_price) : null,
        thumbnail    : product.thumbnail,
        stock        : product.stock || 99,
        brand        : product.brand || '',
        category_name: product.category_name || '',
        quantity,
      }];
    });

    setIsCartOpen(true);
  }, []);

  /* ─── Remove from Cart ───────────────────────────────────────────────────── */
  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === productId);
      if (item) toast.success(`${item.name} removed from cart.`);
      return prev.filter(i => i.id !== productId);
    });
  }, []);

  /* ─── Update Quantity ────────────────────────────────────────────────────── */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id !== productId) return item;
        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock.`);
          return item;
        }
        return { ...item, quantity };
      })
    );
  }, [removeFromCart]);

  /* ─── Clear Cart ─────────────────────────────────────────────────────────── */
  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success('Cart cleared.');
  }, []);

  /* ─── Is In Cart ─────────────────────────────────────────────────────────── */
  const isInCart = useCallback(
    (productId) => cartItems.some(item => item.id === productId),
    [cartItems]
  );

  /* ─── Get Cart Item ──────────────────────────────────────────────────────── */
  const getCartItem = useCallback(
    (productId) => cartItems.find(item => item.id === productId),
    [cartItems]
  );

  /* ─── Wishlist Functions ─────────────────────────────────────────────────── */
  const toggleWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        toast.success(`${product.name} removed from wishlist.`);
        return prev.filter(item => item.id !== product.id);
      }
      toast.success(`${product.name} added to wishlist! ❤️`);
      return [...prev, {
        id           : product.id,
        name         : product.name,
        slug         : product.slug,
        price        : parseFloat(product.price),
        compare_price: product.compare_price ? parseFloat(product.compare_price) : null,
        thumbnail    : product.thumbnail,
        brand        : product.brand || '',
        category_name: product.category_name || '',
      }];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some(item => item.id === productId),
    [wishlistItems]
  );

  const wishlistCount = wishlistItems.length;

  /* ─── Context Value ──────────────────────────────────────────────────────── */
  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    cartSavings,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
    wishlistItems,
    wishlistCount,
    toggleWishlist,
    isInWishlist,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export default CartContext;