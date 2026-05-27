"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import {
  Minus,
  Plus,
  ShoppingBasket,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Eye,
  Heart,
  ArrowLeftRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { productApi } from "@/lib/api";
import { buildSelectionKey } from "@/lib/shopping";
import {
  ApiProduct,
  mapApiProductToUiProduct,
  mapApiProductToUiProductDetail,
  UiProduct,
  UiProductDetail,
} from "@/lib/productMapping";

export default function ProductDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const productId = idParam ? Number(idParam) : 1;
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping">("description");
  const [product, setProduct] = useState<UiProductDetail | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<UiProduct[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);

      try {
        setLoadError("");
        const [productResponse, recommendationsResponse] = await Promise.all([
          productApi.getById(productId),
          productApi.list({
            page: 1,
            limit: 12,
            status: "active",
            sort: "createdAt_desc",
          }),
        ]);

        const productData = productResponse.data?.data as ApiProduct;
        const listItems = (recommendationsResponse.data?.data?.items || []) as ApiProduct[];

        const mappedProduct = mapApiProductToUiProductDetail(productData);
        const mappedRecommendations = listItems
          .map(mapApiProductToUiProduct)
          .filter((entry) => String(entry.id) !== String(mappedProduct.id))
          .slice(0, 4);

        if (!mounted) {
          return;
        }

        setProduct(mappedProduct);
        setSelectedVariantId(mappedProduct.defaultVariantId);
        setActiveImage(0);
        setRecommendedProducts(mappedRecommendations);
      } catch {
        if (!mounted) {
          return;
        }

        setProduct(null);
        setRecommendedProducts([]);
        setLoadError("This product is unavailable right now.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const selectedVariant = useMemo(() => {
    if (!product || !product.variants.length) {
      return null;
    }

    return product.variants.find((variant) => variant.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const currentPrice = selectedVariant ? selectedVariant.price : Number(product?.price || 0);
  const currentComparePrice = selectedVariant?.comparePrice ?? product?.oldPriceValue ?? null;
  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;

  const displayImages = useMemo(() => {
    if (!product) {
      return [] as string[];
    }

    const images = new Set<string>();

    if (selectedVariant?.image) {
      images.add(selectedVariant.image);
    }

    for (const src of product.gallery) {
      images.add(src);
    }

    if (images.size === 0 && product.image) {
      images.add(product.image);
    }

    return [...images];
  }, [product, selectedVariant]);

  const handleAddCustomQuantity = () => {
    if (!product) {
      return;
    }

    void addToCart({
      id: buildSelectionKey(Number(product.id), selectedVariant?.id ?? product.defaultVariantId),
      name: selectedVariant ? `${product.name} - ${selectedVariant.title}` : product.name,
      price: currentPrice,
      image: selectedVariant?.image || product.image,
      quantity,
      variantId: selectedVariant?.id ?? product.defaultVariantId,
    });
  };

  if (loading) {
    return (
      <div className="bg-[#fdfbf9] min-h-screen py-12 px-6 sm:px-12 flex items-center justify-center">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#fdfbf9] min-h-screen py-12 px-6 sm:px-12 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-[40px] border border-gray-100 shadow-xl p-10 text-center space-y-4">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Product Unavailable</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            {loadError || "This product could not be loaded."}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-[#facc15] px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-black hover:text-white"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf9] min-h-screen py-12 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Breadcrumb */}
        <nav className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#facc15] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#facc15] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        {/* Main Product Display Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Gallery Column */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative w-full aspect-square bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden flex items-center justify-center p-8"
            >
              {product.status && (
                <span className="absolute top-6 left-6 bg-[#facc15] text-xs font-black px-4 py-2 rounded-full uppercase z-10 shadow-md tracking-widest">
                  {product.status}
                </span>
              )}
              <div className="relative w-full h-full">
                <Image
                  src={displayImages[activeImage] || product.image}
                  alt={product.name}
                  fill
                  sizes="100vw"
                  className="object-cover rounded-3xl"
                  priority
                />
              </div>
            </motion.div>

            {displayImages.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {displayImages.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`relative h-16 w-16 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === index
                        ? "border-[#facc15] shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image src={src} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchasing Column */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-[#facc15] bg-yellow-50 px-3 py-1.5 rounded-full tracking-widest border border-yellow-100">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 uppercase tracking-tight leading-none">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => {
                  const val = i + 1;
                  return (
                    <span key={i}>
                      {product.rating >= val ? (
                        <FaStar className="text-[#facc15] text-sm" />
                      ) : product.rating >= val - 0.5 ? (
                        <FaStarHalfAlt className="text-[#facc15] text-sm" />
                      ) : (
                        <FaRegStar className="text-gray-200 text-sm" />
                      )}
                    </span>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-gray-400">({product.rating} / 5.0 Rating • 24 Reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-gray-900">₹{currentPrice.toFixed(2)}</span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="text-xl text-gray-400 line-through font-bold">₹{currentComparePrice.toFixed(2)}</span>
                )}
              </div>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="bg-red-100 text-red-600 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest">
                  Save ₹{(currentComparePrice - currentPrice).toFixed(2)}
                </span>
              )}
            </div>

            {product.variants.length > 0 && (
              <div className="space-y-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">Choose Variant</h4>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {product.variants.length} options
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.variants.map((variant) => {
                    const isActive = variant.id === selectedVariant?.id;
                    const isDisabled = variant.status === "inactive" || variant.stock <= 0;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setActiveImage(0);
                        }}
                        disabled={isDisabled}
                        className={`text-left rounded-2xl border px-4 py-3 transition-all ${
                          isActive
                            ? "border-[#facc15] bg-yellow-50"
                            : "border-gray-200 bg-white hover:border-gray-400"
                        } ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <p className="text-sm font-black text-gray-900">{variant.title}</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">
                          ₹{variant.price.toFixed(2)} • {variant.stock > 0 ? "In Stock" : "Out of Stock"}
                        </p>
                        {variant.attributes.length > 0 && (
                          <p className="text-[11px] font-semibold text-gray-500 mt-1 line-clamp-1">
                            {variant.attributes.map((entry) => `${entry.label}: ${entry.value}`).join(" • ")}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Short Description */}
            <p className="text-gray-600 font-medium text-base sm:text-lg leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {currentStock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            {/* Key Benefits */}
            <div className="space-y-3 py-4 border-y border-gray-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">Key Health Benefits</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <CheckCircle2 size={16} className="text-[#facc15] shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <div className="flex items-center bg-white border-2 border-gray-100 rounded-full px-4 py-2 w-fit shadow-sm">
                <button
                  onClick={handleDecrease}
                  className="p-2 text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-black text-lg text-gray-900">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="p-2 text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddCustomQuantity}
                disabled={currentStock <= 0}
                className="flex-1 bg-[#facc15] text-black py-5 px-8 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#facc15] disabled:hover:text-black"
              >
                <ShoppingBasket size={20} />
                {currentStock > 0
                  ? `Add to Cart • ₹${(currentPrice * quantity).toFixed(2)}`
                  : "Out of Stock"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center">
              <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Truck size={24} className="text-yellow-500" />
                <span className="text-[11px] font-black uppercase text-gray-700 tracking-tight">Free Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <ShieldCheck size={24} className="text-yellow-500" />
                <span className="text-[11px] font-black uppercase text-gray-700 tracking-tight">100% Organic Pure</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <RotateCcw size={24} className="text-yellow-500" />
                <span className="text-[11px] font-black uppercase text-gray-700 tracking-tight">Easy 30-Day Return</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-4xl p-8 sm:p-12 shadow-xl border border-gray-100 space-y-8">
          <div className="flex gap-4 border-b border-gray-100 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 px-4 font-black uppercase tracking-wider text-sm transition-colors whitespace-nowrap cursor-pointer relative ${
                activeTab === "description" ? "text-yellow-600 border-b-4 border-[#facc15]" : "text-gray-400 hover:text-black"
              }`}
            >
              Full Description
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 px-4 font-black uppercase tracking-wider text-sm transition-colors whitespace-nowrap cursor-pointer relative ${
                activeTab === "specs" ? "text-yellow-600 border-b-4 border-[#facc15]" : "text-gray-400 hover:text-black"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-4 px-4 font-black uppercase tracking-wider text-sm transition-colors whitespace-nowrap cursor-pointer relative ${
                activeTab === "shipping" ? "text-yellow-600 border-b-4 border-[#facc15]" : "text-gray-400 hover:text-black"
              }`}
            >
              Shipping & Returns
            </button>
          </div>

          <div className="py-4">
            {activeTab === "description" && (
              <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                <p>{product.description || product.shortDescription || "No detailed description available yet."}</p>
                {selectedVariant?.attributes.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.attributes.map((attribute) => (
                      <span
                        key={`${attribute.label}-${attribute.value}`}
                        className="text-[11px] font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-3 py-1"
                      >
                        {attribute.label}: {attribute.value}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {[...product.specs, ...(selectedVariant?.attributes || [])].map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                        <th className="py-4 px-6 font-black uppercase text-gray-700 tracking-wider w-1/3">{spec.label}</th>
                        <td className="py-4 px-6 font-semibold text-gray-600">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                <p className="font-bold text-gray-900">⚡ Express Shipping & Safe Delivery</p>
                <p>
                  All orders are dispatched within 24 hours in insulated packaging to maintain perfect temperature and
                  freshness. Standard delivery takes 2–4 business days across all major states and regions.
                </p>
                <p className="font-bold text-gray-900 mt-6">🤝 100% Satisfaction Guarantee</p>
                <p>
                  If you are not completely satisfied with the freshness or quality of your item, contact our dedicated support
                  team within 30 days for an effortless replacement or full refund.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="space-y-12 pt-12 border-t border-gray-100">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 uppercase mb-3">You May Also Like</h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Explore handpicked recommendations tailored to complement your wholesome taste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProducts.map((rec) => (
              <motion.div
                key={rec.id}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-4xl p-5 flex flex-col items-center text-center shadow-sm border border-transparent hover:border-yellow-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Image Container with Floating Actions */}
                <div className="relative w-full aspect-square bg-[#f8f8f8] rounded-3xl overflow-hidden mb-6 flex items-center justify-center">
                  {rec.status && (
                    <span className="absolute top-4 left-4 bg-[#facc15] text-[11px] font-black px-3 py-1 rounded-full uppercase z-10 shadow-sm">
                      {rec.status}
                    </span>
                  )}

                  {/* Secondary Actions (Visible on Hover) */}
                  <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Link
                      href={`/product/${rec.id}`}
                      className="p-2 bg-white text-gray-800 rounded-full shadow-md hover:bg-[#facc15] transition-colors flex items-center justify-center"
                    >
                      <Eye size={16} />
                    </Link>
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-[#facc15] transition-colors cursor-pointer">
                      <Heart size={16} />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-[#facc15] transition-colors cursor-pointer">
                      <ArrowLeftRight size={16} />
                    </button>
                  </div>

                  <Link href={`/product/${rec.id}`} className="relative w-full h-full block">
                    <Image
                      src={rec.image}
                      alt={rec.name}
                      fill
                      sizes="100vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                </div>

                {/* Price & Rating Row */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-400">From</span>
                  <span className="text-xl font-black text-gray-900">₹{rec.price}</span>
                  {rec.oldPrice && <span className="text-sm text-gray-400 line-through">₹{rec.oldPrice}</span>}
                </div>

                {/* Title */}
                <Link
                  href={`/product/${rec.id}`}
                  className="text-sm font-bold text-gray-800 hover:text-yellow-600 transition-colors mb-3 h-10 line-clamp-2 px-2 leading-tight block"
                >
                  {rec.name}
                </Link>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => {
                    const val = i + 1;
                    return (
                      <span key={i}>
                        {rec.rating >= val ? (
                          <FaStar className="text-[#facc15] text-[10px]" />
                        ) : rec.rating >= val - 0.5 ? (
                          <FaStarHalfAlt className="text-[#facc15] text-[10px]" />
                        ) : (
                          <FaRegStar className="text-gray-200 text-[10px]" />
                        )}
                      </span>
                    );
                  })}
                  <span className="text-[10px] font-bold text-gray-400 ml-1">({rec.rating})</span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() =>
                    addToCart({
                      id: buildSelectionKey(Number(rec.id), rec.defaultVariantId),
                      name: rec.name,
                      price: rec.price,
                      image: rec.image,
                      variantId: rec.defaultVariantId,
                    })
                  }
                  className="w-full py-3.5 border-2 border-gray-900 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all cursor-pointer"
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
