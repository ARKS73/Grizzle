'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user._id) {
      const savedCart = localStorage.getItem(`grizzle_cart_${user._id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart JSON', e);
        }
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem(`grizzle_cart_${user._id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = (product, size = 'M', color = 'Pitch Black', quantity = 1) => {
    if (!user) {
      if (addToast) addToast('Please sign in to add items to your shopping bag!', 'info');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, size, color, quantity }];
      }
    });

    addToast(`Added "${product.name}" (${size}) to your cart`, 'success');
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product._id === productId && item.size === size && item.color === color)
      )
    );
    addToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, size, color, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId && item.size === size && item.color === color) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const applyCoupon = async (code) => {
    const uppercaseCode = code.trim().toUpperCase();
    try {
      const res = await fetch(`/api/coupons?code=${uppercaseCode}`);
      const data = await res.json();

      if (data.success && data.coupon) {
        const subtotal = getSubtotal();
        if (subtotal < data.coupon.minPurchase) {
          addToast(`Minimum purchase of ₹${data.coupon.minPurchase} required for this coupon`, 'error');
          return false;
        }
        setAppliedCoupon(data.coupon);
        addToast(`Coupon "${data.coupon.code}" applied successfully!`, 'success');
        return true;
      } else {
        addToast(data.message || 'Invalid or expired coupon code', 'error');
        return false;
      }
    } catch (err) {
      // Fallback for offline/demo coupon testing
      if (uppercaseCode === 'GRIZZLE100') {
        const coupon = { code: 'GRIZZLE100', discountType: 'fixed', discountValue: 100, minPurchase: 799 };
        setAppliedCoupon(coupon);
        addToast('Coupon "GRIZZLE100" applied (₹100 OFF)!', 'success');
        return true;
      } else if (uppercaseCode === 'WELCOME20') {
        const coupon = { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minPurchase: 999 };
        setAppliedCoupon(coupon);
        addToast('Coupon "WELCOME20" applied (20% OFF)!', 'success');
        return true;
      } else if (uppercaseCode === 'DESI50') {
        const coupon = { code: 'DESI50', discountType: 'fixed', discountValue: 50, minPurchase: 499 };
        setAppliedCoupon(coupon);
        addToast('Coupon "DESI50" applied (₹50 OFF)!', 'success');
        return true;
      } else {
        addToast('Invalid coupon code. Try WELCOME20, GRIZZLE100, or DESI50', 'error');
        return false;
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon code removed', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (subtotal * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  };

  const getTotalPrice = (customShippingFee) => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const shipping = customShippingFee !== undefined ? customShippingFee : (subtotal === 0 ? 0 : 49);
    return Math.max(0, subtotal - discount + shipping);
  };

  const getTotalCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        appliedCoupon,
        getSubtotal,
        getDiscountAmount,
        getTotalPrice,
        getTotalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
