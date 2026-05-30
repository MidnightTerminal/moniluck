const { query, transaction } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const {
  sendEmail,
  sendTelegramMessage,
  buildOrderEmailHtml,
  buildOrderEmailText,
  buildOrderTelegramMessage,
} = require('../utils/notificationService');

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

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────
exports.placeOrder = async (req, res, next) => {
  try {
    const {
      items,
      email,
      phone,
      first_name,
      last_name,
      address,
      address2,
      city,
      state,
      zip,
      country = 'Bangladesh',
      shipping_method = 'standard',
      payment_method = 'cod',
      notes,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError('Cart is empty.', 400));
    }

    if (!email || !phone || !first_name || !last_name || !address || !city || !zip) {
      return next(new AppError('Shipping information is incomplete.', 400));
    }

    const shippingRates = {
      standard: 5.99,
      express: 12.99,
      same_day: 19.99,
    };
    const allowedPaymentMethods = ['cod', 'card', 'bkash', 'nagad'];
    const safeShippingMethod = Object.prototype.hasOwnProperty.call(shippingRates, shipping_method)
      ? shipping_method
      : 'standard';
    const safePaymentMethod = allowedPaymentMethods.includes(payment_method) ? payment_method : 'cod';

    const order = await transaction(async (connection) => {
      const productIds = items
        .map(item => parseInt(item.product_id, 10))
        .filter(productId => Number.isInteger(productId) && productId > 0);

      if (!productIds.length) {
        throw new AppError('No valid cart items found.', 400);
      }

      const placeholders = productIds.map(() => '?').join(',');
      const [products] = await connection.execute(
        `SELECT id, name, slug, price, compare_price, stock, thumbnail, is_active
         FROM products
         WHERE id IN (${placeholders})
         FOR UPDATE`,
        productIds
      );

      const productMap = new Map(products.map(product => [product.id, product]));
      const orderItems = [];
      let subtotal = 0;
      let discount = 0;

      for (const item of items) {
        const productId = parseInt(item.product_id, 10);
        const quantity = parseInt(item.quantity, 10);
        const product = productMap.get(productId);

        if (!product || !product.is_active) {
          throw new AppError('One or more cart items are no longer available.', 400);
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new AppError('Invalid item quantity found in cart.', 400);
        }

        if (product.stock < quantity) {
          throw new AppError(`Only ${product.stock} units available for ${product.name}.`, 400);
        }

        const price = parseFloat(product.price);
        const comparePrice = product.compare_price ? parseFloat(product.compare_price) : null;
        const lineTotal = price * quantity;

        subtotal += lineTotal;
        if (comparePrice && comparePrice > price) {
          discount += (comparePrice - price) * quantity;
        }

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          thumbnail: product.thumbnail,
          price,
          quantity,
          total: lineTotal,
        });
      }

      const shipping_cost = safeShippingMethod === 'standard' && subtotal >= 50
        ? 0
        : shippingRates[safeShippingMethod];
      const total = subtotal + shipping_cost;
      const order_number = `ML-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

      const [orderResult] = await connection.execute(
        `INSERT INTO orders
         (user_id, order_number, status, payment_method, payment_status, subtotal, shipping_cost, discount, total, currency,
          ship_first_name, ship_last_name, ship_email, ship_phone, ship_address, ship_address2, ship_city, ship_state, ship_zip, ship_country, notes)
         VALUES (?, ?, 'pending', ?, 'pending', ?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          order_number,
          safePaymentMethod,
          subtotal,
          shipping_cost,
          discount,
          total,
          first_name.trim(),
          last_name.trim(),
          email.trim().toLowerCase(),
          phone.trim(),
          address.trim(),
          address2 || null,
          city.trim(),
          state || null,
          zip.trim(),
          country || 'Bangladesh',
          notes || null,
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of orderItems) {
        await connection.execute(
          `INSERT INTO order_items
           (order_id, product_id, product_name, product_slug, thumbnail, price, quantity, total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.product_name,
            item.product_slug,
            item.thumbnail || null,
            item.price,
            item.quantity,
            item.total,
          ]
        );

        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      const [createdOrderRows] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );
      const [createdItems] = await connection.execute(
        'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
        [orderId]
      );

      return {
        ...createdOrderRows[0],
        items: createdItems,
      };
    });

    const customerEmail = {
      to     : order.ship_email,
      subject: `Moniluck Order Confirmation - ${order.order_number}`,
      html   : buildOrderEmailHtml({
        title       : `Thanks, ${order.ship_first_name}. Your order is confirmed.`,
        intro       : `We received your order ${order.order_number} and are preparing it for the next step. You will be notified when the status changes.`,
        accent      : { start: '#667eea', end: '#764ba2' },
        order       : { ...order, payment_method: safePaymentMethod },
        items       : order.items,
        summaryLabel: 'Shipping Address',
      }),
      text   : buildOrderEmailText({
        heading: `Order confirmed: ${order.order_number}`,
        order  : { ...order, payment_method: safePaymentMethod },
        items  : order.items,
      }),
    };

    const adminEmail = {
      to     : process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER,
      subject: `New Order Placed - ${order.order_number}`,
      html   : buildOrderEmailHtml({
        title       : `New order received: ${order.order_number}`,
        intro       : 'A customer has completed checkout. Review the order details below and prepare fulfillment if everything looks correct.',
        accent      : { start: '#111827', end: '#374151' },
        order       : { ...order, payment_method: safePaymentMethod },
        items       : order.items,
        summaryLabel: 'Shipping Address',
      }),
      text   : buildOrderEmailText({
        heading: `New order received: ${order.order_number}`,
        order  : { ...order, payment_method: safePaymentMethod },
        items  : order.items,
      }),
    };

    const telegramMessage = buildOrderTelegramMessage({
      heading: 'New order placed',
      order  : { ...order, payment_method: safePaymentMethod },
      items  : order.items,
    });

    await Promise.allSettled([
      sendEmail(customerEmail),
      sendEmail(adminEmail),
      sendTelegramMessage(telegramMessage),
    ]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};