import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAdminProduct, createProduct, updateProduct, getAdminCategories } from '../../utils/adminApi';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', slug: '', category_id: '', description: '', short_desc: '',
  price: '', compare_price: '', sku: '', stock: '0', thumbnail: '',
  brand: '', is_featured: false, is_active: true,
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm]           = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(isEdit);
  const [errors, setErrors]       = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await getAdminCategories();
        if (catRes.data.success) setCategories(catRes.data.categories);

        if (isEdit) {
          const prodRes = await getAdminProduct(id);
          if (prodRes.data.success) {
            const p = prodRes.data.product;
            setForm({
              name: p.name || '', slug: p.slug || '', category_id: p.category_id || '',
              description: p.description || '', short_desc: p.short_desc || '',
              price: p.price || '', compare_price: p.compare_price || '', sku: p.sku || '',
              stock: p.stock ?? '0', thumbnail: p.thumbnail || '', brand: p.brand || '',
              is_featured: !!p.is_featured, is_active: !!p.is_active,
            });
          }
        }
      } catch (err) { toast.error('Failed to load data.'); }
      finally { setFetching(false); }
    };
    loadData();
  }, [id, isEdit]);

  const generateSlug = (name) => name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(p => {
      const updated = { ...p, [name]: val };
      if (name === 'name' && !isEdit) updated.slug = generateSlug(value);
      return updated;
    });
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Name is required.';
    if (!form.slug.trim())        e.slug        = 'Slug is required.';
    if (!form.category_id)        e.category_id = 'Category is required.';
    if (!form.price || form.price <= 0) e.price = 'Valid price is required.';
    if (!form.sku.trim())         e.sku         = 'SKU is required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock) || 0,
        category_id: parseInt(form.category_id),
      };

      const res = isEdit ? await updateProduct(id, payload) : await createProduct(payload);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/admin/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="admin-loading-page"><div className="admin-spinner" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <div>
          <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/products')} style={{ marginBottom: 8 }}>
            <span className="material-icons-round">arrow_back</span> Back to Products
          </button>
          <h1 className="admin-page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Main */}
          <div>
            <div className="admin-card">
              <h3 className="admin-card-title">Basic Information</h3>
              <div className="admin-form-group">
                <label className="admin-label">Product Name *</label>
                <input className={`admin-input ${errors.name ? 'error' : ''}`} name="name"
                  value={form.name} onChange={handleChange} placeholder="Premium Surface Cleaner" />
                {errors.name && <span className="admin-form-error">{errors.name}</span>}
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Slug *</label>
                  <input className={`admin-input ${errors.slug ? 'error' : ''}`} name="slug"
                    value={form.slug} onChange={handleChange} placeholder="premium-surface-cleaner" />
                  {errors.slug && <span className="admin-form-error">{errors.slug}</span>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">SKU *</label>
                  <input className={`admin-input ${errors.sku ? 'error' : ''}`} name="sku"
                    value={form.sku} onChange={handleChange} placeholder="HC-003" />
                  {errors.sku && <span className="admin-form-error">{errors.sku}</span>}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Short Description</label>
                <input className="admin-input" name="short_desc"
                  value={form.short_desc} onChange={handleChange} placeholder="Brief product summary" />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Full Description</label>
                <textarea className="admin-input admin-textarea" name="description"
                  value={form.description} onChange={handleChange} rows="5"
                  placeholder="Detailed product description..." />
              </div>
            </div>

            {/* Pricing */}
            <div className="admin-card" style={{ marginTop: 24 }}>
              <h3 className="admin-card-title">Pricing & Inventory</h3>
              <div className="admin-form-row-3">
                <div className="admin-form-group">
                  <label className="admin-label">Price ($) *</label>
                  <input type="number" step="0.01" className={`admin-input ${errors.price ? 'error' : ''}`}
                    name="price" value={form.price} onChange={handleChange} placeholder="12.99" />
                  {errors.price && <span className="admin-form-error">{errors.price}</span>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Compare Price ($)</label>
                  <input type="number" step="0.01" className="admin-input"
                    name="compare_price" value={form.compare_price} onChange={handleChange} placeholder="16.99" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Stock</label>
                  <input type="number" className="admin-input"
                    name="stock" value={form.stock} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="admin-card">
              <h3 className="admin-card-title">Organization</h3>
              <div className="admin-form-group">
                <label className="admin-label">Category *</label>
                <select className={`admin-select ${errors.category_id ? 'error' : ''}`}
                  name="category_id" value={form.category_id} onChange={handleChange}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <span className="admin-form-error">{errors.category_id}</span>}
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Brand</label>
                <input className="admin-input" name="brand" value={form.brand}
                  onChange={handleChange} placeholder="Moniluck" />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Thumbnail URL</label>
                <input className="admin-input" name="thumbnail" value={form.thumbnail}
                  onChange={handleChange} placeholder="/images/products/..." />
              </div>
            </div>

            <div className="admin-card" style={{ marginTop: 24 }}>
              <h3 className="admin-card-title">Visibility</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Active (visible on store)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Featured product</span>
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="admin-btn admin-btn-primary"
              disabled={loading} style={{ width: '100%', marginTop: 24, padding: 14 }}>
              {loading ? <><div className="admin-spinner admin-spinner-sm" style={{ borderTopColor: '#fff' }} /> Saving...</>
                : <><span className="material-icons-round">save</span> {isEdit ? 'Update Product' : 'Create Product'}</>}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;