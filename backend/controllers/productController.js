const { query }    = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// ─── GET ALL PRODUCTS ─────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page     = 1,
      limit    = 12,
      category,
      search,
      sort     = 'created_at',
      order    = 'DESC',
      min_price,
      max_price,
      featured,
    } = req.query;

    const pageNumber  = toPositiveInt(page, 1);
    const limitNumber = toPositiveInt(limit, 12);
    const offset       = (pageNumber - 1) * limitNumber;

    const filterParams = [];
    const conditions = ['p.is_active = 1'];

    if (category) {
      conditions.push('c.slug = ?');
      filterParams.push(category);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.short_desc LIKE ?)');
      const s = `%${search}%`;
      filterParams.push(s, s, s);
    }

    if (min_price) {
      conditions.push('p.price >= ?');
      filterParams.push(parseFloat(min_price));
    }

    if (max_price) {
      conditions.push('p.price <= ?');
      filterParams.push(parseFloat(max_price));
    }

    if (featured === 'true') {
      conditions.push('p.is_featured = 1');
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSorts  = ['price', 'created_at', 'rating', 'name', 'review_count'];
    const allowedOrders = ['ASC', 'DESC'];
    const safeSort  = allowedSorts.includes(sort)   ? `p.${sort}` : 'p.created_at';
    const safeOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const sql = `
      SELECT
        p.id, p.name, p.slug, p.short_desc, p.price, p.compare_price,
        p.sku, p.stock, p.thumbnail, p.brand, p.is_featured,
        p.rating, p.review_count, p.created_at,
        c.id   AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ${limitNumber} OFFSET ${offset}
    `;

    const products = await query(sql, filterParams);

    // Count total
    const countParams = [...filterParams];
    const countSql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
    `;
    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      total,
      page   : pageNumber,
      limit  : limitNumber,
      pages  : Math.ceil(total / limitNumber),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const products = await query(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    );

    if (!products.length) return next(new AppError('Product not found.', 404));

    const product = products[0];

    // Parse JSON fields
    if (product.images && typeof product.images === 'string') {
      product.images = JSON.parse(product.images);
    }
    if (product.tags && typeof product.tags === 'string') {
      product.tags = JSON.parse(product.tags);
    }

    // Fetch reviews
    const reviews = await query(
      `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS reviewer_name, u.avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.is_approved = 1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [product.id]
    );

    // Fetch related products
    const related = await query(
      `SELECT id, name, slug, thumbnail, price, compare_price, rating, review_count
       FROM products
       WHERE category_id = ? AND id != ? AND is_active = 1
       ORDER BY is_featured DESC, rating DESC
       LIMIT 4`,
      [product.category_id, product.id]
    );

    res.status(200).json({
      success: true,
      product,
      reviews,
      related,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET FEATURED PRODUCTS ────────────────────────────────────────────────────
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    const limitNumber = toPositiveInt(limit, 8);

    const products = await query(
      `SELECT
         p.id, p.name, p.slug, p.short_desc, p.price, p.compare_price,
         p.thumbnail, p.brand, p.rating, p.review_count, p.stock,
         c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_featured = 1 AND p.is_active = 1
       ORDER BY p.rating DESC
       LIMIT ${limitNumber}`
    );

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL CATEGORIES ───────────────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await query(
      `SELECT
         c.*,
         COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC`
    );

    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// ─── GET PRODUCTS BY CATEGORY ─────────────────────────────────────────────────
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12, sort = 'created_at', order = 'DESC' } = req.query;
    const pageNumber  = toPositiveInt(page, 1);
    const limitNumber = toPositiveInt(limit, 12);
    const offset      = (pageNumber - 1) * limitNumber;

    const categories = await query(
      'SELECT * FROM categories WHERE slug = ? AND is_active = 1',
      [slug]
    );
    if (!categories.length) return next(new AppError('Category not found.', 404));

    const category = categories[0];

    const allowedSorts  = ['price', 'created_at', 'rating', 'name'];
    const safeSort  = allowedSorts.includes(sort) ? `p.${sort}` : 'p.created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const products = await query(
      `SELECT
         p.id, p.name, p.slug, p.short_desc, p.price, p.compare_price,
         p.thumbnail, p.brand, p.rating, p.review_count, p.stock
       FROM products p
       WHERE p.category_id = ? AND p.is_active = 1
       ORDER BY ${safeSort} ${safeOrder}
       LIMIT ${limitNumber} OFFSET ${offset}`,
      [category.id]
    );

    const countResult = await query(
      'SELECT COUNT(*) AS total FROM products WHERE category_id = ? AND is_active = 1',
      [category.id]
    );

    res.status(200).json({
      success  : true,
      category,
      total    : countResult[0].total,
      page     : pageNumber,
      limit    : limitNumber,
      pages    : Math.ceil(countResult[0].total / limitNumber),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── SEARCH PRODUCTS ──────────────────────────────────────────────────────────
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const limitNumber = toPositiveInt(limit, 10);

    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, products: [] });
    }

    const searchTerm = `%${q.trim()}%`;
    const products = await query(
      `SELECT
         p.id, p.name, p.slug, p.thumbnail, p.price, p.compare_price,
         p.rating, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1
         AND (p.name LIKE ? OR p.short_desc LIKE ? OR p.brand LIKE ?)
       ORDER BY p.is_featured DESC, p.rating DESC
       LIMIT ${limitNumber}`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
exports.addReview = async (req, res, next) => {
  try {
    const { slug }  = req.params;
    const { rating, title, body } = req.body;
    const safeRating = parseInt(rating, 10);

    if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
      return next(new AppError('Rating must be between 1 and 5.', 400));
    }

    const products = await query(
      'SELECT id FROM products WHERE slug = ? AND is_active = 1',
      [slug]
    );
    if (!products.length) return next(new AppError('Product not found.', 404));
    const product = products[0];

    const existing = await query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [product.id, req.user.id]
    );
    if (existing.length) {
      return next(new AppError('You have already reviewed this product.', 409));
    }

    await query(
      'INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)',
      [product.id, req.user.id, safeRating, title?.trim() || null, body?.trim() || null]
    );

    // Update product rating
    const avgResult = await query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE product_id = ? AND is_approved = 1',
      [product.id]
    );

    await query(
      'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
      [parseFloat(avgResult[0].avg_rating || 0).toFixed(2), avgResult[0].total, product.id]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully. It will be visible after approval.' });
  } catch (error) {
    next(error);
  }
};