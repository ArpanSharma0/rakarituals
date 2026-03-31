"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { getCart, addToCart as addToCartAPI, removeFromCart as removeFromCartAPI } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    if (!getToken()) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getCart();
      // Backend returns 'items', but keep 'products' as fallback
      if (data && Array.isArray(data.items)) {
        setCartItems(data.items);
      } else if (data && Array.isArray(data.products)) {
        setCartItems(data.products);
      } else if (Array.isArray(data)) {
        setCartItems(data);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId) => {
    await addToCartAPI(productId);
    await refreshCart();
  };

  const removeFromCart = async (productId) => {
    await removeFromCartAPI(productId);
    await refreshCart();
  };

  const value = useMemo(() => ({
    cartItems,
    loading,
    refreshCart,
    addToCart,
    removeFromCart
  }), [cartItems, loading]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
