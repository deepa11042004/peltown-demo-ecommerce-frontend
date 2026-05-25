"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: { id: string | number; name: string; price: string | number; image: string }) => void;
  removeFromWishlist: (id: string | number) => void;
  toggleWishlist: (item: { id: string | number; name: string; price: string | number; image: string }) => void;
  isInWishlist: (id: string | number) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("everace_wishlist");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load wishlist", e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("everace_wishlist", JSON.stringify(wishlist));
      } catch (e) {
        console.error("Failed to save wishlist", e);
      }
    }
  }, [wishlist, isInitialized]);

  const addToWishlist = (item: { id: string | number; name: string; price: string | number; image: string }) => {
    const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    if (!wishlist.some((w) => w.id === item.id)) {
      setWishlist((prev) => [...prev, { id: item.id, name: item.name, price: itemPrice, image: item.image }]);
      toast.success(`${item.name} added to wishlist! ❤️`, { id: `wish-${item.id}` });
    }
  };

  const removeFromWishlist = (id: string | number) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
    toast.success("Removed from wishlist", { icon: "💔" });
  };

  const toggleWishlist = (item: { id: string | number; name: string; price: string | number; image: string }) => {
    if (wishlist.some((w) => w.id === item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const isInWishlist = (id: string | number) => wishlist.some((w) => w.id === id);

  const clearWishlist = () => {
    setWishlist([]);
    toast.success("Wishlist cleared", { icon: "🧹" });
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
