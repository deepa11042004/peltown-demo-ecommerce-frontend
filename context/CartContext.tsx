"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { id: string | number; name: string; price: string | number; image: string }) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("everace_cart");
      if (storedCart) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage on cart change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("everace_cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Failed to save cart to localStorage", error);
      }
    }
  }, [cart, isInitialized]);

  const addToCart = (item: { id: string | number; name: string; price: string | number; image: string }) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      toast.success(`Increased ${item.name} quantity!`, { icon: "🛒", id: `toast-${item.id}` });
    } else {
      toast.success(`${item.name} added to cart!`, { icon: "🛒", id: `toast-${item.id}` });
    }

    setCart((prevCart) => {
      const isExisting = prevCart.find((cartItem) => cartItem.id === item.id);
      const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price;
      
      if (isExisting) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { id: item.id, name: item.name, price: itemPrice, image: item.image, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== id));
    toast.success("Item removed from cart", { icon: "🗑️" });
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared", { icon: "🧹" });
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
