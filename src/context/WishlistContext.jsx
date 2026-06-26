"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist when user changes/logs in
  const fetchWishlist = async () => {
    if (!token) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        setWishlist(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const addToWishlist = async (productId) => {
    if (!token) {
      return { success: false, error: "Authentication required" };
    }
    try {
      const response = await axios.post(
        "/api/wishlist",
        { product_id: productId.toString() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.success) {
        const newItem = response.data.data;
        setWishlist((prev) => {
          // Prevent duplicate in state
          if (prev.some((item) => item.id.toString() === newItem.id.toString())) {
            return prev;
          }
          return [newItem, ...prev];
        });
        return { success: true, item: newItem };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    if (!token) return { success: false, error: "Authentication required" };
    try {
      const response = await axios.delete(`/api/wishlist/${wishlistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        setWishlist((prev) => prev.filter((item) => item.id.toString() !== wishlistId.toString()));
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) =>
        item.product_id?.toString() === productId.toString() ||
        item.product?.id?.toString() === productId.toString()
    );
  };

  // Helper to toggle by productId directly on UI cards
  const toggleWishlist = async (productId) => {
    if (!token) return { success: false, error: "Authentication required" };

    const existing = wishlist.find(
      (item) =>
        item.product_id?.toString() === productId.toString() ||
        item.product?.id?.toString() === productId.toString()
    );

    if (existing) {
      return removeFromWishlist(existing.id);
    } else {
      return addToWishlist(productId);
    }
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
