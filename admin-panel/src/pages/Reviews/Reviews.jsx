import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getAdminReviews, approveReview, deleteReview } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(0);
  const [filters, setFilters]   = useState({ page: 1, status: '' });
  const [deleteModal, setDeleteModal] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingReplyId, setSavingReplyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminReviews(filters);
      if (data.success) {
        setReviews(data.reviews);
        setTotal(data.total);
        setPages(data.pages);
        setReplyDrafts(
          data.reviews.reduce((acc, review) => {
            acc[review.id] = review.admin_reply || '';
            return acc;
          }, {})
        );
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    const reply = (replyDrafts[id] || '').trim();
    setSavingReplyId(id);
    try {
      const { data } = await approveReview(id, { reply });
      if (data.success) { toast.success(data.message); load(); }
    } catch { toast.error('Failed to approve review.'); }
    finally { setSavingReplyId(null); }
  };

  const handleReplyChange = (id, value) => {
    setReplyDrafts(prev => ({ ...prev, [id]: value }));
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const { data } = await deleteReview(deleteModal.id);
      if (data.success) { toast.success(data.message); load(); }
    } catch { toast.error('Failed to delete review.'); }
    setDeleteModal(null);
  };

  const renderStars = (rating) => {
    return (
      <span className="review-stars">
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Reviews ({total})</h1>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <select className="admin-filter-select" value={filters.status}
          onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {loading ? (
          <div className="admin-loading-page"><div className="admin-spinner" /></div>
        ) : reviews.length > 0 ? (
          reviews.map(review => (
            <motion.div
              key={review.id}
              className="review-admin-card"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="review-admin-card__header">
                <div className="review-admin-card__user">
                  <div className="review-admin-avatar">
                    {review.reviewer_name?.charAt(0)}
                  </div>
                  <div>
                    <h4>{review.reviewer_name}</h4>
                    <span className="review-admin-email">{review.reviewer_email}</span>
                  </div>
                </div>
                <div className="review-admin-card__right">
                  {renderStars(review.rating)}
                  <span className={`admin-badge ${review.is_approved ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Product */}
              <div className="review-admin-card__product">
                <span className="material-icons-round" style={{ fontSize: '0.95rem', color: 'var(--admin-text-light)' }}>
                  shopping_bag
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-primary)' }}>
                  {review.product_name}
                </span>
              </div>

              {/* Content */}
              {review.title && (
                <h5 className="review-admin-card__title">{review.title}</h5>
              )}
              {review.body && (
                <p className="review-admin-card__body">{review.body}</p>
              )}

              <div className="review-admin-card__reply">
                <label className="admin-label" style={{ marginBottom: 8, display: 'block' }}>
                  Admin Reply
                </label>
                <textarea
                  className="admin-input review-admin-card__reply-input"
                  rows="4"
                  value={replyDrafts[review.id] || ''}
                  onChange={e => handleReplyChange(review.id, e.target.value)}
                  placeholder="Write a helpful reply for the customer..."
                />
                {review.admin_reply && (
                  <div className="review-admin-card__reply-preview">
                    <span className="review-admin-card__reply-label">Current Reply</span>
                    <p>{review.admin_reply}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="review-admin-card__footer">
                <span className="review-admin-card__date">
                  <span className="material-icons-round" style={{ fontSize: '0.9rem' }}>schedule</span>
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
                <div className="actions">
                  {!review.is_approved && (
                    <button className="admin-btn admin-btn-sm"
                      style={{ background: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}
                      onClick={() => handleApprove(review.id)}
                      disabled={savingReplyId === review.id}>
                      <span className="material-icons-round" style={{ fontSize: '0.9rem' }}>check_circle</span>
                      {savingReplyId === review.id ? 'Saving...' : (review.admin_reply ? 'Update Reply & Approve' : 'Approve & Reply')}
                    </button>
                  )}
                  {review.is_approved && (
                    <button className="admin-btn admin-btn-sm"
                      style={{ background: 'var(--admin-border-light)', color: 'var(--admin-primary)' }}
                      onClick={() => handleApprove(review.id)}
                      disabled={savingReplyId === review.id}>
                      <span className="material-icons-round" style={{ fontSize: '0.9rem' }}>reply</span>
                      {savingReplyId === review.id ? 'Saving...' : 'Save Reply'}
                    </button>
                  )}
                  <button className="admin-btn admin-btn-ghost admin-btn-sm"
                    style={{ color: 'var(--admin-error)' }}
                    onClick={() => setDeleteModal(review)}>
                    <span className="material-icons-round" style={{ fontSize: '0.9rem' }}>delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="admin-card">
            <div className="admin-empty">
              <span className="material-icons-round">rate_review</span>
              <h3>No reviews found</h3>
              <p>Customer reviews will appear here.</p>
            </div>
          </div>
        )}
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

      {/* Delete Modal */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--admin-error)', display: 'block', marginBottom: 12 }}>warning</span>
              <h2 style={{ fontSize: '1.15rem', marginBottom: 8 }}>Delete Review?</h2>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 20, fontSize: '0.88rem' }}>
                Delete review by <strong>{deleteModal.reviewer_name}</strong> on <strong>{deleteModal.product_name}</strong>?
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

export default Reviews;