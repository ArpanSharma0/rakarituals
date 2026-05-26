"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { getWishlist as getWishlistAPI, addToWishlist as addToWishlistAPI, removeFromWishlist as removeFromWishlistAPI } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/utils/auth";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshWishlist = async () => {
    if (!getToken()) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getWishlistAPI();
      if (Array.isArray(data)) {
        setWishlistItems(data);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error.message);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    try {
      const data = await addToWishlistAPI(productId);
      if (Array.isArray(data)) {
        setWishlistItems(data);
      } else {
        await refreshWishlist();
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const data = await removeFromWishlistAPI(productId);
      if (Array.isArray(data)) {
        setWishlistItems(data);
      } else {
        await refreshWishlist();
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error.message);
    }
  };

  const toggleWishlist = async (productId) => {
    const isInWishlist = wishlistItems.some((item) => (item._id || item.id) === productId);
    if (isInWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const value = useMemo(() => ({
    wishlistItems,
    loading,
    refreshWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist
  }), [wishlistItems, loading]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

WishlistProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
