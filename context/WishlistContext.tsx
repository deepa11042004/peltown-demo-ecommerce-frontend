"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ContextWishlistItem,
  mapWishlistItem,
  normalizeSelectionId,
  normalizeSelectionInput,
  UiSelectionInput,
} from "@/lib/shopping";

export type WishlistItem = ContextWishlistItem;

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: UiSelectionInput) => Promise<void>;
  removeFromWishlist: (id: string | number) => Promise<void>;
  toggleWishlist: (item: UiSelectionInput) => Promise<void>;
  isInWishlist: (id: string | number) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  const applyWishlistResponse = (payload: unknown) => {
    const wishlistData = (payload as { wishlist?: { items?: unknown[] } } | undefined)?.wishlist;
    const items = Array.isArray(wishlistData?.items) ? wishlistData.items : [];

    setWishlist(items.map((item) => mapWishlistItem(item as Parameters<typeof mapWishlistItem>[0])));
  };

  const refreshWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.get();
      applyWishlistResponse(response.data?.data);
    } catch (e) {
      console.error("Failed to load wishlist", e);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshWishlist();
  }, [isAuthenticated, user?.id]);

  const addToWishlist = async (item: UiSelectionInput) => {
    try {
      const selection = normalizeSelectionInput(item);
      const response = await wishlistApi.addItem({
        productId: selection.productId,
        variantId: selection.variantId,
      });

      applyWishlistResponse(response.data?.data);
      toast.success(`${selection.name} added to wishlist! ❤️`, { id: `wish-${selection.productId}` });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to update wishlist");
    }
  };

  const removeFromWishlist = async (id: string | number) => {
    const normalizedId = normalizeSelectionId(id);
    const existingItem = wishlist.find((entry) => entry.id === normalizedId);

    if (!existingItem) {
      return;
    }

    try {
      const response = await wishlistApi.removeItem(existingItem.wishlistItemId);
      applyWishlistResponse(response.data?.data);
      toast.success("Removed from wishlist", { icon: "💔" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to remove wishlist item");
    }
  };

  const toggleWishlist = async (item: UiSelectionInput) => {
    const normalizedId = normalizeSelectionId(item.id, item.variantId ?? null);

    if (wishlist.some((w) => w.id === normalizedId)) {
      await removeFromWishlist(normalizedId);
    } else {
      await addToWishlist(item);
    }
  };

  const isInWishlist = (id: string | number) => {
    const normalizedId = normalizeSelectionId(id);
    return wishlist.some((w) => w.id === normalizedId);
  };

  const clearWishlist = async () => {
    try {
      await Promise.all(wishlist.map((item) => wishlistApi.removeItem(item.wishlistItemId)));
      setWishlist([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to clear wishlist");
      return;
    }

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
        refreshWishlist,
        wishlistCount,
        loading,
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
