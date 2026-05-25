"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Eye, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { mockProducts } from "@/lib/mockProducts";
import { productApi } from "@/lib/api";
import { ApiProduct, mapApiProductToUiProduct, UiProduct } from "@/lib/productMapping";

interface AllProductProps {
  showFilter?: boolean;
}

const AllProduct: React.FC<AllProductProps> = ({ showFilter = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fallbackProducts = mockProducts.map((product) => ({
      id: product.id,
      slug: String(product.id),
      name: product.name,
      description: product.description,
      shortDescription: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: 0,
      category: product.category,
      status: product.status || "In Stock",
      image: product.image,
      rating: product.rating,
      benefits: product.benefits,
      specs: product.specs,
    }));

    const loadProducts = async () => {
      try {
        const response = await productApi.list({
          page: 1,
          limit: 60,
          status: "active",
          sort: "createdAt_desc",
        });

        const items = (response.data?.data?.items || []) as ApiProduct[];
        const mappedProducts = items.map(mapApiProductToUiProduct);

        if (!mounted) {
          return;
        }

        setProducts(mappedProducts.length > 0 ? mappedProducts : fallbackProducts);
      } catch {
        if (mounted) {
          setProducts(fallbackProducts);
        }
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

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <section className="py-20 bg-[#fdfbf9]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-black tracking-tighter text-gray-900 mb-4 uppercase"
          >
            Our Healthy Nut Products
          </motion.h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            Discover a wide range of organic and crunchy nut snacks packed with
            nutrition and flavor for your everyday lifestyle.
          </p>
        </div>

        {/* Category Filters (Optional) */}
        {showFilter && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                  selectedCategory === cat
                    ? "bg-[#facc15] text-black font-black ring-2 ring-black shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-900 hover:text-white border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {loading && (
            <div className="col-span-full text-center text-sm font-bold text-gray-500 uppercase tracking-widest py-6">
              Loading products...
            </div>
          )}

          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-4xl p-5 flex flex-col items-center text-center shadow-sm border border-transparent hover:border-yellow-100 hover:shadow-xl transition-all duration-300 select-none"
              >
                {/* Image Container with Floating Actions */}
                <div className="relative w-full aspect-square bg-[#f8f8f8] rounded-3xl overflow-hidden mb-6 flex items-center justify-center">
                  {product.status && (
                    <span className="absolute top-4 left-4 bg-[#facc15] text-[11px] font-black px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                      {product.status}
                    </span>
                  )}

                  {/* Secondary Actions (Visible on Hover) */}
                  <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Link
                      href={`/product/${product.id}`}
                      className="p-2 bg-white text-gray-800 rounded-full shadow-md hover:bg-[#facc15] transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() =>
                        toggleWishlist({
                          id: `all-${product.id}`,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        })
                      }
                      className={`p-2 rounded-full shadow-md transition-colors cursor-pointer ${
                        isInWishlist(`all-${product.id}`)
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-white text-gray-800 hover:bg-[#facc15]"
                      }`}
                      title={
                        isInWishlist(`all-${product.id}`)
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      <Heart
                        size={16}
                        className={
                          isInWishlist(`all-${product.id}`) ? "fill-white" : ""
                        }
                      />
                    </button>
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    className="relative w-full h-full block"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                </div>

                {/* Price & Rating Row */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-400">From</span>
                  <span className="text-xl font-black text-gray-900">
                    ₹{product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.oldPrice}
                    </span>
                  )}
                </div>

                {/* Title */}
                <Link
                  href={`/product/${product.id}`}
                  className="text-sm font-bold text-gray-800 hover:text-yellow-600 transition-colors mb-3 h-10 line-clamp-2 px-2 leading-tight block uppercase tracking-tight"
                >
                  {product.name}
                </Link>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => {
                    const val = i + 1;
                    return (
                      <span key={i}>
                        {product.rating >= val ? (
                          <FaStar className="text-[#facc15] text-[10px]" />
                        ) : product.rating >= val - 0.5 ? (
                          <FaStarHalfAlt className="text-[#facc15] text-[10px]" />
                        ) : (
                          <FaRegStar className="text-gray-200 text-[10px]" />
                        )}
                      </span>
                    );
                  })}
                  <span className="text-[10px] font-bold text-gray-400 ml-1">
                    ({product.rating})
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() =>
                    addToCart({
                      id: `all-${product.id}`,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                    })
                  }
                  className="w-full py-3.5 border-2 border-gray-900 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default AllProduct;
