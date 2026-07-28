'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    getSubtotal,
    getDiscountAmount,
    getTotalPrice,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const totalPrice = getTotalPrice();

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (couponInput) {
      setSubmittingCoupon(true);
      await applyCoupon(couponInput);
      setSubmittingCoupon(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart-container text-center">
        <div className="empty-cart-card glass-panel">
          <ShoppingBag size={64} className="empty-icon text-muted" />
          <h2>Your Shopping Bag is Empty</h2>
          <p>Explore our self-made printed t-shirts, anime graphics & oversized tees.</p>
          <Link href="/products" className="btn btn-primary btn-lg mt-3">
            Start Shopping Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page-wrapper">
      <h1 className="cart-title">Your Shopping Bag ({cartItems.length} items)</h1>

      {/* Free Shipping Progress Bar */}
      <div className="shipping-progress-card glass-panel">
        <div className="progress-header">
          <Truck size={20} className="text-primary" />
          {subtotal >= freeShippingThreshold ? (
            <span className="text-success font-bold">🎉 Congratulations! You unlocked Free Pan-India Express Shipping!</span>
          ) : (
            <span>Add <strong>₹{(freeShippingThreshold - subtotal).toFixed(0)}</strong> more to get FREE Pan-India Shipping</span>
          )}
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="cart-layout">
        {/* Items List */}
        <div className="cart-items-list">
          {cartItems.map((item, index) => (
            <div key={`${item.product._id}-${item.size}-${item.color}-${index}`} className="cart-item-card glass-panel">
              <img src={item.product.images?.[0]} alt={item.product.name} className="item-img" />

              <div className="item-info">
                <Link href={`/product/${item.product._id}`} className="item-name">
                  {item.product.name}
                </Link>
                <div className="item-variants">
                  <span className="badge badge-secondary">Size: {item.size}</span>
                  <span className="badge badge-secondary">Color: {item.color}</span>
                </div>
                <span className="item-unit-price">₹{item.product.price?.toFixed(0)} each</span>
              </div>

              {/* Quantity Controls */}
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity + 1)}>+</button>
              </div>

              {/* Line Total & Remove */}
              <div className="item-actions">
                <span className="item-line-total">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                <button
                  onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                  className="remove-btn"
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className="cart-list-footer">
            <button onClick={clearCart} className="btn btn-secondary btn-sm">Clear Shopping Bag</button>
            <Link href="/products" className="continue-shopping">&larr; Continue Shopping</Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary-sidebar glass-panel">
          <h3>Order Summary</h3>

          {/* Coupon Input */}
          <form onSubmit={handleCouponSubmit} className="coupon-form">
            <div className="form-group">
              <label className="form-label">Promo / Coupon Code</label>
              <div className="coupon-input-box">
                <Tag size={16} className="tag-icon" />
                <input
                  type="text"
                  placeholder="Try SAVE10 or WELCOME20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="form-input"
                />
                <button type="submit" disabled={submittingCoupon} className="btn btn-primary btn-sm">
                  Apply
                </button>
              </div>
            </div>
          </form>

          {appliedCoupon && (
            <div className="applied-coupon-tag">
              <span>Applied: <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountValue}{appliedCoupon.discountType === 'percentage' ? '%' : '₹'})</span>
              <button onClick={removeCoupon} className="remove-coupon-btn">Remove</button>
            </div>
          )}

          <div className="summary-breakdown">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            {discount > 0 && (
              <div className="summary-row text-success">
                <span>Discount</span>
                <span>-₹{discount.toFixed(0)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : `₹${shipping.toFixed(0)}`}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span>Total Price</span>
              <span>₹{totalPrice.toFixed(0)}</span>
            </div>
          </div>

          <Link href="/checkout" className="btn btn-primary btn-lg checkout-btn">
            Proceed to Checkout <ArrowRight size={18} />
          </Link>

          <div className="checkout-guarantee">
            <ShieldCheck size={16} /> 256-Bit SSL Encrypted Checkout
          </div>
        </div>
      </div>

      <style jsx>{`
        .cart-page-wrapper {
          padding-top: 2rem;
        }
        .cart-title {
          font-size: 2.2rem;
          margin-bottom: 1.5rem;
        }

        .shipping-progress-card {
          padding: 1.25rem;
          margin-bottom: 2rem;
        }
        .progress-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .progress-bar-track {
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--accent-gradient);
          transition: width 0.4s ease;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 2rem;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .cart-item-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
        }
        .item-img {
          width: 80px;
          height: 90px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }
        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .item-name {
          font-size: 1rem;
          font-weight: 700;
        }
        .item-variants { display: flex; gap: 0.5rem; }
        .item-unit-price { font-size: 0.85rem; color: var(--text-muted); }

        .quantity-control {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .quantity-control button {
          width: 32px;
          height: 36px;
          background: var(--bg-tertiary);
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .quantity-control span {
          width: 36px;
          text-align: center;
          font-weight: 700;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .item-line-total {
          font-size: 1.15rem;
          font-weight: 800;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .remove-btn:hover { color: var(--danger); }

        .cart-list-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
        }
        .continue-shopping {
          font-size: 0.9rem;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .order-summary-sidebar {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: fit-content;
        }
        .coupon-input-box {
          position: relative;
          display: flex;
          gap: 0.5rem;
        }
        .tag-icon {
          position: absolute;
          left: 10px;
          top: 12px;
          color: var(--text-muted);
        }
        .coupon-input-box input {
          padding-left: 2rem;
        }

        .applied-coupon-tag {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: var(--success-light);
          color: var(--success);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
        }
        .remove-coupon-btn {
          background: none;
          border: none;
          color: var(--danger);
          font-weight: 700;
          cursor: pointer;
        }

        .summary-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        .summary-divider {
          height: 1px;
          background: var(--border-color);
        }
        .total-row {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .checkout-btn { width: 100%; margin-top: 0.5rem; }
        .checkout-guarantee {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .empty-cart-container { padding: 4rem 1.5rem; }
        .empty-cart-card { padding: 4rem 2rem; }

        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
