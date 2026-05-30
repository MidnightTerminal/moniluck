import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAdminProducts, deleteProduct, toggleProductStatus, getAdminCategories } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(0);

  const [filters, setFilters] = useState({ page: 1, search: '', category: '', status: '', sort: 'created_at', order: 'DESC' });
  const [deleteModal, setDeleteModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getAdminProducts(filters),
        getAdminCategories(),
      ]);
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
        setTotal(prodRes.data.total);
        setPages(prodRes.data.pages);
      }
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const { data } = await deleteProduct(deleteModal.id);
      if (data.success) { toast.success(data.message); load(); }
    } catch (err) { toast.error('Failed to delete product.'); }
    setDeleteModal(null);
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleProductStatus(id);
      if (data.success) { toast.success(data.message); load(); }
    } catch (err) { toast.error('Failed to toggle status.'); }
  };

  const handleSearch = (val) => setFilters(p => ({ ...p, search: val, page: 1 }));
  const handleFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products ({total})</h1>
        <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
          <span className="material-icons-round">add</span> Add Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <span className="material-icons-round admin-search-icon">search</span>
          <input placeholder="Search products..." value={filters.search}
            onChange={e => handleSearch(e.target.value)} />
        </div>
        <select className="admin-filter-select" value={filters.category}
          onChange={e => handleFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select className="admin-filter-select" value={filters.status}
          onChange={e => handleFilter('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low_stock">Low Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7"><div className="admin-loading-page" style={{ minHeight: 200 }}><div className="admin-spinner" /></div></td></tr>
              ) : products.length > 0 ? (
                products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="product-thumb">
                          <span className="material-icons-round">shopping_bag</span>
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</p>
                          {p.brand && <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>{p.brand}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--admin-text-light)', fontFamily: 'monospace' }}>{p.sku}</td>
                    <td>{p.category_name || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>Tk {parseFloat(p.price).toFixed(2)}</span>
                      {p.compare_price && <span style={{ textDecoration: 'line-through', color: 'var(--admin-text-light)', fontSize: '0.78rem', marginLeft: 6 }}>Tk {parseFloat(p.compare_price).toFixed(2)}</span>}
                    </td>
                    <td>
                      <span className={`admin-badge ${p.stock <= 0 ? 'admin-badge-error' : p.stock <= 10 ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`admin-toggle ${p.is_active ? 'active' : ''}`}
                        onClick={() => handleToggle(p.id)}
                        title={p.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <div className="admin-toggle__slider" />
                      </button>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="admin-btn admin-btn-ghost admin-btn-icon"
                          onClick={() => navigate(`/admin/products/edit/${p.id}`)} title="Edit">
                          <span className="material-icons-round" style={{ fontSize: '1rem' }}>edit</span>
                        </button>
                        <button className="admin-btn admin-btn-ghost admin-btn-icon"
                          onClick={() => setDeleteModal(p)} title="Delete"
                          style={{ color: 'var(--admin-error)' }}>
                          <span className="material-icons-round" style={{ fontSize: '1rem' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7"><div className="admin-empty"><span className="material-icons-round">inventory_2</span><h3>No products found</h3></div></td></tr>
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
          {[...Array(pages)].map((_, i) => (
            <button key={i + 1}
              className={`admin-pagination-btn ${filters.page === i + 1 ? 'active' : ''}`}
              onClick={() => setFilters(p => ({ ...p, page: i + 1 }))}>
              {i + 1}
            </button>
          ))}
          <button className="admin-pagination-btn" disabled={filters.page >= pages}
            onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--admin-error)', marginBottom: 12, display: 'block' }}>warning</span>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Delete Product?</h2>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 24 }}>
                Are you sure you want to delete <strong>"{deleteModal.name}"</strong>? This action cannot be undone.
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

export default Products;