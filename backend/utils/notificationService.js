const nodemailer = require('nodemailer');

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

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatMoney = (value = 0) => `$${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const buildOrderItemsHtml = (items = []) => items.map(item => `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid #edf2f7;">
      <div style="font-weight:600;color:#111827;">${escapeHtml(item.product_name)}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px;">Qty ${item.quantity}</div>
    </td>
    <td style="padding:12px 0;border-bottom:1px solid #edf2f7;text-align:right;color:#111827;font-weight:600;">${formatMoney(item.price)}</td>
    <td style="padding:12px 0;border-bottom:1px solid #edf2f7;text-align:right;color:#111827;font-weight:700;">${formatMoney(item.total)}</td>
  </tr>
`).join('');

const buildOrderEmailHtml = ({ title, intro, accent, order, items, summaryLabel }) => {
  const orderItemsHtml = buildOrderItemsHtml(items);
  const addressParts = [
    order.ship_address,
    order.ship_address2,
    [order.ship_city, order.ship_state].filter(Boolean).join(', '),
    order.ship_zip,
    order.ship_country,
  ].filter(Boolean);

  const notesHtml = order.notes
    ? `<div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">Notes</div>
        <div style="color:#374151;line-height:1.7;white-space:pre-line;">${escapeHtml(order.notes)}</div>
      </div>`
    : '';

  return `
    <div style="background:#f3f4f6;padding:24px 12px;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.12);border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg, ${accent.start}, ${accent.end});padding:28px 32px;color:#fff;">
          <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.85;font-weight:700;">Moniluck Order Update</div>
          <h2 style="margin:10px 0 8px;font-size:28px;line-height:1.2;">${escapeHtml(title)}</h2>
          <p style="margin:0;font-size:15px;line-height:1.7;opacity:.95;max-width:560px;">${escapeHtml(intro)}</p>
        </div>

        <div style="padding:32px;">
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:24px;">
            ${[
              ['Order #', order.order_number],
              ['Status', order.status],
              ['Payment', order.payment_method],
              ['Payment Status', order.payment_status],
              ['Placed', formatDateTime(order.created_at)],
            ].map(([label, value]) => `
              <div style="padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid #e5e7eb;">
                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">${escapeHtml(label)}</div>
                <div style="font-size:15px;font-weight:700;color:#111827;">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:24px;">
            ${[
              ['Customer', `${order.ship_first_name} ${order.ship_last_name}`],
              ['Email', order.ship_email],
              ['Phone', order.ship_phone],
            ].map(([label, value]) => `
              <div style="padding:14px 16px;border-radius:14px;background:#fff;border:1px solid #e5e7eb;">
                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">${escapeHtml(label)}</div>
                <div style="font-size:14px;font-weight:600;color:#111827;line-height:1.5;">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>

          <div style="padding:18px 20px;border-radius:16px;background:linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08));border:1px solid rgba(102,126,234,0.15);margin-bottom:24px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">${escapeHtml(summaryLabel)}</div>
            <div style="font-size:15px;line-height:1.8;color:#374151;">
              ${addressParts.map(line => escapeHtml(line)).join('<br/>')}
            </div>
          </div>

          <div style="margin-bottom:24px;">
            <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:14px;">Items</div>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:0 0 10px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">Product</th>
                  <th style="text-align:right;padding:0 0 10px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">Unit</th>
                  <th style="text-align:right;padding:0 0 10px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
            </table>
          </div>

          <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start;">
            <div>
              ${notesHtml}
            </div>
            <div style="padding:18px 20px;border-radius:16px;background:#111827;color:#fff;">
              ${[
                ['Subtotal', formatMoney(order.subtotal)],
                ['Shipping', formatMoney(order.shipping_cost)],
                ['Discount', formatMoney(order.discount)],
                ['Grand Total', formatMoney(order.total)],
              ].map(([label, value], index) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:${index === 0 ? '0 0 10px' : '10px 0'};border-top:${index === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)'};font-size:${index === 3 ? '18px' : '14px'};font-weight:${index === 3 ? '800' : '600'};">
                  <span>${escapeHtml(label)}</span>
                  <span>${value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const buildOrderTelegramMessage = ({ heading, order, items }) => {
  const itemLines = items.map(item => `• ${item.quantity} x ${item.product_name} = ${formatMoney(item.total)}`);
  const addressLines = [
    order.ship_address,
    order.ship_address2,
    [order.ship_city, order.ship_state].filter(Boolean).join(', '),
    order.ship_zip,
    order.ship_country,
  ].filter(Boolean);

  return [
    heading,
    `Order #: ${order.order_number}`,
    `Status: ${order.status}`,
    `Payment: ${order.payment_method}`,
    `Payment Status: ${order.payment_status}`,
    `Placed: ${formatDateTime(order.created_at)}`,
    `Customer: ${order.ship_first_name} ${order.ship_last_name}`,
    `Email: ${order.ship_email}`,
    `Phone: ${order.ship_phone}`,
    '',
    'Shipping address:',
    ...addressLines.map(line => `• ${line}`),
    '',
    'Items:',
    ...itemLines,
    '',
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Shipping: ${formatMoney(order.shipping_cost)}`,
    `Discount: ${formatMoney(order.discount)}`,
    `Total: ${formatMoney(order.total)}`,
    order.notes ? `Notes: ${order.notes}` : null,
  ].filter(Boolean).join('\n');
};

const buildOrderEmailText = ({ heading, order, items }) => {
  const addressLines = [
    order.ship_address,
    order.ship_address2,
    [order.ship_city, order.ship_state].filter(Boolean).join(', '),
    order.ship_zip,
    order.ship_country,
  ].filter(Boolean);

  return [
    heading,
    `Order #: ${order.order_number}`,
    `Status: ${order.status}`,
    `Payment: ${order.payment_method}`,
    `Payment Status: ${order.payment_status}`,
    `Placed: ${formatDateTime(order.created_at)}`,
    `Customer: ${order.ship_first_name} ${order.ship_last_name}`,
    `Email: ${order.ship_email}`,
    `Phone: ${order.ship_phone}`,
    '',
    'Shipping address:',
    ...addressLines.map(line => `- ${line}`),
    '',
    'Items:',
    ...items.map(item => `- ${item.quantity} x ${item.product_name} = ${formatMoney(item.total)}`),
    '',
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Shipping: ${formatMoney(order.shipping_cost)}`,
    `Discount: ${formatMoney(order.discount)}`,
    `Total: ${formatMoney(order.total)}`,
    order.notes ? `Notes: ${order.notes}` : null,
  ].filter(Boolean).join('\n');
};

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
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return { sent: false, skipped: true, reason: 'Telegram credentials are not configured.' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        chat_id: chatId,
        text   : message,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return { sent: true };
  } catch (error) {
    console.error('Telegram message failed:', error.message);
    return { sent: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendTelegramMessage,
  buildOrderEmailHtml,
  buildOrderEmailText,
  buildOrderTelegramMessage,
};
