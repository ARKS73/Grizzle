'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  // Helper to sync cart state to Database for logged-in user
  const syncCartToDatabase = async (items) => {
    if (!user || !user._id) return;
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: items }),
      });
    } catch (e) {
      console.error('Failed to sync cart to database:', e);
    }
  };

  // Load cart on Mount or User Change
  useEffect(() => {
    const loadCart = async () => {
      if (user && user._id) {
        try {
          const res = await fetch('/api/cart');
          const data = await res.json();
          let dbCart = (data.success && Array.isArray(data.cartItems)) ? data.cartItems : [];
          setCartItems(dbCart);
        } catch (err) {
          console.error('Error loading DB cart:', err);
        }
      } else {
        // Guests cannot hold items in cart - require login
        setCartItems([]);
      }
    };

    loadCart();
  }, [user]);

  // Sync to DB whenever cart state is updated
  const updateCartStateAndSync = (newCartItems) => {
    setCartItems(newCartItems);
    if (user && user._id) {
      syncCartToDatabase(newCartItems);
    }
  };

  const getAvailableStock = (product, size) => {
    if (!product) return 0;
    if (size && product.sizeStock && product.sizeStock[size] !== undefined) {
      return Math.max(0, Number(product.sizeStock[size]));
    }
    return Math.max(0, Number(product.stock || 0));
  };

  const addToCart = (product, size, color, quantity = 1) => {
    if (!product || !product._id) return;

    // Strict Rule: Only logged-in users can add items to cart
    if (!user || !user._id) {
      if (addToast) {
        addToast('Please login to add products to your cart', 'info');
      }
      router.push('/login');
      return;
    }

    const resolvedColor = (color && typeof color === 'string' && color.trim())
      ? color.trim()
      : (product.colors?.[0]?.name || 'Standard');

    const resolvedSize = (size && typeof size === 'string' && size.trim())
      ? size.trim()
      : (product.sizes?.[0] || 'M');

    const maxStock = getAvailableStock(product, resolvedSize);
    if (maxStock <= 0) {
      if (addToast) addToast(`Size ${resolvedSize} for "${product.name}" is currently out of stock`, 'error');
      return;
    }

    let capped = false;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => (item.product?._id === product._id || item.product === product._id) && item.size === resolvedSize && item.color === resolvedColor
      );

      let updated = [...prev];
      if (existingIndex > -1) {
        const currentQty = updated[existingIndex].quantity || 0;
        const targetQty = currentQty + quantity;
        if (targetQty > maxStock) {
          capped = true;
          updated[existingIndex].quantity = maxStock;
        } else {
          updated[existingIndex].quantity = targetQty;
        }
      } else {
        const targetQty = Math.min(quantity, maxStock);
        if (quantity > maxStock) capped = true;
        updated.push({ product, size: resolvedSize, color: resolvedColor, quantity: targetQty });
      }

      syncCartToDatabase(updated);
      return updated;
    });

    if (capped && addToast) {
      addToast(`Only ${maxStock} item(s) left in stock for Size ${size}. Quantity updated to ${maxStock}.`, 'info');
    } else if (addToast) {
      addToast(`Added "${product.name}" (${size}) to your cart`, 'success');
    }
  };

  const removeFromCart = (productId, size, color) => {
    const updated = cartItems.filter(
      (item) => !((item.product?._id === productId || item.product === productId) && item.size === size && item.color === color)
    );
    updateCartStateAndSync(updated);
    if (addToast) addToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, size, color, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    const targetItem = cartItems.find(
      (item) => (item.product?._id === productId || item.product === productId) && item.size === size && item.color === color
    );

    const maxStock = getAvailableStock(targetItem?.product, size);
    let finalQty = newQuantity;

    if (maxStock > 0 && newQuantity > maxStock) {
      finalQty = maxStock;
      if (addToast) addToast(`Only ${maxStock} item(s) left in stock for Size ${size}`, 'info');
    }

    const updated = cartItems.map((item) => {
      if ((item.product?._id === productId || item.product === productId) && item.size === size && item.color === color) {
        return { ...item, quantity: finalQty };
      }
      return item;
    });
    updateCartStateAndSync(updated);
  };

  const applyCoupon = async (code) => {
    const uppercaseCode = code.trim().toUpperCase();
    try {
      const res = await fetch(`/api/coupons?code=${uppercaseCode}`);
      const data = await res.json();

      if (data.success && data.coupon) {
        const subtotal = getSubtotal();
        if (subtotal < data.coupon.minPurchase) {
          if (addToast) addToast(`Minimum purchase of ₹${data.coupon.minPurchase} required for this coupon`, 'error');
          return false;
        }
        setAppliedCoupon(data.coupon);
        if (addToast) addToast(`Coupon "${data.coupon.code}" applied successfully!`, 'success');
        return true;
      } else {
        if (addToast) addToast(data.message || 'Invalid or expired coupon code', 'error');
        return false;
      }
    } catch (err) {
      // Fallback for offline/demo coupon testing
      if (uppercaseCode === 'GRIZZLE100') {
        const coupon = { code: 'GRIZZLE100', discountType: 'fixed', discountValue: 100, minPurchase: 799 };
        setAppliedCoupon(coupon);
        if (addToast) addToast('Coupon "GRIZZLE100" applied (₹100 OFF)!', 'success');
        return true;
      } else if (uppercaseCode === 'WELCOME20') {
        const coupon = { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minPurchase: 999 };
        setAppliedCoupon(coupon);
        if (addToast) addToast('Coupon "WELCOME20" applied (20% OFF)!', 'success');
        return true;
      } else if (uppercaseCode === 'DESI50') {
        const coupon = { code: 'DESI50', discountType: 'fixed', discountValue: 50, minPurchase: 499 };
        setAppliedCoupon(coupon);
        if (addToast) addToast('Coupon "DESI50" applied (₹50 OFF)!', 'success');
        return true;
      } else {
        if (addToast) addToast('Invalid coupon code. Try WELCOME20, GRIZZLE100, or DESI50', 'error');
        return false;
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    if (addToast) addToast('Coupon code removed', 'info');
  };

  const clearCart = () => {
    updateCartStateAndSync([]);
    setAppliedCoupon(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
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
