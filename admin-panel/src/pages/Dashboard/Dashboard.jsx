import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboard } from '../../utils/adminApi';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await getDashboard();
        if (res.success) setData(res.dashboard);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="admin-loading-page"><div className="admin-spinner" /></div>;

  const { stats, recentOrders, topProducts, lowStock, ordersByStatus, monthlyRevenue } = data || {};

  const statCards = [
    { label: 'Total Revenue',    value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: 'attach_money',     color: '#10b981', bg: '#d1fae5' },
    { label: 'Total Orders',     value: stats?.totalOrders || 0,     icon: 'receipt_long',    color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Active Products',  value: stats?.activeProducts || 0,  icon: 'inventory_2',     color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Total Customers',  value: stats?.totalUsers || 0,      icon: 'people',          color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Pending Orders',   value: stats?.pendingOrders || 0,   icon: 'pending_actions', color: '#ef4444', bg: '#fee2e2' },
    { label: 'Subscribers',      value: stats?.totalSubscribers || 0,icon: 'mark_email_read', color: '#8b5cf6', bg: '#ede9fe' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      pending:    'admin-badge-warning',
      confirmed:  'admin-badge-info',
      processing: 'admin-badge-info',
      shipped:    'admin-badge-info',
      delivered:  'admin-badge-success',
      cancelled:  'admin-badge-error',
      refunded:   'admin-badge-neutral',
    };
    return map[status] || 'admin-badge-neutral';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <span style={{ fontSize: '0.88rem', color: 'var(--admin-text-secondary)' }}>
          Welcome back! Here's your store overview.
        </span>
      </div>

      {/* ── Stat Cards ───────────────────────────────────── */}
      <div className="dashboard-stats">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            className="dashboard-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="dashboard-stat-card__icon" style={{ background: s.bg }}>
              <span className="material-icons-round" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="dashboard-stat-card__value">{s.value}</p>
              <p className="dashboard-stat-card__label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ───────────────────────────────────── */}
      <div className="dashboard-grid-2">
        {/* Revenue Chart */}
        <div className="admin-card">
          <h3 className="admin-card-title">Monthly Revenue</h3>
          {monthlyRevenue && monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty" style={{ padding: 40 }}>
              <span className="material-icons-round">bar_chart</span>
              <p>No revenue data yet.</p>
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="admin-card">
          <h3 className="admin-card-title">Orders by Status</h3>
          <div className="dashboard-status-list">
            {(ordersByStatus || []).map((s, i) => (
              <div key={i} className="dashboard-status-item">
                <span className={`admin-badge ${getStatusBadge(s.status)}`}>
                  {s.status}
                </span>
                <span className="dashboard-status-count">{s.count}</span>
              </div>
            ))}
            {(!ordersByStatus || ordersByStatus.length === 0) && (
              <div className="admin-empty"><p>No orders yet.</p></div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tables Row ───────────────────────────────────── */}
      <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
        {/* Recent Orders */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Recent Orders</h3>
            <Link to="/admin/orders" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders || []).slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td><Link to={`/admin/orders/${order.id}`} style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>{order.order_number}</Link></td>
                    <td>{order.customer_name}</td>
                    <td><span className={`admin-badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                    <td style={{ fontWeight: 700 }}>${parseFloat(order.total).toFixed(2)}</td>
                  </tr>
                ))}
                {(!recentOrders || !recentOrders.length) && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--admin-text-light)', padding: 32 }}>No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Low Stock Alert</h3>
            <Link to="/admin/products" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {(lowStock || []).map(p => (
                  <tr key={p.id}>
                    <td><Link to={`/admin/products/edit/${p.id}`} style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>{p.name}</Link></td>
                    <td style={{ color: 'var(--admin-text-light)' }}>{p.sku}</td>
                    <td>
                      <span className={`admin-badge ${p.stock <= 0 ? 'admin-badge-error' : p.stock <= 5 ? 'admin-badge-warning' : 'admin-badge-info'}`}>
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!lowStock || !lowStock.length) && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--admin-text-light)', padding: 32 }}>All stocked up!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;