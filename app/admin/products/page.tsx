"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { productApi } from "@/lib/api";
import { ApiProduct, mapApiProductToUiProduct, UiProduct } from "@/lib/productMapping";
import { toast } from "react-hot-toast";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const maybeError = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState<string | number | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await productApi.list({
          page: 1,
          limit: 100,
          sort: "createdAt_desc",
        });

        const items = (response.data?.data?.items || []) as ApiProduct[];

        if (!mounted) {
          return;
        }

        setProducts(items.map(mapApiProductToUiProduct));
      } catch (requestError: unknown) {
        if (!mounted) {
          return;
        }

        setError(getErrorMessage(requestError, "Failed to load products"));
        setProducts([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchText, selectedCategory]);

  const handleDeleteProduct = async (product: UiProduct) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${product.name}? This action cannot be undone.`,
    );

    if (!isConfirmed) {
      return;
    }

    setDeletingProductId(product.id);

    try {
      await productApi.remove(product.id);
      setProducts((previous) => previous.filter((entry) => String(entry.id) !== String(product.id)));
      toast.success("Product deleted successfully");
    } catch (requestError: unknown) {
      toast.error(getErrorMessage(requestError, "Failed to delete product"));
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Products</h2>
          <p className="text-gray-500 font-medium text-sm">Manage your inventory and product listings.</p>
        </div>
        <Link href="/admin/products/add" className="flex items-center justify-center gap-2 bg-gray-900 text-[#facc15] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-[#facc15]/20">
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#facc15] outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-gray-500 font-bold text-sm uppercase tracking-widest">
            <Loader2 size={18} className="animate-spin" /> Loading products...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-sm font-bold text-red-600">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-sm font-bold text-gray-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Product</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Price</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-black text-gray-900 uppercase tracking-tight">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-gray-500">{product.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-gray-600">{product.stock} units</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      product.status === "In Stock" ? "bg-green-100 text-green-700" :
                      product.status === "Low Stock" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-colors cursor-pointer">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        disabled={deletingProductId === product.id}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Product"
                      >
                        {deletingProductId === product.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
