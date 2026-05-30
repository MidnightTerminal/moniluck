import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAdminOrders, deleteOrder } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './Orders.css';

const statusColors = {
  pending:    'admin-badge-warning',  confirmed:  'admin-badge-info',
  processing: 'admin-badge-info',    shipped:    'admin-badge-info',
  delivered:  'admin-badge-success',  cancelled:  'admin-badge-error',
  refunded:   'admin-badge-neutral',
};

const paymentColors = {
  pending: 'admin-badge-warning', paid: 'admin-badge-success',
  failed:  'admin-badge-error',   refunded: 'admin-badge-neutral',
};

const Orders = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(0);
  const [filters, setFilters]   = useState({ page: 1, status: '', search: '' });
  const [deleteModal, setDeleteModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminOrders(filters);
      if (data.success) { setOrders(data.orders); setTotal(data.total); setPages(data.pages); }
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const { data } = await deleteOrder(deleteModal.id);
      if (data.success) { toast.success(data.message); load(); }
    } catch { toast.error('Delete failed.'); }
    setDeleteModal(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders ({total})</h1>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <span className="material-icons-round admin-search-icon">search</span>
          <input placeholder="Search by order #, email, or name..."
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))} />
        </div>
        <select className="admin-filter-select" value={filters.status}
          onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Status</th><th>Payment</th>
                <th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8"><div className="admin-loading-page" style={{ minHeight: 200 }}><div className="admin-spinner" /></div></td></tr>
              ) : orders.length > 0 ? orders.map(o => (
                <tr key={o.id}>
                  <td><Link to={`/admin/orders/${o.id}`} style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>{o.order_number}</Link></td>
                  <td>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{o.customer_name}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>{o.ship_email}</span>
                  </td>
                  <td>{o.item_count}</td>
                  <td style={{ fontWeight: 700 }}>${parseFloat(o.total).toFixed(2)}</td>
                  <td><span className={`admin-badge ${statusColors[o.status] || 'admin-badge-neutral'}`}>{o.status}</span></td>
                  <td><span className={`admin-badge ${paymentColors[o.payment_status] || 'admin-badge-neutral'}`}>{o.payment_status}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/admin/orders/${o.id}`} className="admin-btn admin-btn-ghost admin-btn-icon" title="View">
                        <span className="material-icons-round" style={{ fontSize: '1rem' }}>visibility</span>
                      </Link>
                      <button className="admin-btn admin-btn-ghost admin-btn-icon"
                        style={{ color: 'var(--admin-error)' }} onClick={() => setDeleteModal(o)} title="Delete">
                        <span className="material-icons-round" style={{ fontSize: '1rem' }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8"><div className="admin-empty"><span className="material-icons-round">receipt_long</span><h3>No orders found</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="admin-pagination">
          <button className="admin-pagination-btn" disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>
            <span className="material-icons-round">chevron_left</span>
          </button>
          {[...Array(Math.min(pages, 10))].map((_, i) => (
            <button key={i + 1} className={`admin-pagination-btn ${filters.page === i + 1 ? 'active' : ''}`}
              onClick={() => setFilters(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
          ))}
          <button className="admin-pagination-btn" disabled={filters.page >= pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      )}

      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--admin-error)', display: 'block', marginBottom: 12 }}>warning</span>
              <h2 style={{ fontSize: '1.15rem', marginBottom: 8 }}>Delete Order {deleteModal.order_number}?</h2>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 20 }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="admin-btn admin-btn-danger" onClick={handleDelete}><span className="material-icons-round">delete</span> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Orders;