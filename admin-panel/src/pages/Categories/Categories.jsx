import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './Categories.css';

const emptyForm = { name: '', slug: '', description: '', icon: '', image_url: '', sort_order: 0, is_active: true };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const load = async () => {
    try {
      const { data } = await getAdminCategories();
      if (data.success) setCategories(data.categories);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setErrors({}); setModalOpen(true); };

  const openEdit = (cat) => {
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description || '',
      icon: cat.icon || '', image_url: cat.image_url || '',
      sort_order: cat.sort_order || 0, is_active: !!cat.is_active,
    });
    setEditingId(cat.id); setErrors({}); setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => {
      const u = { ...p, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && !editingId) u.slug = value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return u;
    });
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required.';
    if (!form.slug.trim()) e.slug = 'Slug required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = editingId
        ? await updateCategory(editingId, form)
        : await createCategory(form);
      if (res.data.success) { toast.success(res.data.message); setModalOpen(false); load(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const { data } = await deleteCategory(deleteModal.id);
      if (data.success) { toast.success(data.message); load(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete.'); }
    setDeleteModal(null);
  };

  if (loading) return <div className="admin-loading-page"><div className="admin-spinner" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Categories ({categories.length})</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <span className="material-icons-round">add</span> Add Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.map(cat => (
          <motion.div key={cat.id} className="category-admin-card" layout>
            <div className="category-admin-card__header">
              <div className="category-admin-card__icon">
                <span className="material-icons-round">category</span>
              </div>
              <div>
                <h3>{cat.name}</h3>
                <span className="category-admin-card__slug">/{cat.slug}</span>
              </div>
              <span className={`admin-badge ${cat.is_active ? 'admin-badge-success' : 'admin-badge-neutral'}`} style={{ marginLeft: 'auto' }}>
                {cat.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {cat.description && <p className="category-admin-card__desc">{cat.description}</p>}
            <div className="category-admin-card__footer">
              <span className="category-admin-card__count">{cat.product_count || 0} products</span>
              <div className="actions">
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(cat)}>
                  <span className="material-icons-round" style={{ fontSize: '0.95rem' }}>edit</span> Edit
                </button>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setDeleteModal(cat)}
                  style={{ color: 'var(--admin-error)' }}>
                  <span className="material-icons-round" style={{ fontSize: '0.95rem' }}>delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}>
            <motion.div className="admin-modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{editingId ? 'Edit Category' : 'New Category'}</h2>
                <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">Name *</label>
                    <input className={`admin-input ${errors.name ? 'error' : ''}`} name="name"
                      value={form.name} onChange={handleChange} />
                    {errors.name && <span className="admin-form-error">{errors.name}</span>}
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Slug *</label>
                    <input className={`admin-input ${errors.slug ? 'error' : ''}`} name="slug"
                      value={form.slug} onChange={handleChange} />
                    {errors.slug && <span className="admin-form-error">{errors.slug}</span>}
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Description</label>
                  <textarea className="admin-input admin-textarea" name="description"
                    value={form.description} onChange={handleChange} rows="3" />
                </div>
                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-label">Icon</label>
                    <input className="admin-input" name="icon" value={form.icon} onChange={handleChange} placeholder="home" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sort Order</label>
                    <input type="number" className="admin-input" name="sort_order" value={form.sort_order} onChange={handleChange} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Status</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer' }}>
                      <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                      Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--admin-error)', marginBottom: 12, display: 'block' }}>warning</span>
              <h2 style={{ fontSize: '1.15rem', marginBottom: 8 }}>Delete "{deleteModal.name}"?</h2>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 20, fontSize: '0.88rem' }}>
                {deleteModal.product_count > 0
                  ? `This category has ${deleteModal.product_count} products. Remove or reassign them first.`
                  : 'This action cannot be undone.'}
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

export default Categories;