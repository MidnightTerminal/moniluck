import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminUsers, getAdminUser, updateUser, deleteUser } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './Users.css';

const Users = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(0);
  const [filters, setFilters]     = useState({ page: 1, search: '', role: '', status: '' });
  const [editModal, setEditModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewData, setViewData]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers(filters);
      if (data.success) { setUsers(data.users); setTotal(data.total); setPages(data.pages); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  /* ─── View User ──────────────────────────────────────────────── */
  const handleView = async (user) => {
    setViewModal(user);
    setViewLoading(true);
    try {
      const { data } = await getAdminUser(user.id);
      if (data.success) setViewData(data.user);
    } catch { toast.error('Failed to load user details.'); }
    finally { setViewLoading(false); }
  };

  /* ─── Edit User ──────────────────────────────────────────────── */
  const openEdit = (user) => {
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role: user.role,
      is_active: !!user.is_active,
    });
    setEditModal(user);
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      const { data } = await updateUser(editModal.id, editForm);
      if (data.success) { toast.success(data.message); setEditModal(null); load(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); }
    finally { setSaving(false); }
  };

  /* ─── Delete User ────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const { data } = await deleteUser(deleteModal.id);
      if (data.success) { toast.success(data.message); load(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed.'); }
    setDeleteModal(null);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'admin-badge-warning', confirmed: 'admin-badge-info',
      processing: 'admin-badge-info', shipped: 'admin-badge-info',
      delivered: 'admin-badge-success', cancelled: 'admin-badge-error',
    };
    return map[status] || 'admin-badge-neutral';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users ({total})</h1>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <span className="material-icons-round admin-search-icon">search</span>
          <input placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))} />
        </div>
        <select className="admin-filter-select" value={filters.role}
          onChange={e => setFilters(p => ({ ...p, role: e.target.value, page: 1 }))}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <select className="admin-filter-select" value={filters.status}
          onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8"><div className="admin-loading-page" style={{ minHeight: 200 }}><div className="admin-spinner" /></div></td></tr>
              ) : users.length > 0 ? users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">
                        {u.first_name?.charAt(0)}{u.last_name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                  <td style={{ color: 'var(--admin-text-light)', fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                  <td>
                    <span className={`admin-badge ${u.role === 'admin' ? 'admin-badge-info' : 'admin-badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.order_count || 0}</td>
                  <td>
                    <span className={`admin-badge ${u.is_active ? 'admin-badge-success' : 'admin-badge-error'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="admin-btn admin-btn-ghost admin-btn-icon" title="View"
                        onClick={() => handleView(u)}>
                        <span className="material-icons-round" style={{ fontSize: '1rem' }}>visibility</span>
                      </button>
                      <button className="admin-btn admin-btn-ghost admin-btn-icon" title="Edit"
                        onClick={() => openEdit(u)}>
                        <span className="material-icons-round" style={{ fontSize: '1rem' }}>edit</span>
                      </button>
                      <button className="admin-btn admin-btn-ghost admin-btn-icon" title="Delete"
                        onClick={() => setDeleteModal(u)} style={{ color: 'var(--admin-error)' }}>
                        <span className="material-icons-round" style={{ fontSize: '1rem' }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8"><div className="admin-empty"><span className="material-icons-round">people</span><h3>No users found</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="admin-pagination">
          <button className="admin-pagination-btn" disabled={filters.page <= 1}
            onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>
            <span className="material-icons-round">chevron_left</span>
          </button>
          {[...Array(Math.min(pages, 10))].map((_, i) => (
            <button key={i + 1} className={`admin-pagination-btn ${filters.page === i + 1 ? 'active' : ''}`}
              onClick={() => setFilters(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
          ))}
          <button className="admin-pagination-btn" disabled={filters.page >= pages}
            onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      )}

      {/* ─── View User Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {viewModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setViewModal(null); setViewData(null); }}>
            <motion.div className="admin-modal" style={{ maxWidth: 600 }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>User Details</h2>
                <button className="admin-modal-close" onClick={() => { setViewModal(null); setViewData(null); }}>
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <div className="admin-modal-body">
                {viewLoading ? (
                  <div className="admin-loading-page" style={{ minHeight: 200 }}><div className="admin-spinner" /></div>
                ) : viewData ? (
                  <>
                    {/* User Info */}
                    <div className="user-detail-header">
                      <div className="user-detail-avatar">
                        {viewData.first_name?.charAt(0)}{viewData.last_name?.charAt(0)}
                      </div>
                      <div>
                        <h3>{viewData.first_name} {viewData.last_name}</h3>
                        <p>{viewData.email}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <span className={`admin-badge ${viewData.role === 'admin' ? 'admin-badge-info' : 'admin-badge-neutral'}`}>
                            {viewData.role}
                          </span>
                          <span className={`admin-badge ${viewData.is_active ? 'admin-badge-success' : 'admin-badge-error'}`}>
                            {viewData.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="user-detail-meta">
                      <div className="user-detail-meta-item">
                        <span className="material-icons-round">phone</span>
                        <span>{viewData.phone || 'No phone'}</span>
                      </div>
                      <div className="user-detail-meta-item">
                        <span className="material-icons-round">calendar_today</span>
                        <span>Joined {new Date(viewData.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    {viewData.orders && viewData.orders.length > 0 && (
                      <div style={{ marginTop: 24 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12 }}>
                          Recent Orders ({viewData.orders.length})
                        </h4>
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
                            <tbody>
                              {viewData.orders.map(o => (
                                <tr key={o.id}>
                                  <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                                  <td><span className={`admin-badge ${getStatusBadge(o.status)}`}>{o.status}</span></td>
                                  <td style={{ fontWeight: 700 }}>Tk {parseFloat(o.total).toFixed(2)}</td>
                                  <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)' }}>
                                    {new Date(o.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Recent Reviews */}
                    {viewData.reviews && viewData.reviews.length > 0 && (
                      <div style={{ marginTop: 24 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12 }}>
                          Recent Reviews ({viewData.reviews.length})
                        </h4>
                        {viewData.reviews.map(r => (
                          <div key={r.id} className="user-review-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.product_name}</span>
                              <span style={{ color: '#f59e0b', fontSize: '0.82rem' }}>
                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                              </span>
                            </div>
                            {r.body && <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5 }}>{r.body}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Edit User Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {editModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditModal(null)}>
            <motion.div className="admin-modal" style={{ maxWidth: 500 }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Edit User</h2>
                <button className="admin-modal-close" onClick={() => setEditModal(null)}>
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">First Name</label>
                    <input className="admin-input" value={editForm.first_name}
                      onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Last Name</label>
                    <input className="admin-input" value={editForm.last_name}
                      onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Phone</label>
                  <input className="admin-input" value={editForm.phone}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Email</label>
                  <input className="admin-input" value={editModal.email} disabled
                    style={{ opacity: 0.6 }} />
                  <span className="admin-form-hint">Email cannot be changed.</span>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">Role</label>
                    <select className="admin-select" value={editForm.role}
                      onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Status</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={editForm.is_active}
                        onChange={e => setEditForm(p => ({ ...p, is_active: e.target.checked }))} />
                      <span style={{ fontSize: '0.88rem' }}>Active</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleEditSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Modal ───────────────────────────────────────── */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--admin-error)', display: 'block', marginBottom: 12 }}>warning</span>
              <h2 style={{ fontSize: '1.15rem', marginBottom: 8 }}>Delete User?</h2>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 20, fontSize: '0.88rem' }}>
                Are you sure you want to delete <strong>{deleteModal.first_name} {deleteModal.last_name}</strong> ({deleteModal.email})?
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="admin-btn admin-btn-danger" onClick={handleDelete}>
                  <span className="material-icons-round">delete</span> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Users;