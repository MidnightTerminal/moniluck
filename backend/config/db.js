const mysql = require('mysql2/promise');
require('dotenv').config();

// ─── Connection Pool ──────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host              : process.env.DB_HOST     || 'localhost',
  port              : parseInt(process.env.DB_PORT) || 3306,
  user              : process.env.DB_USER     || 'root',
  password          : process.env.DB_PASSWORD || '',
  database          : process.env.DB_NAME     || 'moniluck_db',
  waitForConnections: true,
  connectionLimit   : 15,
  queueLimit        : 0,
  enableKeepAlive   : true,
  keepAliveInitialDelay: 0,
  timezone          : '+00:00',
  charset           : 'utf8mb4',
});

// ─── Test Connection ──────────────────────────────────────────────────────────
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅  MySQL connected  →  ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    connection.release();
  } catch (error) {
    console.error('❌  MySQL connection failed:', error.message);
    process.exit(1);
  }
};

// ─── Query Helper ─────────────────────────────────────────────────────────────
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('DB Query Error:', error.message);
    throw error;
  }
};

// ─── Transaction Helper ───────────────────────────────────────────────────────
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, query, transaction, testConnection };