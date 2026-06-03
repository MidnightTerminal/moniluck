import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { getDashboard } from '../../utils/adminApi';
import './Dashboard.css';

/* ─── helpers ──────────────────────────────────────────────── */
const fmt  = (v) => `৳${Number(v || 0).toLocaleString('en-BD', { minimumFractionDigits: 0 })}`;
const fmtK = (v) => {
  const n = Number(v || 0);
  if (n >= 1000000) return `৳${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `৳${(n / 1000).toFixed(1)}K`;
  return `৳${n.toFixed(0)}`;
};

const GrowthBadge = ({ value }) => {
  if (value === null || value === undefined) return null;
  const isUp   = value > 0;
  const isZero = value === 0;
  return (
    <span className={`growth-badge ${isUp ? 'up' : isZero ? 'neutral' : 'down'}`}>
      {!isZero && (
        <span className="material-icons-round" style={{ fontSize: '0.85rem' }}>
          {isUp ? 'trending_up' : 'trending_down'}
        </span>
      )}
      {isZero ? '0%' : `${isUp ? '+' : ''}${value}%`}
    </span>
  );
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const PIE_COLORS = {
  pending:    '#f59e0b',
  confirmed:  '#3b82f6',
  processing: '#8b5cf6',
  shipped:    '#06b6d4',
  delivered:  '#10b981',
  cancelled:  '#ef4444',
  refunded:   '#64748b',
};

const PAYMENT_COLORS = {
  cod:   '#f59e0b',
  card:  '#6366f1',
  bkash: '#e91e8f',
  nagad: '#f97316',
};

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  card: 'Card',
  bkash: 'bKash',
  nagad: 'Nagad',
};

const Dashboard = () => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [revenueView, setRevenueView] = useState('monthly');   // monthly | daily
  const [timeRange, setTimeRange]   = useState('today');         // today | week | month

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

  if (loading) {
    return (
      <div className="admin-loading-page">
        <div className="admin-spinner" />
        <p style={{ color: 'var(--admin-text-secondary)', marginTop: 12 }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  const {
    stats, today, thisWeek, thisMonth,
    recentOrders, topProducts, lowStock, ordersByStatus,
    monthlyRevenue, dailyOrders, revenueByCategory,
    paymentMethods, recentCustomers, topCustomers,
    recentReviews, hourlyData,
  } = data;

  /* ─── Derived Data ────────────────────────────────────────── */
  const timeData = timeRange === 'today' ? today : timeRange === 'week' ? thisWeek : thisMonth;
  const timeLabel = timeRange === 'today' ? "Today" : timeRange === 'week' ? 'This Week' : 'This Month';

  const statusBadgeClass = (status) => ({
    pending:    'admin-badge-warning',
    confirmed:  'admin-badge-info',
    processing: 'admin-badge-info',
    shipped:    'admin-badge-info',
    delivered:  'admin-badge-success',
    cancelled:  'admin-badge-error',
    refunded:   'admin-badge-neutral',
  }[status] || 'admin-badge-neutral');

  const totalOrdersFromStatus = (ordersByStatus || []).reduce((s, o) => s + o.count, 0);

  const categoryTotal = (revenueByCategory || []).reduce((s, c) => s + parseFloat(c.revenue), 0);

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };

  const fadeUp = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  /* Custom tooltip */
  const ChartTooltip = ({ active, payload, label, prefix = '৳' }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="chart-tooltip__value" style={{ color: p.color }}>
            <span className="chart-tooltip__dot" style={{ background: p.color }} />
            {p.name}: {prefix}{Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard">
      {/* ═══════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════ */}
      <div className="dashboard-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="dashboard-header__sub">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="dashboard-header__actions">
          <div className="dashboard-time-toggle">
            {['today', 'week', 'month'].map(t => (
              <button
                key={t}
                className={`time-toggle-btn ${timeRange === t ? 'active' : ''}`}
                onClick={() => setTimeRange(t)}
              >
                {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TIME PERIOD KPI CARDS
          ═══════════════════════════════════════════════════════ */}
      <motion.div className="kpi-row" variants={stagger} initial="hidden" animate="visible">
        {[
          {
            label: `${timeLabel}'s Revenue`, value: fmt(timeData.revenue),
            growth: timeData.revenueGrowth, icon: 'account_balance_wallet',
            color: '#10b981', bg: '#ecfdf5',
            sub: `vs previous ${timeRange === 'today' ? 'day' : timeRange === 'week' ? 'week' : 'month'}`,
          },
          {
            label: `${timeLabel}'s Orders`, value: timeData.orders,
            growth: timeData.ordersGrowth, icon: 'shopping_cart',
            color: '#6366f1', bg: '#eef2ff',
            sub: `vs previous ${timeRange === 'today' ? 'day' : timeRange === 'week' ? 'week' : 'month'}`,
          },
          {
            label: 'Avg. Order Value', value: fmt(stats.avgOrderValue),
            icon: 'analytics', color: '#f59e0b', bg: '#fffbeb',
            sub: 'Based on paid orders',
          },
          {
            label: 'Conversion Rate', value: `${stats.conversionRate}%`,
            icon: 'conversion_path', color: '#8b5cf6', bg: '#f5f3ff',
            sub: 'Orders / Customers',
          },
        ].map((kpi, i) => (
          <motion.div key={i} className="kpi-card" variants={fadeUp}>
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: kpi.bg }}>
                <span className="material-icons-round" style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
              {kpi.growth !== undefined && <GrowthBadge value={kpi.growth} />}
            </div>
            <p className="kpi-card__value">{kpi.value}</p>
            <p className="kpi-card__label">{kpi.label}</p>
            <p className="kpi-card__sub">{kpi.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          OVERVIEW STAT GRID
          ═══════════════════════════════════════════════════════ */}
      <motion.div className="stat-grid" variants={stagger} initial="hidden" animate="visible">
        {[
          { label: 'Total Revenue',      value: fmt(stats.totalRevenue),     icon: 'attach_money',     color: '#10b981', bg: '#d1fae5' },
          { label: 'Total Orders',       value: stats.totalOrders,           icon: 'receipt_long',     color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Active Products',    value: stats.activeProducts,        icon: 'inventory_2',      color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Total Customers',    value: stats.totalUsers,            icon: 'people',           color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Pending Orders',     value: stats.pendingOrders,         icon: 'pending_actions',  color: '#ef4444', bg: '#fee2e2' },
          { label: 'Subscribers',        value: stats.totalSubscribers,      icon: 'mark_email_read',  color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'New Users (7d)',     value: stats.newUsersWeek,          icon: 'person_add',       color: '#06b6d4', bg: '#ecfeff' },
          { label: 'Out of Stock',       value: stats.outOfStock,            icon: 'production_quantity_limits', color: '#ef4444', bg: '#fee2e2' },
          { label: 'Pending Reviews',    value: stats.pendingReviews,        icon: 'rate_review',      color: '#f97316', bg: '#fff7ed' },
          { label: 'Categories',         value: stats.totalCategories,       icon: 'category',         color: '#14b8a6', bg: '#ccfbf1' },
        ].map((s, i) => (
          <motion.div key={i} className="mini-stat" variants={fadeUp}>
            <div className="mini-stat__icon" style={{ background: s.bg }}>
              <span className="material-icons-round" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="mini-stat__value">{s.value}</p>
              <p className="mini-stat__label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          REVENUE & ORDERS CHARTS
          ═══════════════════════════════════════════════════════ */}
      <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
        {/* Revenue Chart */}
        <div className="admin-card chart-card">
          <div className="chart-card__header">
            <div>
              <h3 className="admin-card-title" style={{ marginBottom: 4 }}>Revenue Overview</h3>
              <p className="chart-card__sub">Revenue & orders trend</p>
            </div>
            <div className="chart-view-toggle">
              {['monthly', 'daily'].map(v => (
                <button key={v} className={`chart-view-btn ${revenueView === v ? 'active' : ''}`}
                  onClick={() => setRevenueView(v)}>
                  {v === 'monthly' ? '12 Months' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          {((revenueView === 'monthly' ? monthlyRevenue : dailyOrders) || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueView === 'monthly' ? monthlyRevenue : dailyOrders}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" />
                <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={2} fill="url(#ordersGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty" style={{ padding: 60 }}>
              <span className="material-icons-round">bar_chart</span>
              <p>No data available yet.</p>
            </div>
          )}
        </div>

        {/* Today's Hourly Activity */}
        <div className="admin-card chart-card">
          <div className="chart-card__header">
            <div>
              <h3 className="admin-card-title" style={{ marginBottom: 4 }}>Today's Activity</h3>
              <p className="chart-card__sub">Hourly order distribution</p>
            </div>
            <div className="chart-card__badge">
              <span className="material-icons-round" style={{ fontSize: '0.9rem' }}>schedule</span>
              Live
            </div>
          </div>

          {hourlyData && hourlyData.some(h => h.orders > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={2} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip prefix="" />} />
                <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty" style={{ padding: 60 }}>
              <span className="material-icons-round">schedule</span>
              <p>No orders placed today yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PIE CHARTS ROW
          ═══════════════════════════════════════════════════════ */}
      <div className="dashboard-grid-3" style={{ marginTop: 24 }}>
        {/* Orders by Status — Pie */}
        <div className="admin-card chart-card">
          <h3 className="admin-card-title">Orders by Status</h3>
          {ordersByStatus && ordersByStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={ordersByStatus.map(o => ({ name: o.status, value: o.count }))}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {ordersByStatus.map((o, i) => (
                      <Cell key={i} fill={PIE_COLORS[o.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {ordersByStatus.map((o, i) => (
                  <div key={i} className="pie-legend__item">
                    <span className="pie-legend__dot" style={{ background: PIE_COLORS[o.status] || CHART_COLORS[i] }} />
                    <span className="pie-legend__label">{o.status}</span>
                    <span className="pie-legend__value">{o.count}</span>
                    <span className="pie-legend__pct">
                      {totalOrdersFromStatus ? `${((o.count / totalOrdersFromStatus) * 100).toFixed(0)}%` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="admin-empty"><span className="material-icons-round">pie_chart</span><p>No orders yet.</p></div>
          )}
        </div>

        {/* Revenue by Category — Horizontal Bars */}
        <div className="admin-card chart-card">
          <h3 className="admin-card-title">Revenue by Category</h3>
          {revenueByCategory && revenueByCategory.length > 0 ? (
            <div className="category-bars">
              {revenueByCategory.map((c, i) => {
                const pct = categoryTotal > 0 ? (parseFloat(c.revenue) / categoryTotal) * 100 : 0;
                return (
                  <div key={i} className="category-bar">
                    <div className="category-bar__header">
                      <span className="category-bar__name">{c.category}</span>
                      <span className="category-bar__revenue">{fmt(c.revenue)}</span>
                    </div>
                    <div className="category-bar__track">
                      <motion.div
                        className="category-bar__fill"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                    <div className="category-bar__footer">
                      <span>{c.units_sold} units</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty"><span className="material-icons-round">category</span><p>No category data.</p></div>
          )}
        </div>

        {/* Payment Methods — Donut */}
        <div className="admin-card chart-card">
          <h3 className="admin-card-title">Payment Methods</h3>
          {paymentMethods && paymentMethods.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentMethods.map(p => ({
                      name: PAYMENT_LABELS[p.payment_method] || p.payment_method,
                      value: p.count,
                    }))}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {paymentMethods.map((p, i) => (
                      <Cell key={i} fill={PAYMENT_COLORS[p.payment_method] || CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {paymentMethods.map((p, i) => (
                  <div key={i} className="pie-legend__item">
                    <span className="pie-legend__dot" style={{ background: PAYMENT_COLORS[p.payment_method] || CHART_COLORS[i] }} />
                    <span className="pie-legend__label">{PAYMENT_LABELS[p.payment_method] || p.payment_method}</span>
                    <span className="pie-legend__value">{p.count}</span>
                    <span className="pie-legend__pct">{fmt(p.total_amount)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="admin-empty"><span className="material-icons-round">payment</span><p>No payment data.</p></div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TOP PRODUCTS & TOP CUSTOMERS
          ═══════════════════════════════════════════════════════ */}
      <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
        {/* Top Products */}
        <div className="admin-card">
          <div className="card-header-row">
            <h3 className="admin-card-title" style={{ marginBottom: 0 }}>🏆 Top Selling Products</h3>
            <Link to="/admin/products" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Product</th><th>Sold</th><th>Revenue</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {(topProducts || []).slice(0, 6).map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <span className={`rank-badge rank-badge--${i + 1}`}>
                        {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="product-thumb">
                          <span className="material-icons-round">shopping_bag</span>
                        </div>
                        <div>
                          <Link to={`/admin/products/edit/${p.id}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                            {p.name}
                          </Link>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-light)' }}>{p.category_name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 700 }}>{p.total_sold}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--admin-success)' }}>{fmt(p.total_revenue)}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{parseFloat(p.rating || 0).toFixed(1)}</span>
                        <span style={{ color: 'var(--admin-text-light)', fontSize: '0.72rem' }}>({p.review_count})</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!topProducts || !topProducts.length) && (
                  <tr><td colSpan="5" className="table-empty">No products data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="admin-card">
          <div className="card-header-row">
            <h3 className="admin-card-title" style={{ marginBottom: 0 }}>👑 Top Customers</h3>
            <Link to="/admin/users" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Customer</th><th>Orders</th><th>Total Spent</th></tr>
              </thead>
              <tbody>
                {(topCustomers || []).map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <span className={`rank-badge rank-badge--${i + 1}`}>
                        {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="customer-avatar">{c.first_name?.charAt(0)}{c.last_name?.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.first_name} {c.last_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-light)' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.order_count}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--admin-success)' }}>{fmt(c.total_spent)}</span></td>
                  </tr>
                ))}
                {(!topCustomers || !topCustomers.length) && (
                  <tr><td colSpan="4" className="table-empty">No customer data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RECENT ORDERS & LOW STOCK
          ═══════════════════════════════════════════════════════ */}
      <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="card-header-row">
            <h3 className="admin-card-title" style={{ marginBottom: 0 }}>🕐 Recent Orders</h3>
            <Link to="/admin/orders" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
          </div>
          <div className="recent-orders-list">
            {(recentOrders || []).slice(0, 6).map(order => (
              <Link to={`/admin/orders/${order.id}`} key={order.id} className="recent-order-item">
                <div className="recent-order-item__left">
                  <div className="recent-order-item__number">{order.order_number}</div>
                  <div className="recent-order-item__customer">{order.customer_name}</div>
                  <div className="recent-order-item__meta">
                    {order.item_count} items · {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="recent-order-item__right">
                  <span className="recent-order-item__total">{fmt(order.total)}</span>
                  <span className={`admin-badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
                </div>
              </Link>
            ))}
            {(!recentOrders || !recentOrders.length) && (
              <div className="admin-empty" style={{ padding: 32 }}><p>No orders yet.</p></div>
            )}
          </div>
        </div>

        {/* Low Stock + Recent Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Low Stock */}
          <div className="admin-card">
            <div className="card-header-row">
              <h3 className="admin-card-title" style={{ marginBottom: 0 }}>
                ⚠️ Low Stock Alert
                {lowStock && lowStock.length > 0 && (
                  <span className="admin-badge admin-badge-error" style={{ marginLeft: 8 }}>{lowStock.length}</span>
                )}
              </h3>
              <Link to="/admin/products" className="admin-btn admin-btn-ghost admin-btn-sm">Manage</Link>
            </div>
            <div className="low-stock-list">
              {(lowStock || []).slice(0, 5).map(p => (
                <div key={p.id} className="low-stock-item">
                  <div className="low-stock-item__info">
                    <Link to={`/admin/products/edit/${p.id}`} className="low-stock-item__name">{p.name}</Link>
                    <span className="low-stock-item__sku">{p.sku}</span>
                  </div>
                  <div className="low-stock-item__right">
                    <span className="low-stock-item__price">{fmt(p.price)}</span>
                    <div className={`stock-indicator ${p.stock <= 0 ? 'critical' : p.stock <= 5 ? 'low' : 'medium'}`}>
                      <span className="stock-indicator__bar">
                        <span className="stock-indicator__fill" style={{ width: `${Math.min(p.stock * 10, 100)}%` }} />
                      </span>
                      <span className="stock-indicator__count">{p.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!lowStock || !lowStock.length) && (
                <div className="admin-empty" style={{ padding: 24 }}>
                  <span className="material-icons-round" style={{ fontSize: '1.8rem' }}>check_circle</span>
                  <p>All products are well stocked!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="admin-card">
            <div className="card-header-row">
              <h3 className="admin-card-title" style={{ marginBottom: 0 }}>
                💬 Recent Reviews
                {stats.pendingReviews > 0 && (
                  <span className="admin-badge admin-badge-warning" style={{ marginLeft: 8 }}>{stats.pendingReviews} pending</span>
                )}
              </h3>
              <Link to="/admin/reviews" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
            </div>
            <div className="recent-reviews-list">
              {(recentReviews || []).slice(0, 4).map(r => (
                <div key={r.id} className="recent-review-item">
                  <div className="recent-review-item__top">
                    <span className="recent-review-item__stars">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                    <span className={`admin-badge ${r.is_approved ? 'admin-badge-success' : 'admin-badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                      {r.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {r.body && <p className="recent-review-item__body">{r.body.substring(0, 80)}{r.body.length > 80 ? '...' : ''}</p>}
                  <div className="recent-review-item__meta">
                    <span>{r.reviewer_name}</span>
                    <span>on {r.product_name}</span>
                  </div>
                </div>
              ))}
              {(!recentReviews || !recentReviews.length) && (
                <div className="admin-empty" style={{ padding: 24 }}><p>No reviews yet.</p></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RECENT CUSTOMERS
          ═══════════════════════════════════════════════════════ */}
      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="card-header-row">
          <h3 className="admin-card-title" style={{ marginBottom: 0 }}>
            🆕 New Customers
            {stats.newUsersToday > 0 && (
              <span className="admin-badge admin-badge-success" style={{ marginLeft: 8 }}>+{stats.newUsersToday} today</span>
            )}
          </h3>
          <Link to="/admin/users" className="admin-btn admin-btn-ghost admin-btn-sm">View All</Link>
        </div>
        <div className="new-customers-grid">
          {(recentCustomers || []).map((c, i) => (
            <motion.div key={c.id} className="new-customer-card"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="new-customer-card__avatar" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
                {c.first_name?.charAt(0)}{c.last_name?.charAt(0)}
              </div>
              <h4>{c.first_name} {c.last_name}</h4>
              <p className="new-customer-card__email">{c.email}</p>
              <div className="new-customer-card__stats">
                <div>
                  <span className="new-customer-card__stat-val">{c.order_count}</span>
                  <span className="new-customer-card__stat-lbl">Orders</span>
                </div>
                <div>
                  <span className="new-customer-card__stat-val">{fmt(c.total_spent)}</span>
                  <span className="new-customer-card__stat-lbl">Spent</span>
                </div>
              </div>
              <p className="new-customer-card__date">Joined {new Date(c.created_at).toLocaleDateString()}</p>
            </motion.div>
          ))}
          {(!recentCustomers || !recentCustomers.length) && (
            <div className="admin-empty" style={{ gridColumn: '1 / -1' }}><p>No recent customers.</p></div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;