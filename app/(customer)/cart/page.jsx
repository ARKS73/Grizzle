'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getProductVariantStock } from '@/utils/stockHelper';

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
  const [shippingFee, setShippingFee] = useState(49);
  const [freeShippingMode, setFreeShippingMode] = useState(false);

  useEffect(() => {
    async function fetchShipping() {
      try {
        const res = await fetch('/api/shipping');
        const data = await res.json();
        if (data.success) {
          setShippingFee(data.defaultShippingFee !== undefined ? data.defaultShippingFee : 49);
          setFreeShippingMode(Boolean(data.freeShippingMode));
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchShipping();
  }, []);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = (subtotal === 0 || freeShippingMode) ? 0 : shippingFee;
  const totalPrice = Math.max(0, subtotal - discount + shipping);

  // Calculate total savings from Original Price (MRP) vs Current Selling Price
  const totalSavings = cartItems.reduce((acc, item) => {
    const orig = item.product?.originalPrice || item.product?.price || 0;
    const curr = item.product?.price || 0;
    if (orig > curr) {
      return acc + ((orig - curr) * item.quantity);
    }
    return acc;
  }, 0);

  const combinedSavings = totalSavings + discount;

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
          <ShoppingBag size={64} className="empty-icon text-muted mb-3" />
          <h2>Your Cart is Empty</h2>
          <p>Explore our self-made printed t-shirts, anime graphics & oversized tees.</p>
          <Link href="/products" className="btn btn-primary btn-lg mt-3">
            Start Shopping Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="container cart-page-wrapper">
      {/* Header Banner with Total Savings */}
      <div className="cart-header-banner">
        <h1 className="cart-title">
          Your Cart <span className="item-count-badge">({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
        </h1>

        {totalSavings > 0 && (
          <div className="savings-badge">
            <Sparkles size={16} /> Total Savings: <strong>₹{totalSavings.toFixed(0)}</strong>
          </div>
        )}
      </div>

      <div className="cart-layout">
        {/* Items List */}
        <div className="cart-items-list">
          {cartItems.map((item, index) => {
            const maxStock = getProductVariantStock(item.product, item.size, item.color);
            const isMax = item.quantity >= maxStock;
            const origPrice = item.product.originalPrice || item.product.price;
            const hasDiscount = origPrice > item.product.price;

            return (
              <div key={`${item.product._id}-${item.size}-${item.color}-${index}`} className="cart-item-card glass-panel">
                <img src={item.product.images?.[0]} alt={item.product.name} className="item-img" />

                <div className="item-info">
                  <Link href={`/product/${item.product._id}`} className="item-name">
                    {item.product.name}
                  </Link>
                  <div className="item-variants">
                    <span className="badge badge-secondary">SIZE: {item.size}</span>
                    {item.color && <span className="badge badge-secondary">COLOR: {item.color}</span>}
                  </div>
                  <div className="item-price-line">
                    <span className="item-unit-price">₹{item.product.price?.toFixed(0)}</span>
                    {hasDiscount && (
                      <span className="item-orig-price">₹{origPrice.toFixed(0)}</span>
                    )}
                  </div>
                </div>

                <div className="item-controls-row">
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => {
                        if (!isMax) {
                          updateQuantity(item.product._id, item.size, item.color, item.quantity + 1);
                        }
                      }}
                      disabled={isMax}
                      title={isMax ? `Only ${maxStock} available in stock` : ''}
                    >
                      +
                    </button>
                  </div>

                  <span className="item-line-total">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                </div>

                <button
                  onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                  className="remove-btn"
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          <div className="cart-list-footer">
            <button onClick={clearCart} className="btn btn-secondary btn-sm">Clear Cart</button>
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
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="form-input"
                  placeholder="Enter code"
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

            {combinedSavings > 0 && (
              <div className="summary-row text-success font-bold">
                <span>🎉 Total Savings</span>
                <span>-₹{combinedSavings.toFixed(0)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
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
            <ShieldCheck size={16} className="text-success" /> <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cart-page-wrapper {
          padding-top: 2rem;
          padding-bottom: 4rem;
          width: 100%;
          box-sizing: border-box;
        }

        .cart-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .cart-title {
          font-size: clamp(1.4rem, 4vw, 2.2rem);
          font-weight: 900;
          margin: 0;
          color: var(--text-primary);
        }
        .item-count-badge {
          font-size: 1.2rem;
          color: var(--accent-primary);
          font-weight: 700;
        }

        .savings-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.5rem 0.9rem;
          border-radius: var(--radius-full, 99px);
          font-size: 0.88rem;
          font-weight: 700;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 2rem;
          width: 100%;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .cart-item-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          width: 100%;
          box-sizing: border-box;
          position: relative;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
        }

        .item-img {
          width: 80px;
          height: 95px;
          object-fit: cover;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }
        .item-name {
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-primary);
          text-decoration: none;
        }
        .item-name:hover {
          color: var(--accent-primary);
        }

        .item-variants {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .item-price-line {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .item-unit-price {
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .item-orig-price {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .item-controls-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-tertiary);
        }
        .quantity-control button {
          width: 32px;
          height: 36px;
          background: transparent;
          border: none;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          color: var(--text-primary);
        }
        .quantity-control span {
          width: 34px;
          text-align: center;
          font-weight: 800;
          color: var(--text-primary);
        }

        .item-line-total {
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          color: var(--danger);
        }

        .cart-list-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          gap: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .continue-shopping {
          font-size: 0.9rem;
          color: var(--accent-primary);
          font-weight: 700;
          white-space: nowrap;
          text-decoration: none;
        }

        .order-summary-sidebar {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: fit-content;
          width: 100%;
          box-sizing: border-box;
          border-radius: var(--radius-lg);
        }

        .coupon-input-box {
          position: relative;
          display: flex;
          gap: 0.5rem;
          width: 100%;
        }
        .tag-icon {
          position: absolute;
          left: 10px;
          top: 12px;
          color: var(--text-muted);
        }
        .coupon-input-box input {
          padding-left: 2.2rem;
          flex: 1;
          min-width: 0;
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
          font-weight: 900;
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

        .empty-cart-container { padding: 4rem 1rem; }
        .empty-cart-card { padding: 3rem 1.5rem; }

        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr; }
        }

        /* Responsive Mobile Layout Fixes - Zero Edge Clipping */
        @media (max-width: 640px) {
          .cart-page-wrapper {
            padding-top: 1rem;
            padding-bottom: 2.5rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            overflow-x: hidden;
          }

          .cart-header-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .cart-item-card {
            display: grid;
            grid-template-columns: 75px 1fr;
            grid-template-rows: auto auto;
            gap: 0.5rem 0.85rem;
            padding: 0.85rem;
            position: relative;
            border-radius: 14px;
            width: 100%;
            box-sizing: border-box;
          }

          .item-img {
            width: 75px;
            height: 90px;
            grid-row: 1 / 3;
            border-radius: 10px;
          }

          .item-info {
            grid-column: 2;
            padding-right: 32px;
          }

          .item-name {
            font-size: 0.92rem;
            white-space: normal;
            line-height: 1.25;
          }

          .item-controls-row {
            grid-column: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            width: 100%;
            margin-top: 0.2rem;
          }

          .remove-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 6px;
            background: rgba(239, 68, 68, 0.08);
            color: #ef4444;
          }

          .cart-list-footer {
            flex-direction: column-reverse;
            align-items: center;
            gap: 0.85rem;
            text-align: center;
          }
          .cart-list-footer button,
          .continue-shopping {
            width: 100%;
            text-align: center;
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
