"use client";
import React, { useEffect, useState } from "react";
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
import { mockProducts } from "@/lib/mockProducts";
import { toast } from "react-hot-toast";
import { productApi } from "@/lib/api";
import { ApiProduct, mapApiProductToUiProduct, UiProduct } from "@/lib/productMapping";

const toFallbackProduct = (id: number) => {
  const selected = mockProducts.find((product) => Number(product.id) === id) || mockProducts[0];

  return {
    id: selected.id,
    slug: String(selected.id),
    name: selected.name,
    description: selected.description,
    shortDescription: selected.description,
    price: selected.price,
    oldPrice: selected.oldPrice,
    stock: 0,
    category: selected.category,
    status: selected.status || "In Stock",
    image: selected.image,
    rating: selected.rating,
    benefits: selected.benefits,
    specs: selected.specs,
  } as UiProduct;
};

export default function ProductDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const productId = idParam ? Number(idParam) : 1;
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping">("description");
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);

      try {
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

        const mappedProduct = mapApiProductToUiProduct(productData);
        const mappedRecommendations = listItems
          .map(mapApiProductToUiProduct)
          .filter((entry) => String(entry.id) !== String(mappedProduct.id))
          .slice(0, 4);

        if (!mounted) {
          return;
        }

        setProduct(mappedProduct);
        setRecommendedProducts(mappedRecommendations);
      } catch {
        if (!mounted) {
          return;
        }

        const fallbackProduct = toFallbackProduct(productId);
        const fallbackRecommendations = mockProducts
          .filter((item) => String(item.id) !== String(fallbackProduct.id))
          .slice(0, 4)
          .map((item) => toFallbackProduct(Number(item.id)));

        setProduct(fallbackProduct);
        setRecommendedProducts(fallbackRecommendations);
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

  const handleAddCustomQuantity = () => {
    if (!product) {
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `prod-${product.id}`,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    toast.success(`Added ${quantity} of ${product.name} to cart!`);
  };

  if (loading || !product) {
    return (
      <div className="bg-[#fdfbf9] min-h-screen py-12 px-6 sm:px-12 flex items-center justify-center">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading product...</div>
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
              <Image src={product.image} alt={product.name} fill className="object-cover rounded-3xl" priority />
            </div>
          </motion.div>

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
                <span className="text-4xl font-black text-gray-900">₹{product.price}</span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through font-bold">₹{product.oldPrice}</span>
                )}
              </div>
              {product.oldPrice && (
                <span className="bg-red-100 text-red-600 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest">
                  Save ₹{(Number(product.oldPrice) - Number(product.price)).toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600 font-medium text-base sm:text-lg leading-relaxed">{product.description}</p>

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
                className="flex-1 bg-[#facc15] text-black py-5 px-8 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <ShoppingBasket size={20} />
                Add to Cart • ₹{(Number(product.price) * quantity).toFixed(2)}
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
                <p>
                  Sourced straight from pristine mountain orchards, our premium products undergo meticulous quality checks to
                  ensure that only the finest, crunchiest, and most flavorful specimens reach your table. Packed with
                  essential minerals, antioxidants, and pure nutrition.
                </p>
                <p>
                  We prioritize sustainable farming practices and work directly with local farmers. Every package is sealed in
                  oxygen-barrier pouches to lock in natural freshness, aroma, and essential oils.
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {product.specs.map((spec, idx) => (
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
                  onClick={() => addToCart({ id: `rec-${rec.id}`, name: rec.name, price: rec.price, image: rec.image })}
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
