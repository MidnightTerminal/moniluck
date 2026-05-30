const nodemailer = require('nodemailer');

// ─── Configuration ──────────────────────────────────────────────────────────
const hasEmailConfig = Boolean(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host  : process.env.EMAIL_HOST,
      port  : parseInt(process.env.EMAIL_PORT, 10),
      secure: false,
      auth  : {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

// ─── Utility Helpers ────────────────────────────────────────────────────────
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMoney = (value = 0) =>
  `Tk ${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// ─── Status Config ──────────────────────────────────────────────────────────
const statusConfig = {
  pending:    { emoji: '⏳', color: '#f59e0b', bg: '#fffbeb',  label: 'Pending' },
  confirmed:  { emoji: '✅', color: '#3b82f6', bg: '#eff6ff',  label: 'Confirmed' },
  processing: { emoji: '⚙️', color: '#8b5cf6', bg: '#f5f3ff',  label: 'Processing' },
  shipped:    { emoji: '🚚', color: '#06b6d4', bg: '#ecfeff',  label: 'Shipped' },
  delivered:  { emoji: '📦', color: '#10b981', bg: '#ecfdf5',  label: 'Delivered' },
  cancelled:  { emoji: '❌', color: '#ef4444', bg: '#fef2f2',  label: 'Cancelled' },
  refunded:   { emoji: '💸', color: '#64748b', bg: '#f8fafc',  label: 'Refunded' },
};

const paymentStatusConfig = {
  pending:  { emoji: '🕐', color: '#f59e0b', label: 'Pending' },
  paid:     { emoji: '✅', color: '#10b981', label: 'Paid' },
  failed:   { emoji: '❌', color: '#ef4444', label: 'Failed' },
  refunded: { emoji: '💸', color: '#64748b', label: 'Refunded' },
};

const paymentMethodLabels = {
  cod:   '💵 Cash on Delivery',
  card:  '💳 Credit/Debit Card',
  bkash: '📱 bKash',
  nagad: '📱 Nagad',
};

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL HTML BUILDER
// ═══════════════════════════════════════════════════════════════════════════

const buildOrderItemsHtml = (items = []) =>
  items
    .map(
      (item, index) => `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #f1f5f9;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="font-size:22px;">🛍️</span>
            </div>
            <div>
              <div style="font-weight:700;color:#0f172a;font-size:14px;line-height:1.4;">${escapeHtml(item.product_name)}</div>
              <div style="font-size:12px;color:#94a3b8;margin-top:3px;">
                Qty: <span style="font-weight:600;color:#64748b;">${item.quantity}</span>
                &nbsp;·&nbsp;
                Unit: <span style="font-weight:600;color:#64748b;">${formatMoney(item.price)}</span>
              </div>
            </div>
          </div>
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #f1f5f9;text-align:right;">
          <div style="font-size:15px;font-weight:800;color:#0f172a;">${formatMoney(item.total)}</div>
        </td>
      </tr>`
    )
    .join('');

const buildOrderEmailHtml = ({ title, intro, accent, order, items, summaryLabel }) => {
  const status        = statusConfig[order.status] || statusConfig.pending;
  const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
  const paymentMethod = paymentMethodLabels[order.payment_method] || capitalize(order.payment_method);
  const orderItemsHtml = buildOrderItemsHtml(items);

  const addressParts = [
    order.ship_address,
    order.ship_address2,
    [order.ship_city, order.ship_state].filter(Boolean).join(', '),
    order.ship_zip,
    order.ship_country,
  ].filter(Boolean);

  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(intro)} — Order #${escapeHtml(order.order_number)} | Total: ${formatMoney(order.total)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 25px 60px rgba(15,23,42,0.08),0 4px 12px rgba(15,23,42,0.04);border:1px solid #e2e8f0;">

          <!-- ══════ HEADER ══════ -->
          <tr>
            <td style="background:linear-gradient(135deg, ${accent.start}, ${accent.end});padding:0;">
              <!-- Top Bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 32px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="display:inline-block;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);border-radius:12px;padding:8px 14px;">
                            <span style="color:#fff;font-size:16px;font-weight:900;letter-spacing:-.3px;">✦ Moniluck</span>
                          </div>
                        </td>
                        <td align="right">
                          <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 14px;">
                            <span style="color:rgba(255,255,255,0.9);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Order Update</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Hero Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:28px 32px 32px;">
                    <h1 style="margin:0 0 10px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.15;letter-spacing:-.5px;">${escapeHtml(title)}</h1>
                    <p style="margin:0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.88);max-width:520px;">${escapeHtml(intro)}</p>
                  </td>
                </tr>
              </table>

              <!-- Status Ribbon -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 32px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.95);border-radius:16px 16px 0 0;overflow:hidden;backdrop-filter:blur(10px);">
                      <tr>
                        <td style="padding:18px 24px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <span style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;">Order</span>
                                <div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;letter-spacing:-.3px;">#${escapeHtml(order.order_number)}</div>
                              </td>
                              <td align="center">
                                <div style="display:inline-block;background:${status.bg};border:2px solid ${status.color}20;border-radius:10px;padding:8px 18px;">
                                  <span style="font-size:14px;font-weight:700;color:${status.color};">${status.emoji} ${status.label}</span>
                                </div>
                              </td>
                              <td align="right">
                                <span style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;">Total</span>
                                <div style="font-size:20px;font-weight:900;color:#0f172a;margin-top:4px;letter-spacing:-.5px;">${formatMoney(order.total)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ BODY ══════ -->
          <tr>
            <td style="padding:0 32px 32px;">

              <!-- ── Info Cards ─────────────────────────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="padding-right:8px;width:33%;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#f8fafc,#f1f5f9);border-radius:16px;border:1px solid #e2e8f0;">
                      <tr>
                        <td style="padding:18px 16px;">
                          <div style="font-size:20px;margin-bottom:8px;">👤</div>
                          <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Customer</div>
                          <div style="font-size:14px;font-weight:700;color:#0f172a;line-height:1.4;">${escapeHtml(order.ship_first_name)} ${escapeHtml(order.ship_last_name)}</div>
                          <div style="font-size:12px;color:#64748b;margin-top:4px;word-break:break-all;">${escapeHtml(order.ship_email)}</div>
                          <div style="font-size:12px;color:#64748b;margin-top:2px;">${escapeHtml(order.ship_phone)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding:0 4px;width:33%;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#f8fafc,#f1f5f9);border-radius:16px;border:1px solid #e2e8f0;">
                      <tr>
                        <td style="padding:18px 16px;">
                          <div style="font-size:20px;margin-bottom:8px;">💳</div>
                          <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Payment</div>
                          <div style="font-size:14px;font-weight:700;color:#0f172a;line-height:1.4;">${escapeHtml(paymentMethod)}</div>
                          <div style="display:inline-block;margin-top:8px;background:${paymentStatus.color}15;border-radius:6px;padding:3px 10px;">
                            <span style="font-size:12px;font-weight:700;color:${paymentStatus.color};">${paymentStatus.emoji} ${paymentStatus.label}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-left:8px;width:33%;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#f8fafc,#f1f5f9);border-radius:16px;border:1px solid #e2e8f0;">
                      <tr>
                        <td style="padding:18px 16px;">
                          <div style="font-size:20px;margin-bottom:8px;">📍</div>
                          <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">${escapeHtml(summaryLabel)}</div>
                          <div style="font-size:13px;font-weight:600;color:#0f172a;line-height:1.6;">
                            ${addressParts.map(line => escapeHtml(line)).join('<br/>')}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── Order Date ────────────────────────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="text-align:center;padding:12px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                    <span style="font-size:12px;color:#94a3b8;font-weight:600;">🕐 Order placed: </span>
                    <span style="font-size:13px;color:#0f172a;font-weight:700;">${formatDateTime(order.created_at)}</span>
                  </td>
                </tr>
              </table>

              <!-- ── Items Table ───────────────────────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                      <span style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#64748b;">📋 Order Items</span>
                      <span style="font-size:12px;font-weight:600;color:#94a3b8;background:#f1f5f9;padding:4px 12px;border-radius:8px;">${totalItems} item${totalItems !== 1 ? 's' : ''}</span>
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
                      <thead>
                        <tr>
                          <th style="text-align:left;padding:14px 18px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;background:#f8fafc;border-bottom:2px solid #e2e8f0;">Product</th>
                          <th style="text-align:right;padding:14px 18px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;background:#f8fafc;border-bottom:2px solid #e2e8f0;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${orderItemsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── Price Summary ─────────────────────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" align="right" style="min-width:300px;">
                      <tr>
                        <td style="padding:10px 0;font-size:14px;color:#64748b;font-weight:500;">Subtotal</td>
                        <td style="padding:10px 0;text-align:right;font-size:14px;color:#0f172a;font-weight:600;">${formatMoney(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;font-size:14px;color:#64748b;font-weight:500;">
                          Shipping
                          ${parseFloat(order.shipping_cost) === 0 ? '<span style="margin-left:6px;background:#d1fae5;color:#059669;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;text-transform:uppercase;">Free</span>' : ''}
                        </td>
                        <td style="padding:10px 0;text-align:right;font-size:14px;color:#0f172a;font-weight:600;">${formatMoney(order.shipping_cost)}</td>
                      </tr>
                      ${parseFloat(order.discount) > 0 ? `
                      <tr>
                        <td style="padding:10px 0;font-size:14px;color:#10b981;font-weight:600;">
                          🏷️ Discount
                        </td>
                        <td style="padding:10px 0;text-align:right;font-size:14px;color:#10b981;font-weight:700;">-${formatMoney(order.discount)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td colspan="2" style="padding:0;">
                          <div style="height:2px;background:linear-gradient(90deg,#e2e8f0,${accent.start},#e2e8f0);margin:8px 0;border-radius:2px;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;font-size:18px;font-weight:900;color:#0f172a;">Grand Total</td>
                        <td style="padding:12px 0;text-align:right;">
                          <div style="display:inline-block;background:linear-gradient(135deg,${accent.start},${accent.end});color:#fff;font-size:20px;font-weight:900;padding:8px 20px;border-radius:12px;letter-spacing:-.3px;">${formatMoney(order.total)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── Notes ─────────────────────────────────────────── -->
              ${order.notes ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="padding:18px 20px;border-radius:16px;background:linear-gradient(145deg,#fffbeb,#fef3c7);border:1px solid #fde68a;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#92400e;margin-bottom:8px;">📝 Customer Notes</div>
                    <div style="color:#78350f;line-height:1.7;font-size:14px;white-space:pre-line;">${escapeHtml(order.notes)}</div>
                  </td>
                </tr>
              </table>
              ` : ''}

            </td>
          </tr>

          <!-- ══════ FOOTER ══════ -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 36px;text-align:center;">
              <div style="margin-bottom:16px;">
                <span style="font-size:14px;font-weight:800;color:#0f172a;">✦ Moniluck</span>
                <span style="font-size:12px;color:#94a3b8;margin-left:8px;">Care For Every Corner of Your Life</span>
              </div>
              <div style="font-size:12px;color:#94a3b8;line-height:1.8;">
                Moniluck Cosmetic & Consumer Products Ltd.<br/>
                Dhaka, Bangladesh<br/>
                <a href="mailto:info@moniluck.com" style="color:#6366f1;text-decoration:none;font-weight:600;">info@moniluck.com</a>
              </div>
              <div style="margin-top:16px;">
                <a href="#" style="display:inline-block;width:32px;height:32px;background:#f1f5f9;border-radius:8px;margin:0 4px;line-height:32px;text-align:center;text-decoration:none;font-size:14px;color:#64748b;">f</a>
                <a href="#" style="display:inline-block;width:32px;height:32px;background:#f1f5f9;border-radius:8px;margin:0 4px;line-height:32px;text-align:center;text-decoration:none;font-size:14px;color:#64748b;">𝕏</a>
                <a href="#" style="display:inline-block;width:32px;height:32px;background:#f1f5f9;border-radius:8px;margin:0 4px;line-height:32px;text-align:center;text-decoration:none;font-size:14px;color:#64748b;">in</a>
                <a href="#" style="display:inline-block;width:32px;height:32px;background:#f1f5f9;border-radius:8px;margin:0 4px;line-height:32px;text-align:center;text-decoration:none;font-size:14px;color:#64748b;">▶</a>
              </div>
              <div style="margin-top:16px;font-size:11px;color:#cbd5e1;">
                © ${new Date().getFullYear()} Moniluck. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ═══════════════════════════════════════════════════════════════════════════
// PLAIN TEXT EMAIL BUILDER
// ═══════════════════════════════════════════════════════════════════════════

const buildOrderEmailText = ({ heading, order, items }) => {
  const status        = statusConfig[order.status] || statusConfig.pending;
  const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
  const paymentMethod = paymentMethodLabels[order.payment_method] || capitalize(order.payment_method);

  const addressLines = [
    order.ship_address,
    order.ship_address2,
    [order.ship_city, order.ship_state].filter(Boolean).join(', '),
    order.ship_zip,
    order.ship_country,
  ].filter(Boolean);

  const divider    = '━'.repeat(48);
  const subDivider = '─'.repeat(48);
  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  const itemLines = items.map((item, i) => {
    const num = String(i + 1).padStart(2, '0');
    return [
      `  ${num}. ${item.product_name}`,
      `      Qty: ${item.quantity}  ×  ${formatMoney(item.price)}  =  ${formatMoney(item.total)}`,
    ].join('\n');
  });

  return [
    ``,
    `  ✦  M O N I L U C K`,
    `  Care For Every Corner of Your Life`,
    ``,
    divider,
    ``,
    `  ${heading}`,
    ``,
    divider,
    ``,
    `  📋  ORDER DETAILS`,
    subDivider,
    `  Order #        ${order.order_number}`,
    `  Status         ${status.emoji}  ${status.label}`,
    `  Payment        ${paymentMethod}`,
    `  Pay Status     ${paymentStatus.emoji}  ${paymentStatus.label}`,
    `  Placed         ${formatDateTime(order.created_at)}`,
    ``,
    `  👤  CUSTOMER`,
    subDivider,
    `  Name           ${order.ship_first_name} ${order.ship_last_name}`,
    `  Email          ${order.ship_email}`,
    `  Phone          ${order.ship_phone}`,
    ``,
    `  📍  SHIPPING ADDRESS`,
    subDivider,
    ...addressLines.map(line => `  ${line}`),
    ``,
    `  🛍️  ORDER ITEMS  (${totalItems} item${totalItems !== 1 ? 's' : ''})`,
    subDivider,
    ...itemLines,
    ``,
    subDivider,
    ``,
    `  💰  PRICE SUMMARY`,
    subDivider,
    `  Subtotal       ${formatMoney(order.subtotal)}`,
    `  Shipping       ${formatMoney(order.shipping_cost)}${parseFloat(order.shipping_cost) === 0 ? '  (FREE)' : ''}`,
    parseFloat(order.discount) > 0 ? `  Discount       -${formatMoney(order.discount)}` : null,
    subDivider,
    `  GRAND TOTAL    ${formatMoney(order.total)}`,
    ``,
    order.notes ? [
      `  📝  NOTES`,
      subDivider,
      `  ${order.notes}`,
      ``,
    ].join('\n') : null,
    divider,
    ``,
    `  Moniluck Cosmetic & Consumer Products Ltd.`,
    `  Dhaka, Bangladesh`,
    `  info@moniluck.com`,
    ``,
    `  © ${new Date().getFullYear()} Moniluck. All rights reserved.`,
    ``,
  ]
    .filter(line => line !== null)
    .join('\n');
};

// ═══════════════════════════════════════════════════════════════════════════
// TELEGRAM MESSAGE BUILDER
// ═══════════════════════════════════════════════════════════════════════════

const buildOrderTelegramMessage = ({ heading, order, items }) => {
  const status        = statusConfig[order.status] || statusConfig.pending;
  const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
  const paymentMethod = paymentMethodLabels[order.payment_method] || capitalize(order.payment_method);
  const totalItems    = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  const addressLines = [
    order.ship_address,
    order.ship_address2,
    [order.ship_city, order.ship_state].filter(Boolean).join(', '),
    order.ship_zip,
    order.ship_country,
  ].filter(Boolean);

  const itemLines = items.map(
    (item, i) =>
      `   ${i + 1}. ${item.product_name}\n      ${item.quantity} × ${formatMoney(item.price)} = ${formatMoney(item.total)}`
  );

  const freeShippingTag = parseFloat(order.shipping_cost) === 0 ? ' 🎉 FREE' : '';
  const discountLine =
    parseFloat(order.discount) > 0
      ? `🏷 Discount:    -${formatMoney(order.discount)}\n`
      : '';

  return [
    `╔══════════════════════════╗`,
    `   ✦  MONILUCK ORDER UPDATE`,
    `╚══════════════════════════╝`,
    ``,
    `${heading}`,
    ``,
    `┌─── 📋 Order Info ─────────────`,
    `│ Order #:    ${order.order_number}`,
    `│ Status:     ${status.emoji} ${status.label}`,
    `│ Payment:    ${paymentMethod}`,
    `│ Pay Status: ${paymentStatus.emoji} ${paymentStatus.label}`,
    `│ Placed:     ${formatDateTime(order.created_at)}`,
    `└──────────────────────────`,
    ``,
    `┌─── 👤 Customer ──────────────`,
    `│ ${order.ship_first_name} ${order.ship_last_name}`,
    `│ 📧 ${order.ship_email}`,
    `│ 📞 ${order.ship_phone}`,
    `└──────────────────────────`,
    ``,
    `┌─── 📍 Shipping Address ──────`,
    ...addressLines.map(line => `│ ${line}`),
    `└───────────────────────`,
    ``,
    `┌─── 🛍 Items (${totalItems}) ──────────`,
    ...itemLines.map(line => `│${line}`),
    `└────────────────────────────`,
    ``,
    `┌─── 💰 Summary ─────────────`,
    `│ Subtotal:    ${formatMoney(order.subtotal)}`,
    `│ Shipping:    ${formatMoney(order.shipping_cost)}${freeShippingTag}`,
    discountLine ? `│ ${discountLine.trim()}` : null,
    `│ ─────────────────────`,
    `│ 💎 TOTAL:     ${formatMoney(order.total)}`,
    `└─────────────────────────`,
    order.notes
      ? [
          ``,
          `┌─── 📝 Notes ────────────────`,
          `│ ${order.notes}`,
          `└──────────────────────────────`,
        ].join('\n')
      : null,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✦ Moniluck • Dhaka, Bangladesh`,
  ]
    .filter(line => line !== null)
    .join('\n');
};

// ═══════════════════════════════════════════════════════════════════════════
// SEND FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    return { sent: false, skipped: true, reason: 'Email credentials are not configured.' };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return { sent: false, error: error.message };
  }
};

const sendTelegramMessage = async (message) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId   = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return { sent: false, skipped: true, reason: 'Telegram credentials are not configured.' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ chat_id: chatId, text: message }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return { sent: true };
  } catch (error) {
    console.error('Telegram message failed:', error.message);
    return { sent: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  sendEmail,
  sendTelegramMessage,
  buildOrderEmailHtml,
  buildOrderEmailText,
  buildOrderTelegramMessage,
};