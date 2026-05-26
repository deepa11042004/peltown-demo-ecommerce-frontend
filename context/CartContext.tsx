"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cartApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ContextCartItem,
  mapCartItem,
  normalizeSelectionId,
  normalizeSelectionInput,
  UiSelectionInput,
} from "@/lib/shopping";

export type CartItem = ContextCartItem;

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: UiSelectionInput) => Promise<void>;
  removeFromCart: (id: string | number) => Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  const applyCartResponse = (payload: unknown) => {
    const cartData = (payload as { cart?: { items?: unknown[] } } | undefined)?.cart;
    const items = Array.isArray(cartData?.items) ? cartData.items : [];

    setCart(items.map((item) => mapCartItem(item as Parameters<typeof mapCartItem>[0])));
  };

  const refreshCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.get();
      applyCartResponse(response.data?.data);
    } catch (error) {
      console.error("Failed to load cart", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCart();
  }, [isAuthenticated, user?.id]);

  const addToCart = async (item: UiSelectionInput) => {
    try {
      const selection = normalizeSelectionInput(item);
      const existingItem = cart.find(
        (cartItem) => cartItem.id === normalizeSelectionId(item.id, item.variantId ?? null),
      );
      const response = await cartApi.addItem({
        productId: selection.productId,
        variantId: selection.variantId,
        quantity: selection.quantity,
      });

      applyCartResponse(response.data?.data);

      if (existingItem) {
        toast.success(`Increased ${selection.name} quantity!`, {
          icon: "🛒",
          id: `toast-${selection.productId}`,
        });
      } else {
        toast.success(`${selection.name} added to cart!`, {
          icon: "🛒",
          id: `toast-${selection.productId}`,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to add item to cart");
    }
  };

  const removeFromCart = async (id: string | number) => {
    const normalizedId = normalizeSelectionId(id);
    const existingItem = cart.find((cartItem) => cartItem.id === normalizedId);

    if (!existingItem) {
      return;
    }

    try {
      const response = await cartApi.removeItem(existingItem.cartItemId);
      applyCartResponse(response.data?.data);
      toast.success("Item removed from cart", { icon: "🗑️" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to remove item");
    }
  };

  const updateQuantity = async (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    const normalizedId = normalizeSelectionId(id);
    const existingItem = cart.find((cartItem) => cartItem.id === normalizedId);

    if (!existingItem) {
      return;
    }

    try {
      const response = await cartApi.updateItem(existingItem.cartItemId, { quantity });
      applyCartResponse(response.data?.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to update quantity");
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartApi.clear();
      applyCartResponse(response.data?.data);
      toast.success("Cart cleared", { icon: "🧹" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to clear cart");
    }
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
        refreshCart,
        cartTotal,
        itemCount,
        loading,
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
