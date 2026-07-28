'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, getSubtotal, getDiscountAmount, getTotalPrice, clearCart, appliedCoupon } = useCart();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm)');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        street: prev.street || user.address?.street || '',
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || '',
        postalCode: prev.postalCode || user.address?.postalCode || '',
      }));
    }
  }, [user]);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = subtotal >= 999 ? 0 : 99;
  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="container text-center py-5">
        <h2>Your Shopping Bag is Empty</h2>
        <p className="mt-2 text-muted">Add products to your cart before proceeding to checkout.</p>
        <Link href="/products" className="btn btn-primary mt-3">Browse Products</Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.street || !formData.city) {
      addToast('Please complete all required shipping fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || '',
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems,
          shippingAddress: formData,
          paymentMethod,
          itemsPrice: subtotal,
          shippingPrice: shipping,
          discountAmount: discount,
          totalPrice,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        addToast('Order placed successfully! Redirecting to confirmation...', 'success');
        clearCart();
        router.push(`/orders/${data.order._id}`);
      } else {
        addToast(data.message || 'Failed to place order', 'error');
      }
    } catch (err) {
      addToast('An error occurred while placing order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container checkout-page-wrapper">
      <h1 className="checkout-title"><Lock size={24} /> Secure Checkout</h1>

      <div className="checkout-grid">
        {/* Left Form Column */}
        <div className="checkout-form-column">
          {/* Shipping Address */}
          <form onSubmit={handlePlaceOrder} className="checkout-form glass-panel">
            <h3>1. Delivery & Shipping Address</h3>

            <div className="form-grid">
              <div className="form-group span-2">
                <label className="form-label">Full Receiver Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Jane Doe"
                  className="form-input"
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. +1 (555) 019-2834"
                  className="form-input"
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 742 Evergreen Terrace Apt 4B"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="New York"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Province *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="NY"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / Zip Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="10001"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="payment-section mt-4">
              <h3>2. Payment Method (India)</h3>
              <div className="payment-options">
                {['UPI (GPay / PhonePe / Paytm)', 'Cash on Delivery (COD)', 'Debit / Credit Card (INR)', 'Net Banking (All Indian Banks)'].map((method) => (
                  <label key={method} className={`payment-card ${paymentMethod === method ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <div className="payment-method-info">
                      <span className="method-name">{method}</span>
                      <span className="method-desc">Instant verification & Pan-India confirmation</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg place-order-btn mt-4">
              {submitting ? 'Processing Order...' : `Place Order (₹${totalPrice.toFixed(0)})`} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right Summary Column */}
        <div className="checkout-summary-column">
          <div className="summary-card glass-panel">
            <h3>Order Review ({cartItems.length} items)</h3>

            <div className="items-mini-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="item-mini-row">
                  <img src={item.product.images?.[0]} alt={item.product.name} className="mini-img" />
                  <div className="mini-info">
                    <span className="mini-name">{item.product.name}</span>
                    <span className="mini-specs">Qty: {item.quantity} | Size: {item.size} | {item.color}</span>
                  </div>
                  <span className="mini-price">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="summary-breakdown mt-3">
              <div className="row"><span>Items Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              {discount > 0 && <div className="row text-success"><span>Promo Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
              <div className="row"><span>Shipping Fee</span><span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(0)}`}</span></div>
              <div className="divider" />
              <div className="row total-row"><span>Total Due</span><span>₹{totalPrice.toFixed(0)}</span></div>
            </div>

            <div className="security-note">
              <ShieldCheck size={16} color="#10b981" />
              <span>100% Bio-Washed Indian Cotton. Instant GST Invoice Generated.</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-page-wrapper {
          padding-top: 2rem;
        }
        .checkout-title {
          font-size: 2.2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }

        .checkout-form {
          padding: 2rem;
          border-radius: var(--radius-lg);
        }
        .checkout-form h3 {
          font-size: 1.2rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .span-2 { grid-column: span 2; }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .payment-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
        }
        .payment-card.selected {
          border-color: var(--accent-primary);
          background: var(--accent-light);
        }
        .method-name { font-weight: 700; display: block; font-size: 0.95rem; }
        .method-desc { font-size: 0.75rem; color: var(--text-muted); }

        .place-order-btn { width: 100%; }

        .summary-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          position: sticky;
          top: 90px;
        }
        .items-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 280px;
          overflow-y: auto;
          margin-top: 1rem;
        }
        .item-mini-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .mini-img {
          width: 48px;
          height: 54px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
        .mini-info { flex: 1; }
        .mini-name { font-size: 0.85rem; font-weight: 700; display: block; }
        .mini-specs { font-size: 0.75rem; color: var(--text-muted); }
        .mini-price { font-size: 0.9rem; font-weight: 700; }

        .summary-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .row { display: flex; justify-content: space-between; }
        .divider { height: 1px; background: var(--border-color); margin: 0.5rem 0; }
        .total-row { font-size: 1.2rem; font-weight: 800; }

        .security-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 1rem;
        }

        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
