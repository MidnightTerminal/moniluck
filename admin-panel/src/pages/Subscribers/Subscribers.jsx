import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getSubscribers, deleteSubscriber } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './Subscribers.css';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [pages, setPages]             = useState(0);
  const [page, setPage]               = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getSubscribers({ page });
      if (data.success) {
        setSubscribers(data.subscribers);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const { data } = await deleteSubscriber(deleteModal.id);
      if (data.success) { toast.success(data.message); load(); }
    } catch { toast.error('Delete failed.'); }
    setDeleteModal(null);
  };

  const handleExport = () => {
    const csv = [
      'Email,Status,Subscribed Date',
      ...subscribers.map(s =>
        `${s.email},${s.is_active ? 'Active' : 'Inactive'},${new Date(s.subscribed_at).toLocaleDateString()}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moniluck-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Subscribers exported!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Newsletter Subscribers ({total})</h1>
        <button className="admin-btn admin-btn-secondary" onClick={handleExport} disabled={subscribers.length === 0}>
          <span className="material-icons-round">download</span> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="subscriber-stats">
        <div className="subscriber-stat">
          <span className="material-icons-round" style={{ color: 'var(--admin-primary)' }}>mark_email_read</span>
          <div>
            <p className="subscriber-stat__value">{total}</p>
            <p className="subscriber-stat__label">Total Subscribers</p>
          </div>
        </div>
        <div className="subscriber-stat">
          <span className="material-icons-round" style={{ color: 'var(--admin-success)' }}>check_circle</span>
          <div>
            <p className="subscriber-stat__value">{subscribers.filter(s => s.is_active).length}</p>
            <p className="subscriber-stat__label">Active</p>
          </div>
        </div>
        <div className="subscriber-stat">
          <span className="material-icons-round" style={{ color: 'var(--admin-text-light)' }}>cancel</span>
          <div>
            <p className="subscriber-stat__value">{subscribers.filter(s => !s.is_active).length}</p>
            <p className="subscriber-stat__label">Unsubscribed</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><div className="admin-loading-page" style={{ minHeight: 200 }}><div className="admin-spinner" /></div></td></tr>
              ) : subscribers.length > 0 ? subscribers.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--admin-text-light)', fontWeight: 600 }}>
                    {(page - 1) * 30 + i + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="material-icons-round" style={{ fontSize: '1.1rem', color: 'var(--admin-text-light)' }}>
                        email
                      </span>
                      <span style={{ fontWeight: 500 }}>{s.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${s.is_active ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
                      {s.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                    {new Date(s.subscribed_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                  <td>
                    <button className="admin-btn admin-btn-ghost admin-btn-icon"
                      style={{ color: 'var(--admin-error)' }}
                      onClick={() => setDeleteModal(s)} title="Remove">
                      <span className="material-icons-round" style={{ fontSize: '1rem' }}>delete</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5">
                  <div className="admin-empty">
                    <span className="material-icons-round">mark_email_read</span>
                    <h3>No subscribers yet</h3>
                    <p>Newsletter subscribers will appear here.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="admin-pagination">
          <button className="admin-pagination-btn" disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}>
            <span className="material-icons-round">chevron_left</span>
          </button>
          {[...Array(Math.min(pages, 10))].map((_, i) => (
            <button key={i + 1} className={`admin-pagination-btn ${page === i + 1 ? 'active' : ''}`}
              onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="admin-pagination-btn" disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}>
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--admin-error)', display: 'block', marginBottom: 12 }}>warning</span>
              <h2 style={{ fontSize: '1.15rem', marginBottom: 8 }}>Remove Subscriber?</h2>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 20, fontSize: '0.88rem' }}>
                Remove <strong>{deleteModal.email}</strong> from the newsletter list?
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="admin-btn admin-btn-danger" onClick={handleDelete}>
                  <span className="material-icons-round">delete</span> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Subscribers;