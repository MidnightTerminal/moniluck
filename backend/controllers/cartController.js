const { query }    = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// ─── VALIDATE CART ITEMS ──────────────────────────────────────────────────────
// Cart is localStorage-based. This endpoint validates products and returns
// up-to-date pricing/stock info for the items in the cart.
exports.validateCart = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ product_id, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ success: true, items: [] });
    }

    const ids = items.map(i => i.product_id).filter(Boolean);
    if (!ids.length) return res.status(200).json({ success: true, items: [] });

    const placeholders = ids.map(() => '?').join(',');
    const products = await query(
      `SELECT id, name, slug, thumbnail, price, compare_price, stock, is_active
       FROM products
       WHERE id IN (${placeholders}) AND is_active = 1`,
      ids
    );

    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    const validatedItems = items
      .map(item => {
        const product = productMap[item.product_id];
        if (!product) return null;
        const quantity = Math.min(item.quantity, product.stock);
        if (quantity <= 0) return null;

        return {
          product_id   : product.id,
          name         : product.name,
          slug         : product.slug,
          thumbnail    : product.thumbnail,
          price        : parseFloat(product.price),
          compare_price: product.compare_price ? parseFloat(product.compare_price) : null,
          stock        : product.stock,
          quantity,
        };
      })
      .filter(Boolean);

    res.status(200).json({ success: true, items: validatedItems });
  } catch (error) {
    next(error);
  }
};

// ─── GET PRODUCT STOCK ────────────────────────────────────────────────────────
exports.checkStock = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    const products = await query(
      'SELECT id, stock, is_active FROM products WHERE id = ?',
      [parseInt(product_id)]
    );

    if (!products.length || !products[0].is_active) {
      return res.status(200).json({ success: true, available: false, stock: 0 });
    }

    res.status(200).json({
      success  : true,
      available: products[0].stock > 0,
      stock    : products[0].stock,
    });
  } catch (error) {
    next(error);
  }
};