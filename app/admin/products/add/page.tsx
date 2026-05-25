"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Upload,
  Package,
  Layers,
  Sparkles,
  ListFilter,
  Plus,
  Trash2,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { categoryApi, productApi, uploadApi } from "@/lib/api";

type CategoryNode = {
  id: number;
  name: string;
  status?: string;
  children?: CategoryNode[];
};

type CategoryOption = {
  id: number;
  label: string;
};

type ProductSpec = {
  label: string;
  value: string;
};

type ProductFormData = {
  title: string;
  shortDescription: string;
  description: string;
  sku: string;
  price: string;
  comparePrice: string;
  stock: string;
  categoryId: string;
  productType: "simple" | "configurable" | "variant";
  status: "active" | "inactive";
  benefits: string[];
  specs: ProductSpec[];
};

const STATUS_OPTIONS: Array<{ value: ProductFormData["status"]; label: string }> = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const flattenCategories = (nodes: CategoryNode[], trail = ""): CategoryOption[] => {
  return nodes.flatMap((node) => {
    const currentLabel = trail ? `${trail} / ${node.name}` : node.name;
    const children = Array.isArray(node.children) ? node.children : [];

    return [
      { id: node.id, label: currentLabel },
      ...flattenCategories(children, currentLabel),
    ];
  });
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const resolveUploadsBaseUrl = () => {
  const explicitBase = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL?.trim();
  if (explicitBase) {
    return trimTrailingSlash(explicitBase);
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiBase) {
    return "";
  }

  try {
    const parsed = new URL(apiBase);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
};

const UPLOADS_BASE_URL = resolveUploadsBaseUrl();

const toAbsoluteUrl = (assetUrl: string) => {
  if (assetUrl.startsWith("http://") || assetUrl.startsWith("https://")) {
    return assetUrl;
  }

  if (assetUrl.startsWith("/uploads/") && UPLOADS_BASE_URL) {
    return `${UPLOADS_BASE_URL}${assetUrl}`;
  }

  if (typeof window === "undefined") {
    return assetUrl;
  }

  return `${window.location.origin}${assetUrl}`;
};

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

export default function AddProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    shortDescription: "",
    description: "",
    sku: "",
    price: "",
    comparePrice: "",
    stock: "",
    categoryId: "",
    productType: "simple",
    status: "active",
    benefits: ["Rich in Vitamin E & Antioxidants", "Supports Heart Health & Immunity"],
    specs: [
      { label: "Origin", value: "Kashmir Valley" },
      { label: "Weight", value: "500g Pack" },
      { label: "Shelf Life", value: "12 Months" },
    ],
  });

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await categoryApi.getTree({ status: "active" });
        const tree = (response.data?.data || []) as CategoryNode[];
        const options = flattenCategories(tree);

        if (!isMounted) {
          return;
        }

        setCategoryOptions(options);
        setFormData((prev) => ({
          ...prev,
          categoryId: prev.categoryId || (options[0] ? String(options[0].id) : ""),
        }));
      } catch (error: unknown) {
        if (isMounted) {
          const message = getErrorMessage(error, "Failed to load categories");
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsCategoryLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as ProductFormData));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Dynamic Health Benefits handlers
  const handleBenefitChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.benefits];
      updated[index] = value;
      return { ...prev, benefits: updated };
    });
  };

  const addBenefit = () => {
    setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, ""] }));
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }));
  };

  // Dynamic Specs handlers
  const handleSpecChange = (index: number, key: "label" | "value", value: string) => {
    setFormData((prev) => {
      const updated = [...prev.specs];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, specs: updated };
    });
  };

  const addSpec = () => {
    setFormData((prev) => ({ ...prev, specs: [...prev.specs, { label: "", value: "" }] }));
  };

  const removeSpec = (index: number) => {
    setFormData((prev) => ({ ...prev, specs: prev.specs.filter((_, i) => i !== index) }));
  };

  const cleanBenefits = useMemo(() => {
    return formData.benefits.map((entry) => entry.trim()).filter(Boolean);
  }, [formData.benefits]);

  const cleanSpecs = useMemo(() => {
    return formData.specs
      .map((spec) => ({
        label: spec.label.trim(),
        value: spec.value.trim(),
      }))
      .filter((spec) => spec.label && spec.value);
  }, [formData.specs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const trimmedTitle = formData.title.trim();
      const trimmedDescription = formData.description.trim();
      const price = Number(formData.price);
      const stock = Number(formData.stock);
      const comparePrice = formData.comparePrice ? Number(formData.comparePrice) : null;

      if (!trimmedTitle) {
        throw new Error("Product name is required");
      }

      if (!trimmedDescription) {
        throw new Error("Product description is required");
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Price must be a valid positive number");
      }

      if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("Stock must be a valid non-negative integer");
      }

      if (!selectedImageFile) {
        throw new Error("Please choose a product image");
      }

      setIsUploading(true);
      const uploadResponse = await uploadApi.uploadProductImage(selectedImageFile);
      const localImageUrl = uploadResponse.data?.data?.url as string | undefined;
      setIsUploading(false);

      if (!localImageUrl) {
        throw new Error("Image upload failed");
      }

      const imageUrl = toAbsoluteUrl(localImageUrl);
      const categoryIds = formData.categoryId ? [Number(formData.categoryId)] : [];

      const trimmedSku = formData.sku.trim();
      const autoSku = trimmedSku
        ? trimmedSku
        : `${trimmedTitle.toUpperCase().replace(/[^A-Z0-9]/g, "-").replace(/-+/g, "-").slice(0, 10)}-${Date.now().toString(36).toUpperCase()}`;

      const payload: Record<string, unknown> = {
        title: trimmedTitle,
        description: trimmedDescription,
        shortDescription: formData.shortDescription.trim() || null,
        productType: formData.productType,
        status: formData.status,
        thumbnail: imageUrl,
        categoryIds,
        variants: [
          {
            sku: autoSku,
            price,
            comparePrice,
            status: formData.status,
            image: imageUrl,
            stock,
            inventory: {
              quantity: stock,
            },
          },
        ],
        media: [
          {
            url: imageUrl,
            mediaType: "image",
            altText: trimmedTitle,
            position: 0,
          },
        ],
      };

      const meta: Record<string, unknown> = {};

      if (cleanBenefits.length > 0) {
        meta.healthBenefits = cleanBenefits;
      }

      if (cleanSpecs.length > 0) {
        meta.specifications = cleanSpecs;
      }

      if (Object.keys(meta).length > 0) {
        payload.meta = meta;
      }

      await productApi.create(payload);

      toast.success("Product added successfully!");
      router.push("/admin/products");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to add product");
      toast.error(message);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Back Link */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Add New Product</h2>
        <p className="text-gray-500 font-medium text-sm">
          Create a new product listing with full descriptions, health benefits, and technical specifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Columns (2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Basic Information */}
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight pb-4 border-b border-gray-100 flex items-center gap-2">
              <Package size={20} className="text-[#facc15]" /> Basic Product Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Premium Kashmiri Walnuts"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-2">Price (₹)</label>
                  <div className="relative">
                    {/* <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span> */}
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      required
                      placeholder="₹0.00"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-11 pr-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-2">Compare Price (Optional)</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      name="comparePrice"
                      placeholder="₹0.00"
                      value={formData.comparePrice}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-11 pr-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-2">Initial Stock</label>
                  <div className="relative">
                    <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      name="stock"
                      required
                      placeholder="100"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-11 pr-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-2">Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    disabled={isCategoryLoading || categoryOptions.length === 0}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all cursor-pointer"
                  >
                    {isCategoryLoading && <option value="">Loading categories...</option>}
                    {!isCategoryLoading && categoryOptions.length === 0 && (
                      <option value="">No categories available</option>
                    )}
                    {categoryOptions.map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-2">Short Description (Optional)</label>
                <textarea
                  name="shortDescription"
                  rows={2}
                  placeholder="Short summary shown in cards and quick listings..."
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-2">Full Description</label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Describe the product, its harvesting origin, flavor notes, and organic processing..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Key Health Benefits */}
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                <Sparkles size={20} className="text-[#facc15]" /> Key Health Benefits
              </h3>
              <button
                type="button"
                onClick={addBenefit}
                className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#facc15] transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Benefit
              </button>
            </div>

            <div className="space-y-3">
              {formData.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-yellow-50 text-[#facc15] flex items-center justify-center font-black text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Rich in Omega-3 Fatty Acids"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(idx, e.target.value)}
                    className="flex-1 bg-gray-50 border-none rounded-2xl py-3 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="p-3 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Technical Specifications */}
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                <ListFilter size={20} className="text-[#facc15]" /> Technical Specifications
              </h3>
              <button
                type="button"
                onClick={addSpec}
                className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#facc15] transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Spec
              </button>
            </div>

            <div className="space-y-3">
              {formData.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Label (e.g. Origin)"
                    value={spec.label}
                    onChange={(e) => handleSpecChange(idx, "label", e.target.value)}
                    className="w-1/3 bg-gray-50 border-none rounded-2xl py-3 px-5 text-sm font-bold uppercase text-gray-800 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Pampore, Kashmir)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    className="flex-1 bg-gray-50 border-none rounded-2xl py-3 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                  />
                  {formData.specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpec(idx)}
                      className="p-3 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Image Upload & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight pb-4 border-b border-gray-100 flex items-center gap-2">
              <Upload size={20} className="text-[#facc15]" /> Product Image
            </h3>

            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 group flex items-center justify-center">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Select Product Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <label className="bg-white text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer hover:bg-[#facc15] transition-colors">
                    {imagePreview ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>
              <p className="text-[11px] font-bold text-gray-400 text-center uppercase tracking-tight">
                Stored locally in uploads/products. Recommended: 800x800px (JPG, PNG, WEBP)
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-4">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="w-full bg-[#facc15] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isUploading ? "Uploading Image..." : isSaving ? "Saving..." : "Save Product"}
            </button>
            <Link
              href="/admin/products"
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
