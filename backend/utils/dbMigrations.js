const { query } = require('../config/db');

const ensureReviewReplyColumns = async () => {
  const columns = await query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reviews'`,
    [process.env.DB_NAME || 'moniluck_db']
  );

  const columnNames = new Set(columns.map(column => column.COLUMN_NAME));

  if (!columnNames.has('admin_reply')) {
    await query('ALTER TABLE reviews ADD COLUMN admin_reply TEXT DEFAULT NULL');
  }

  if (!columnNames.has('admin_reply_at')) {
    await query('ALTER TABLE reviews ADD COLUMN admin_reply_at DATETIME DEFAULT NULL');
  }
};

module.exports = { ensureReviewReplyColumns };
