'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { addToast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user._id) {
      const savedWishlist = localStorage.getItem(`grizzle_wishlist_${user._id}`);
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed)) {
            setWishlistItems(parsed.filter((item) => item && (item._id || item.slug || item.name)));
          }
        } catch (e) {
          console.error('Failed to parse wishlist JSON', e);
        }
      }
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem(`grizzle_wishlist_${user._id}`, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const getItemId = (productOrId) => {
    if (!productOrId) return null;
    if (typeof productOrId === 'object') {
      return productOrId._id || productOrId.slug || productOrId.name || null;
    }
    return String(productOrId);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      if (addToast) addToast('Please sign in to add items to your Wishlist!', 'info');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      if (!product) return;
      const id = getItemId(product);
      if (!id) return;

      const exists = wishlistItems.some((item) => getItemId(item) === id);
      if (exists) {
        setWishlistItems((prev) => prev.filter((item) => getItemId(item) !== id));
        if (addToast) addToast(`Removed "${product.name || 'Item'}" from Wishlist`, 'info');
      } else {
        const itemToSave = typeof product === 'object' ? { ...product, _id: id } : { _id: id, name: 'Item' };
        setWishlistItems((prev) => [...prev, itemToSave]);
        if (addToast) addToast(`Saved "${product.name || 'Item'}" to Wishlist!`, 'success');
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const isInWishlist = (productOrId) => {
    try {
      if (!productOrId) return false;
      const targetId = getItemId(productOrId);
      if (!targetId) return false;
      return wishlistItems.some((item) => getItemId(item) === targetId);
    } catch (err) {
      return false;
    }
  };

  const removeFromWishlist = (productOrId) => {
    try {
      if (!productOrId) return;
      const targetId = getItemId(productOrId);
      if (!targetId) return;
      setWishlistItems((prev) => prev.filter((item) => getItemId(item) !== targetId));
    } catch (err) {
      console.error('Remove from wishlist error:', err);
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
