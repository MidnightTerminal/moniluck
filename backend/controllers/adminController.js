const bcrypt       = require('bcryptjs');
const path         = require('path');
const fs           = require('fs');
const { query }    = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeImagePath = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
};

const normalizeImageList = (images) => {
  if (Array.isArray(images)) {
    return images.map(normalizeImagePath).filter(Boolean);
  }

  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeImagePath).filter(Boolean);
      }
    } catch (error) {
      return trimmed.split(',').map(item => normalizeImagePath(item)).filter(Boolean);
    }
  }

  return [];
};

exports.uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required.', 400));
    }

    const sharedProductsDir = path.resolve(__dirname, '../../shared/images/products');
    fs.mkdirSync(sharedProductsDir, { recursive: true });

    const extension = path.extname(req.file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(extension) ? extension : '.jpg';
    const filename = `product-${Date.now()}-${Math.floor(Math.random() * 100000)}${safeExt}`;
    const outputPath = path.join(sharedProductsDir, filename);
    fs.writeFileSync(outputPath, req.file.buffer);

    res.status(201).json({
      success: true,
      message: 'Product image uploaded successfully.',
      imagePath: `/images/products/${filename}`,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalProducts]    = await query('SELECT COUNT(*) AS count FROM products');
    const [activeProducts]   = await query('SELECT COUNT(*) AS count FROM products WHERE is_active = 1');
    const [totalCategories]  = await query('SELECT COUNT(*) AS count FROM categories');
    const [totalUsers]       = await query('SELECT COUNT(*) AS count FROM users WHERE role = "customer"');
    const [totalOrders]      = await query('SELECT COUNT(*) AS count FROM orders');
    const [pendingOrders]    = await query('SELECT COUNT(*) AS count FROM orders WHERE status = "pending"');
    const [totalRevenue]     = await query('SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE payment_status = "paid"');
    const [totalSubscribers] = await query('SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE is_active = 1');
    const [totalReviews]     = await query('SELECT COUNT(*) AS count FROM reviews');

    // Recent orders
    const recentOrders = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status, o.total, o.created_at,
              CONCAT(o.ship_first_name, ' ', o.ship_last_name) AS customer_name
       FROM orders o
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Top products
    const topProducts = await query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.price, p.stock, p.rating, p.review_count,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1
       ORDER BY p.review_count DESC, p.rating DESC
       LIMIT 5`
    );

    // Low stock products
    const lowStock = await query(
      `SELECT id, name, slug, stock, sku FROM products
       WHERE is_active = 1 AND stock <= 10
       ORDER BY stock ASC
       LIMIT 10`
    );

    // Orders by status
    const ordersByStatus = await query(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`
    );

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await query(
      `SELECT
         DATE_FORMAT(created_at, '%Y-%m') AS month,
         COUNT(*) AS orders,
         COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          totalProducts   : totalProducts.count,
          activeProducts  : activeProducts.count,
          totalCategories : totalCategories.count,
          totalUsers      : totalUsers.count,
          totalOrders     : totalOrders.count,
          pendingOrders   : pendingOrders.count,
          totalRevenue    : parseFloat(totalRevenue.revenue),
          totalSubscribers: totalSubscribers.count,
          totalReviews    : totalReviews.count,
        },
        recentOrders,
        topProducts,
        lowStock,
        ordersByStatus,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// PRODUCTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, status, sort = 'created_at', order = 'DESC' } = req.query;
    const pageNumber = toPositiveInt(page, 1);
    const limitNumber = toPositiveInt(limit, 20);
    const offset = (pageNumber - 1) * limitNumber;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
    }
    if (status === 'active')   conditions.push('p.is_active = 1');
    if (status === 'inactive') conditions.push('p.is_active = 0');
    if (status === 'low_stock') conditions.push('p.stock <= 10');

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['name', 'price', 'stock', 'created_at', 'rating'];
    const safeSort  = allowedSorts.includes(sort) ? `p.${sort}` : 'p.created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const products = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY ${safeSort} ${safeOrder}
       LIMIT ${limitNumber} OFFSET ${offset}`,
      params
    );

    const [countResult] = await query(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id ${where}`,
      params
    );

    res.status(200).json({
      success: true,
      total  : countResult.total,
      page   : pageNumber,
      pages  : Math.ceil(countResult.total / limitNumber),
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const [product] = await query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!product) return next(new AppError('Product not found.', 404));

    if (product.images && typeof product.images === 'string') product.images = JSON.parse(product.images);
    if (product.tags && typeof product.tags === 'string')     product.tags   = JSON.parse(product.tags);

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const {
      category_id, name, slug, description, short_desc, price,
      compare_price, sku, stock, thumbnail, images, brand, tags,
      is_featured, is_active
    } = req.body;

    if (!name || !slug || !price || !sku || !category_id) {
      return next(new AppError('Name, slug, price, SKU, and category are required.', 400));
    }

    const normalizedImages = normalizeImageList(images);
    const normalizedThumbnail = normalizeImagePath(thumbnail) || normalizedImages[0] || null;

    if (!normalizedThumbnail) {
      return next(new AppError('Product image path (thumbnail) is required.', 400));
    }

    const result = await query(
      `INSERT INTO products
       (category_id, name, slug, description, short_desc, price, compare_price,
        sku, stock, thumbnail, images, brand, tags, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, name.trim(), slug.trim().toLowerCase(),
        description || null, short_desc || null,
        parseFloat(price), compare_price ? parseFloat(compare_price) : null,
        sku.trim(), parseInt(stock) || 0, normalizedThumbnail,
        normalizedImages.length ? JSON.stringify(normalizedImages) : null,
        brand || null,
        tags ? JSON.stringify(tags) : null,
        is_featured ? 1 : 0, is_active !== false ? 1 : 0
      ]
    );

    const [newProduct] = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Product created successfully.', product: newProduct });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      category_id, name, slug, description, short_desc, price,
      compare_price, sku, stock, thumbnail, images, brand, tags,
      is_featured, is_active
    } = req.body;

    const [existing] = await query('SELECT id, thumbnail FROM products WHERE id = ?', [id]);
    if (!existing) return next(new AppError('Product not found.', 404));

    const normalizedImages = normalizeImageList(images);
    const normalizedThumbnail = normalizeImagePath(thumbnail) || normalizedImages[0] || existing.thumbnail || null;

    if (!normalizedThumbnail) {
      return next(new AppError('Product image path (thumbnail) is required.', 400));
    }

    await query(
      `UPDATE products SET
        category_id = ?, name = ?, slug = ?, description = ?, short_desc = ?,
        price = ?, compare_price = ?, sku = ?, stock = ?, thumbnail = ?,
        images = ?, brand = ?, tags = ?, is_featured = ?, is_active = ?
       WHERE id = ?`,
      [
        category_id, name.trim(), slug.trim().toLowerCase(),
        description || null, short_desc || null,
        parseFloat(price), compare_price ? parseFloat(compare_price) : null,
        sku.trim(), parseInt(stock) || 0, normalizedThumbnail,
        normalizedImages.length ? JSON.stringify(normalizedImages) : null,
        brand || null,
        tags ? JSON.stringify(tags) : null,
        is_featured ? 1 : 0, is_active !== false ? 1 : 0,
        id
      ]
    );

    const [updated] = await query(
      'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?',
      [id]
    );

    res.status(200).json({ success: true, message: 'Product updated successfully.', product: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id, name FROM products WHERE id = ?', [id]);
    if (!existing) return next(new AppError('Product not found.', 404));

    await query('DELETE FROM products WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: `Product "${existing.name}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

exports.toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [product] = await query('SELECT id, is_active FROM products WHERE id = ?', [id]);
    if (!product) return next(new AppError('Product not found.', 404));

    const newStatus = product.is_active ? 0 : 1;
    await query('UPDATE products SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.status(200).json({
      success: true,
      message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      is_active: newStatus,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// CATEGORIES MANAGEMENT
// ═══════════════════════════════════════════════════════════════

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await query(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order ASC`
    );
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, image_url, sort_order, is_active } = req.body;

    if (!name || !slug) return next(new AppError('Name and slug are required.', 400));

    const result = await query(
      `INSERT INTO categories (name, slug, description, icon, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug.trim().toLowerCase(), description || null, icon || null, image_url || null, sort_order || 0, is_active !== false ? 1 : 0]
    );

    const [category] = await query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Category created successfully.', category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, image_url, sort_order, is_active } = req.body;

    const [existing] = await query('SELECT id FROM categories WHERE id = ?', [id]);
    if (!existing) return next(new AppError('Category not found.', 404));

    await query(
      `UPDATE categories SET name = ?, slug = ?, description = ?, icon = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [name.trim(), slug.trim().toLowerCase(), description || null, icon || null, image_url || null, sort_order || 0, is_active !== false ? 1 : 0, id]
    );

    const [updated] = await query('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Category updated successfully.', category: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (!existing) return next(new AppError('Category not found.', 404));

    const [productCount] = await query('SELECT COUNT(*) AS count FROM products WHERE category_id = ?', [id]);
    if (productCount.count > 0) {
      return next(new AppError(`Cannot delete. ${productCount.count} products belong to this category.`, 400));
    }

    await query('DELETE FROM categories WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: `Category "${existing.name}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// ORDERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, sort = 'created_at', order = 'DESC' } = req.query;
    const pageNumber = toPositiveInt(page, 1);
    const limitNumber = toPositiveInt(limit, 20);
    const offset = (pageNumber - 1) * limitNumber;
    const conditions = [];
    const params = [];

    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (search) {
      conditions.push('(o.order_number LIKE ? OR o.ship_email LIKE ? OR CONCAT(o.ship_first_name," ",o.ship_last_name) LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const orders = await query(
      `SELECT o.*,
              CONCAT(o.ship_first_name, ' ', o.ship_last_name) AS customer_name,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       ${where}
       ORDER BY o.${sort === 'total' ? 'total' : 'created_at'} ${order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
       LIMIT ${limitNumber} OFFSET ${offset}`,
      params
    );

    const [countResult] = await query(`SELECT COUNT(*) AS total FROM orders o ${where}`, params);

    res.status(200).json({
      success: true,
      total  : countResult.total,
      page   : pageNumber,
      pages  : Math.ceil(countResult.total / limitNumber),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const [order] = await query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return next(new AppError('Order not found.', 404));

    const items = await query(
      `SELECT oi.*, p.slug AS product_slug
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const [order] = await query('SELECT id FROM orders WHERE id = ?', [id]);
    if (!order) return next(new AppError('Order not found.', 404));

    const updates = [];
    const vals = [];

    if (status) { updates.push('status = ?'); vals.push(status); }
    if (payment_status) { updates.push('payment_status = ?'); vals.push(payment_status); }

    if (!updates.length) return next(new AppError('Nothing to update.', 400));

    vals.push(id);
    await query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, vals);

    const [updated] = await query('SELECT * FROM orders WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Order updated successfully.', order: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id, order_number FROM orders WHERE id = ?', [id]);
    if (!existing) return next(new AppError('Order not found.', 404));

    await query('DELETE FROM orders WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: `Order ${existing.order_number} deleted.` });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// USERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const pageNumber = toPositiveInt(page, 1);
    const limitNumber = toPositiveInt(limit, 20);
    const offset = (pageNumber - 1) * limitNumber;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (role) { conditions.push('u.role = ?'); params.push(role); }
    if (status === 'active')   conditions.push('u.is_active = 1');
    if (status === 'inactive') conditions.push('u.is_active = 0');

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const users = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role,
              u.is_active, u.is_verified, u.created_at,
              (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
       FROM users u ${where}
       ORDER BY u.created_at DESC
       LIMIT ${limitNumber} OFFSET ${offset}`,
      params
    );

    const [countResult] = await query(`SELECT COUNT(*) AS total FROM users u ${where}`, params);

    res.status(200).json({
      success: true,
      total  : countResult.total,
      page   : pageNumber,
      pages  : Math.ceil(countResult.total / limitNumber),
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const [user] = await query(
      `SELECT id, first_name, last_name, email, phone, role, is_active, is_verified, created_at, updated_at
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    if (!user) return next(new AppError('User not found.', 404));

    const orders = await query(
      `SELECT id, order_number, status, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
      [user.id]
    );

    const reviews = await query(
      `SELECT r.*, p.name AS product_name FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.user_id = ? ORDER BY r.created_at DESC LIMIT 10`,
      [user.id]
    );

    user.orders  = orders;
    user.reviews = reviews;

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, role, is_active } = req.body;

    const [existing] = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing) return next(new AppError('User not found.', 404));

    await query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?`,
      [first_name, last_name, phone || null, role || 'customer', is_active ? 1 : 0, id]
    );

    const [updated] = await query(
      'SELECT id, first_name, last_name, email, phone, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    res.status(200).json({ success: true, message: 'User updated.', user: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) return next(new AppError('You cannot delete your own account.', 400));

    const [existing] = await query('SELECT id, email FROM users WHERE id = ?', [id]);
    if (!existing) return next(new AppError('User not found.', 404));

    await query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: `User ${existing.email} deleted.` });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// REVIEWS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, product_id } = req.query;
    const pageNumber = toPositiveInt(page, 1);
    const limitNumber = toPositiveInt(limit, 20);
    const offset = (pageNumber - 1) * limitNumber;
    const conditions = [];
    const params = [];

    if (status === 'approved')   conditions.push('r.is_approved = 1');
    if (status === 'pending')    conditions.push('r.is_approved = 0');
    if (product_id) { conditions.push('r.product_id = ?'); params.push(parseInt(product_id)); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const reviews = await query(
      `SELECT r.*, p.name AS product_name, p.slug AS product_slug,
              CONCAT(u.first_name, ' ', u.last_name) AS reviewer_name, u.email AS reviewer_email
       FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       LEFT JOIN users u ON u.id = r.user_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ${limitNumber} OFFSET ${offset}`,
      params
    );

    const [countResult] = await query(
      `SELECT COUNT(*) AS total FROM reviews r ${where}`, params
    );

    res.status(200).json({
      success: true,
      total  : countResult.total,
      page   : pageNumber,
      pages  : Math.ceil(countResult.total / limitNumber),
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

exports.approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body || {};
    const [review] = await query('SELECT id, product_id FROM reviews WHERE id = ?', [id]);
    if (!review) return next(new AppError('Review not found.', 404));

    const replyText = typeof reply === 'string' && reply.trim() ? reply.trim() : null;

    await query(
      `UPDATE reviews
       SET is_approved = 1,
           admin_reply = COALESCE(?, admin_reply),
           admin_reply_at = CASE WHEN ? IS NULL THEN admin_reply_at ELSE NOW() END
       WHERE id = ?`,
      [replyText, replyText, id]
    );

    // Recalculate product rating
    const [avg] = await query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE product_id = ? AND is_approved = 1',
      [review.product_id]
    );
    await query(
      'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
      [parseFloat(avg.avg_rating || 0).toFixed(2), avg.total, review.product_id]
    );

    res.status(200).json({ success: true, message: 'Review approved.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [review] = await query('SELECT id, product_id FROM reviews WHERE id = ?', [id]);
    if (!review) return next(new AppError('Review not found.', 404));

    await query('DELETE FROM reviews WHERE id = ?', [id]);

    // Recalculate
    const [avg] = await query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE product_id = ? AND is_approved = 1',
      [review.product_id]
    );
    await query(
      'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
      [parseFloat(avg.avg_rating || 0).toFixed(2), avg.total || 0, review.product_id]
    );

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// NEWSLETTER SUBSCRIBERS
// ═══════════════════════════════════════════════════════════════

exports.getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const pageNumber = toPositiveInt(page, 1);
    const limitNumber = toPositiveInt(limit, 30);
    const offset = (pageNumber - 1) * limitNumber;

    const subscribers = await query(
      `SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT ${limitNumber} OFFSET ${offset}`
    );

    const [countResult] = await query('SELECT COUNT(*) AS total FROM newsletter_subscribers');

    res.status(200).json({
      success: true,
      total  : countResult.total,
      page   : pageNumber,
      pages  : Math.ceil(countResult.total / limitNumber),
      subscribers,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubscriber = async (req, res, next) => {
  try {
    await query('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Subscriber removed.' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// SITE SETTINGS
// ═══════════════════════════════════════════════════════════════

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await query('SELECT * FROM site_settings ORDER BY id ASC');
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.setting_key] = s.setting_val; });

    res.status(200).json({ success: true, settings: settingsObj, settingsList: settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body; // { key: value, ... }

    for (const [key, value] of Object.entries(settings)) {
      await query(
        'UPDATE site_settings SET setting_val = ? WHERE setting_key = ?',
        [value !== null && value !== undefined ? String(value) : null, key]
      );
    }

    res.status(200).json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};