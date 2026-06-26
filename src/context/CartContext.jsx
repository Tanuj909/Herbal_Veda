"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("veda_cart");
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          // Sanitize loaded items to ensure numbers for price/quantity
          const sanitized = parsed.map((item) => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
          }));
          setCart(sanitized);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from local storage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("veda_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to local storage:", error);
    }
  }, [cart, isInitialized]);

  const addToCart = (product, quantity = 1) => {
    const qtyToAdd = Number(quantity) || 1;
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product_id === product.id.toString() || item.id === product.id
      );

      if (existingItemIndex > -1) {
        // Increment quantity safely by copying the object first to avoid mutations
        const newCart = [...prevCart];
        const currentItem = newCart[existingItemIndex];
        const currentQty = Number(currentItem.quantity) || 0;
        newCart[existingItemIndex] = {
          ...currentItem,
          quantity: currentQty + qtyToAdd,
        };
        return newCart;
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            product_id: product.id.toString(),
            name: product.name,
            price: parseFloat(product.price) || 0,
            thumbnailUrl: product.thumbnail_url || product.thumbnailUrl || "",
            quantity: qtyToAdd,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId.toString()));
  };

  const updateQuantity = (productId, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId.toString() ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
