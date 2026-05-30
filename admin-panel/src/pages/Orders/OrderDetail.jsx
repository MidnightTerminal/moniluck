import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAdminOrder, updateOrderStatus } from '../../utils/adminApi';
import toast from 'react-hot-toast';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getAdminOrder(id);
        if (data.success) setOrder(data.order);
      } catch { toast.error('Order not found.'); navigate('/admin/orders'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const handleStatusChange = async (field, value) => {
    setSaving(true);
    try {
      const payload = {};
      payload[field] = value;
      const { data } = await updateOrderStatus(id, payload);
      if (data.success) { setOrder(data.order); toast.success('Order updated.'); }
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="admin-loading-page"><div className="admin-spinner" /></div>;
  if (!order) return null;

  const statusColors = {
    pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#06b6d4', delivered: '#10b981', cancelled: '#ef4444', refunded: '#64748b',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-page-header">
        <div>
          <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/orders')} style={{ marginBottom: 8 }}>
            <span className="material-icons-round">arrow_back</span> Back to Orders
          </button>
          <h1 className="admin-page-title">Order {order.order_number}</h1>
        </div>
      </div>

      <div className="order-detail-grid">
        {/* Left */}
        <div>
          {/* Status Controls */}
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <h3 className="admin-card-title">Update Status</h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Order Status</label>
                <select className="admin-select" value={order.status} disabled={saving}
                  onChange={e => handleStatusChange('status', e.target.value)}>
                  {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Payment Status</label>
                <select className="admin-select" value={order.payment_status} disabled={saving}
                  onChange={e => handleStatusChange('payment_status', e.target.value)}>
                  {['pending','paid','failed','refunded'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="admin-card">
            <h3 className="admin-card-title">Items ({order.items?.length || 0})</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
                <tbody>
                  {(order.items || []).map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                      <td>${parseFloat(item.price).toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 700 }}>${parseFloat(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          {/* Summary */}
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <h3 className="admin-card-title">Summary</h3>
            <div className="order-summary-rows">
              <div className="order-summary-row"><span>Subtotal</span><span>${parseFloat(order.subtotal).toFixed(2)}</span></div>
              <div className="order-summary-row"><span>Shipping</span><span>${parseFloat(order.shipping_cost).toFixed(2)}</span></div>
              {parseFloat(order.discount) > 0 && (
                <div className="order-summary-row" style={{ color: 'var(--admin-success)' }}><span>Discount</span><span>-${parseFloat(order.discount).toFixed(2)}</span></div>
              )}
              <div className="order-summary-row order-summary-total"><span>Total</span><span>${parseFloat(order.total).toFixed(2)}</span></div>
            </div>
            <div style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--admin-text-secondary)' }}>
              Payment: <strong style={{ textTransform: 'capitalize' }}>{order.payment_method}</strong>
            </div>
          </div>

          {/* Shipping */}
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <h3 className="admin-card-title">Shipping Address</h3>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--admin-text-secondary)' }}>
              <p><strong>{order.ship_first_name} {order.ship_last_name}</strong></p>
              <p>{order.ship_address}</p>
              {order.ship_address2 && <p>{order.ship_address2}</p>}
              <p>{order.ship_city}{order.ship_state ? `, ${order.ship_state}` : ''} {order.ship_zip}</p>
              <p>{order.ship_country}</p>
              <p style={{ marginTop: 8 }}>{order.ship_email}</p>
              <p>{order.ship_phone}</p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="admin-card">
              <h3 className="admin-card-title">Order Notes</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--admin-text-secondary)', lineHeight: 1.6 }}>{order.notes}</p>
            </div>
          )}

          {/* Meta */}
          <div className="admin-card" style={{ marginTop: 24 }}>
            <h3 className="admin-card-title">Details</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p>Created: <strong>{new Date(order.created_at).toLocaleString()}</strong></p>
              <p>Updated: <strong>{new Date(order.updated_at).toLocaleString()}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetail;