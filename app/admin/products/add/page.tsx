"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { categoryApi, productApi, uploadApi } from "@/lib/api";

type CategoryNode = {
  id: number;
  name: string;
  children?: CategoryNode[];
};

type CategoryOption = {
  id: number;
  label: string;
};

type ProductAttribute = {
  name: string;
  valuesText: string;
};

type VariantAttributeValue = {
  name: string;
  value: string;
};

type ProductVariant = {
  id: string;
  combinationLabel: string;
  selected: boolean;
  sku: string;
  price: string;
  comparePrice: string;
  stock: string;
  barcode: string;
  image: string;
  status: "active" | "inactive";
  attributes: VariantAttributeValue[];
};

type ProductFormData = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  brandName: string;
  sku: string;
  price: string;
  comparePrice: string;
  stock: string;
  categoryId: string;
  categoryNames: string[];
  categoryNameInput: string;
  productType: "simple" | "variant";
  status: "active" | "inactive";
  hasVariants: boolean;
  seoTitle: string;
  seoDescription: string;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
};

const STATUS_OPTIONS: Array<{ value: ProductFormData["status"]; label: string }> = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const VARIANT_STATUS_OPTIONS: Array<{ value: ProductVariant["status"]; label: string }> = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const makeAttributeCode = (value: string) => slugify(value).replace(/-/g, "_") || "attr";

const parseAttributeValues = (valuesText: string) =>
  Array.from(
    new Set(
      valuesText
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  );

const cartesianProduct = <T,>(input: T[][]): T[][] => {
  if (input.length === 0) {
    return [];
  }

  return input.reduce<T[][]>(
    (accumulator, current) => accumulator.flatMap((entry) => current.map((value) => [...entry, value])),
    [[]],
  );
};

const buildVariantSku = (baseSlug: string, attributes: VariantAttributeValue[]) => {
  const suffix = attributes
    .map((attribute) => slugify(attribute.value))
    .filter(Boolean)
    .join("-");

  const base = slugify(baseSlug || "product") || "product";
  return `${base}${suffix ? `-${suffix}` : ""}`.toUpperCase();
};

const buildVariantRows = (
  baseSlug: string,
  attributes: Array<{ name: string; values: string[] }>,
  previousVariants: ProductVariant[],
) => {
  if (attributes.length === 0) {
    return [] as ProductVariant[];
  }

  const combinations = cartesianProduct(attributes.map((attribute) => attribute.values));
  const previousById = new Map(previousVariants.map((variant) => [variant.id, variant]));

  return combinations.map((combination) => {
    const variantAttributes = combination.map((value, index) => ({
      name: attributes[index].name,
      value,
    }));

    const id = variantAttributes
      .map((attribute) => `${makeAttributeCode(attribute.name)}:${slugify(attribute.value)}`)
      .join("|");

    const existing = previousById.get(id);

    return {
      id,
      combinationLabel: variantAttributes.map((attribute) => `${attribute.name}: ${attribute.value}`).join(" / "),
      selected: existing?.selected ?? true,
      sku: existing?.sku || buildVariantSku(baseSlug, variantAttributes),
      price: existing?.price || "",
      comparePrice: existing?.comparePrice || "",
      stock: existing?.stock || "",
      barcode: existing?.barcode || "",
      image: existing?.image || "",
      status: existing?.status || "active",
      attributes: variantAttributes,
    } satisfies ProductVariant;
  });
};

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
  const [pendingIntent, setPendingIntent] = useState<"draft" | "publish" | null>(null);
  const [slugDirty, setSlugDirty] = useState(false);
  const [variantSearch, setVariantSearch] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    brandName: "",
    sku: "",
    price: "",
    comparePrice: "",
    stock: "",
    categoryId: "",
    categoryNames: [],
    categoryNameInput: "",
    productType: "simple",
    status: "active",
    hasVariants: false,
    seoTitle: "",
    seoDescription: "",
    attributes: [
      { name: "Size", valuesText: "250g, 500g" },
      { name: "Roast", valuesText: "Natural, Salted" },
    ],
    variants: [],
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
        setFormData((previous) => ({
          ...previous,
          categoryId: previous.categoryId || (options[0] ? String(options[0].id) : ""),
        }));
      } catch (error: unknown) {
        if (isMounted) {
          toast.error(getErrorMessage(error, "Failed to load categories"));
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

  const setField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGalleryFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setGalleryFiles((previous) => {
      const existingKeys = new Set(previous.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const uniqueIncoming = files.filter((file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`));

      return [...previous, ...uniqueIncoming];
    });
  };

  const handleAddCategoryName = () => {
    const normalized = formData.categoryNameInput.trim();

    if (!normalized) {
      return;
    }

    if (formData.categoryNames.some((name) => name.toLowerCase() === normalized.toLowerCase())) {
      setField("categoryNameInput", "");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      categoryNames: [...previous.categoryNames, normalized],
      categoryNameInput: "",
    }));
  };

  const handleRemoveCategoryName = (index: number) => {
    setFormData((previous) => ({
      ...previous,
      categoryNames: previous.categoryNames.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleRemoveGalleryFile = (index: number) => {
    setGalleryFiles((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleAttributeChange = (index: number, key: keyof ProductAttribute, value: string) => {
    setFormData((previous) => {
      const nextAttributes = [...previous.attributes];
      nextAttributes[index] = {
        ...nextAttributes[index],
        [key]: value,
      };

      return {
        ...previous,
        attributes: nextAttributes,
      };
    });
  };

  const addAttribute = () => {
    setFormData((previous) => ({
      ...previous,
      attributes: [...previous.attributes, { name: "", valuesText: "" }],
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData((previous) => ({
      ...previous,
      attributes: previous.attributes.filter((_, currentIndex) => currentIndex !== index),
      variants: [],
    }));
  };

  const handleGenerateVariants = () => {
    const normalizedAttributes = formData.attributes
      .map((attribute) => ({
        name: attribute.name.trim(),
        values: parseAttributeValues(attribute.valuesText),
      }))
      .filter((attribute) => attribute.name && attribute.values.length > 0);

    if (normalizedAttributes.length === 0) {
      toast.error("Add at least one valid attribute with values to generate variants");
      return;
    }

    const generatedVariants = buildVariantRows(
      formData.slug || formData.title,
      normalizedAttributes,
      formData.variants,
    );

    setField("variants", generatedVariants);
    toast.success(`Generated ${generatedVariants.length} variant combinations`);
  };

  const handleVariantFieldChange = (index: number, key: keyof ProductVariant, value: string | boolean) => {
    setFormData((previous) => {
      const nextVariants = [...previous.variants];
      nextVariants[index] = {
        ...nextVariants[index],
        [key]: value,
      } as ProductVariant;

      return {
        ...previous,
        variants: nextVariants,
      };
    });
  };

  const filteredVariants = useMemo(() => {
    const normalizedSearch = variantSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return formData.variants;
    }

    return formData.variants.filter(
      (variant) =>
        variant.combinationLabel.toLowerCase().includes(normalizedSearch) ||
        variant.sku.toLowerCase().includes(normalizedSearch),
    );
  }, [formData.variants, variantSearch]);

  const submitWithIntent = async (intent: "draft" | "publish") => {
    setIsSaving(true);
    setPendingIntent(intent);

    try {
      const trimmedTitle = formData.title.trim();
      const trimmedSlug = slugify(formData.slug || formData.title);
      const trimmedDescription = formData.description.trim();

      if (!trimmedTitle) {
        throw new Error("Product name is required");
      }

      if (!trimmedSlug) {
        throw new Error("Slug is required");
      }

      if (!trimmedDescription) {
        throw new Error("Product description is required");
      }

      if (!selectedImageFile) {
        throw new Error("Please upload a thumbnail image from your device");
      }

      setIsUploading(true);
      const thumbnailUploadResponse = await uploadApi.uploadProductImage(selectedImageFile, trimmedTitle);
      const thumbnailPath = thumbnailUploadResponse.data?.data?.path as string | undefined;

      if (!thumbnailPath) {
        throw new Error("Thumbnail upload failed");
      }

      const galleryPaths = await Promise.all(
        galleryFiles.map(async (file, index) => {
          const response = await uploadApi.uploadProductImage(file, `${trimmedTitle}-gallery-${index + 1}`);
          const path = response.data?.data?.path as string | undefined;

          if (!path) {
            throw new Error(`Gallery upload failed for ${file.name}`);
          }

          return path;
        }),
      );

      const categoryIds = formData.categoryId ? [Number(formData.categoryId)] : [];
      const payload: Record<string, unknown> = {
        title: trimmedTitle,
        slug: trimmedSlug,
        description: trimmedDescription,
        shortDescription: formData.shortDescription.trim() || null,
        thumbnail: thumbnailPath,
        status: intent === "publish" ? formData.status : "inactive",
        categoryIds,
        categoryNames: formData.categoryNames,
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
      };

      const brandName = formData.brandName.trim();
      if (brandName) {
        payload.brandName = brandName;
      }

      payload.media = [
        {
          url: thumbnailPath,
          mediaType: "image",
          altText: trimmedTitle,
          position: 0,
        },
        ...galleryPaths.map((url, index) => ({
          url,
          mediaType: "image",
          altText: `${trimmedTitle} gallery ${index + 1}`,
          position: index + 1,
        })),
      ];

      if (!formData.hasVariants) {
        const price = Number(formData.price);
        const stock = Number(formData.stock);
        const comparePrice = formData.comparePrice ? Number(formData.comparePrice) : null;

        if (!Number.isFinite(price) || price < 0) {
          throw new Error("Price must be a valid positive number");
        }

        if (!Number.isInteger(stock) || stock < 0) {
          throw new Error("Stock must be a valid non-negative integer");
        }

        const trimmedSku = formData.sku.trim();
        const autoSku = trimmedSku
          ? trimmedSku
          : `${trimmedTitle.toUpperCase().replace(/[^A-Z0-9]/g, "-").replace(/-+/g, "-").slice(0, 10)}-${Date.now().toString(36).toUpperCase()}`;

        payload.productType = "simple";
        payload.hasVariants = false;
        payload.sku = autoSku;
        payload.basePrice = price;
        payload.comparePrice = comparePrice;
        payload.quantity = stock;
      } else {
        const normalizedAttributes = formData.attributes
          .map((attribute) => ({
            name: attribute.name.trim(),
            values: parseAttributeValues(attribute.valuesText),
          }))
          .filter((attribute) => attribute.name && attribute.values.length > 0);

        if (normalizedAttributes.length === 0) {
          throw new Error("Add at least one valid attribute before publishing variants");
        }

        const selectedVariants = formData.variants.filter((variant) => variant.selected);

        if (selectedVariants.length === 0) {
          throw new Error("Select at least one variant to publish");
        }

        const normalizedVariants = selectedVariants.map((variant) => {
          const variantPrice = Number(variant.price);
          const variantStock = Number(variant.stock);
          const variantComparePrice = variant.comparePrice ? Number(variant.comparePrice) : null;

          if (!Number.isFinite(variantPrice) || variantPrice < 0) {
            throw new Error(`Variant price is required for ${variant.combinationLabel}`);
          }

          if (!Number.isInteger(variantStock) || variantStock < 0) {
            throw new Error(`Variant stock is required for ${variant.combinationLabel}`);
          }

          const sku = variant.sku.trim() || buildVariantSku(trimmedSlug, variant.attributes);

          return {
            sku,
            barcode: variant.barcode.trim() || undefined,
            price: variantPrice,
            comparePrice: variantComparePrice,
            image: variant.image.trim() || undefined,
            status: variant.status,
            stock: variantStock,
            attributeValues: variant.attributes.map((attribute) => ({
              code: makeAttributeCode(attribute.name),
              value: attribute.value,
            })),
          };
        });

        payload.productType = "variant";
        payload.hasVariants = true;
        payload.skuPrefix = trimmedSlug.toUpperCase().replace(/-/g, "");
        payload.attributes = normalizedAttributes.map((attribute) => ({
          name: attribute.name,
          code: makeAttributeCode(attribute.name),
          isVariantAxis: true,
          values: attribute.values,
        }));
        payload.variants = normalizedVariants;
      }

      await productApi.create(payload);

      toast.success(intent === "publish" ? "Product published successfully!" : "Draft saved successfully!");
      router.push("/admin/products");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save product"));
    } finally {
      setIsSaving(false);
      setIsUploading(false);
      setPendingIntent(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submitWithIntent("publish");
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pb-16 sm:px-6 lg:px-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-black"
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="mt-4 mb-8 max-w-3xl">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 sm:text-4xl">Add New Product</h2>
        <p className="mt-2 text-sm font-medium text-gray-500 sm:text-base">
          Create a new product listing with the same section flow used in the ecommerce frontend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.72fr)_minmax(280px,0.42fr)]">
          <div className="space-y-6 xl:space-y-5">
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Basic information</p>
                  <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-gray-900">Core product details</h3>
                </div>
                <div className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gray-500">
                  {formData.hasVariants ? "Variant product" : "Simple product"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Kashmiri Walnuts"
                    value={formData.title}
                    onChange={(event) => {
                      const nextTitle = event.target.value;

                      setFormData((previous) => ({
                        ...previous,
                        title: nextTitle,
                        slug: slugDirty ? previous.slug : slugify(nextTitle),
                      }));
                    }}
                    className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="premium-kashmiri-walnuts"
                    value={formData.slug}
                    onChange={(event) => {
                      setSlugDirty(true);
                      setField("slug", event.target.value);
                    }}
                    className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  />
                  {!slugDirty ? <p className="mt-1 text-xs text-gray-500">Slug auto-generates from title until you edit it.</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. PelTown"
                    value={formData.brandName}
                    onChange={(event) => setField("brandName", event.target.value)}
                    className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>

                <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">Product Type</p>
                      <p className="mt-1 text-xs font-semibold text-gray-600">
                        Toggle between simple product and variant product modes.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-3">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          !formData.hasVariants ? "text-black" : "text-gray-400"
                        }`}
                      >
                        Simple
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData.hasVariants}
                        aria-label="Toggle variant mode"
                        onClick={() => {
                          const nextIsVariant = !formData.hasVariants;
                          setField("hasVariants", nextIsVariant);
                          setField("productType", nextIsVariant ? "variant" : "simple");
                        }}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:ring-offset-2 ${
                          formData.hasVariants ? "bg-black" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            formData.hasVariants ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          formData.hasVariants ? "text-black" : "text-gray-400"
                        }`}
                      >
                        Variant
                      </span>
                    </label>
                  </div>
                </div>

                {!formData.hasVariants ? (
                  <>
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase text-gray-700">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="₹0.00"
                        value={formData.price}
                        onChange={(event) => setField("price", event.target.value)}
                        className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase text-gray-700">Compare Price</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="₹0.00"
                        value={formData.comparePrice}
                        onChange={(event) => setField("comparePrice", event.target.value)}
                        className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase text-gray-700">Initial Stock</label>
                      <input
                        type="number"
                        min={0}
                        required
                        placeholder="100"
                        value={formData.stock}
                        onChange={(event) => setField("stock", event.target.value)}
                        className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                    Variant mode is enabled. Price, compare price, stock, and SKU are configured per variant below.
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(event) => setField("categoryId", event.target.value)}
                    disabled={isCategoryLoading || categoryOptions.length === 0}
                    className="w-full cursor-pointer rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  >
                    {isCategoryLoading && <option value="">Loading categories...</option>}
                    {!isCategoryLoading && categoryOptions.length === 0 && <option value="">No categories available</option>}
                    {categoryOptions.map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(event) => setField("status", event.target.value as ProductFormData["status"])}
                    className="w-full cursor-pointer rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!formData.hasVariants ? (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase text-gray-700">SKU</label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={formData.sku}
                      onChange={(event) => setField("sku", event.target.value)}
                      className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                    />
                  </div>
                ) : null}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Short Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short summary shown in cards and quick listings..."
                    value={formData.shortDescription}
                    onChange={(event) => setField("shortDescription", event.target.value)}
                    className="w-full resize-none rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Full Description</label>
                  <textarea
                    rows={6}
                    placeholder="Describe the product, its harvesting origin, flavor notes, and organic processing..."
                    value={formData.description}
                    onChange={(event) => setField("description", event.target.value)}
                    className="w-full resize-none rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">Custom Category Tags</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      placeholder="e.g. Dry Fruits, Gourmet"
                      value={formData.categoryNameInput}
                      onChange={(event) => setField("categoryNameInput", event.target.value)}
                      className="flex-1 rounded-2xl border-none bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategoryName}
                      className="rounded-2xl bg-gray-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-black"
                    >
                      Add Tag
                    </button>
                  </div>
                  {formData.categoryNames.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.categoryNames.map((tag, index) => (
                        <button
                          key={`${tag}-${index}`}
                          type="button"
                          onClick={() => handleRemoveCategoryName(index)}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gray-700 hover:bg-red-50 hover:text-red-700"
                        >
                          {tag} <Trash2 size={12} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Search metadata</p>
                  <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-gray-900">SEO settings</h3>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">SEO Title</label>
                  <input
                    type="text"
                    placeholder="Search result title"
                    value={formData.seoTitle}
                    onChange={(event) => setField("seoTitle", event.target.value)}
                    className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase text-gray-700">SEO Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short snippet shown on search pages"
                    value={formData.seoDescription}
                    onChange={(event) => setField("seoDescription", event.target.value)}
                    className="w-full resize-none rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
              <h3 className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 text-lg font-black uppercase tracking-tight text-gray-900">
                <Upload size={20} className="text-[#facc15]" /> Product Image and Media
              </h3>

              <div className="space-y-3">
                <div className="relative mx-auto aspect-5/4 w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-100">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      sizes="(max-width: 1280px) 100vw, 420px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                      <Upload size={32} className="mb-2 text-gray-400" />
                      <span className="text-xs font-bold uppercase text-gray-500">Select Product Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                    <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg transition-colors hover:bg-[#facc15]">
                      {imagePreview ? "Change Image" : "Upload Image"}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-tight text-gray-400">
                  Stored locally in uploads/products. Recommended: 800x800px (JPG, PNG, WEBP)
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-gray-700">Gallery Images (Upload from PC)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleGalleryFilesChange}
                    className="w-full rounded-2xl border-none bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wider file:text-white hover:file:bg-black"
                  />
                  <p className="text-[11px] font-semibold text-gray-500">
                    Optional. Selected gallery files will be uploaded automatically before product creation.
                  </p>

                  {galleryFiles.length > 0 ? (
                    <div className="space-y-2">
                      {galleryFiles.map((file, index) => (
                        <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                          <span className="flex-1 truncate text-[11px] font-semibold text-gray-600">{file.name}</span>
                          <button type="button" onClick={() => handleRemoveGalleryFile(index)} className="text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-gray-700">Variant Images</label>
                  <p className="rounded-xl bg-yellow-50 px-3 py-2 text-[11px] font-semibold text-yellow-800">
                    Variant-level image upload can be done via Media API section variants after variant records are created.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-gray-700">Legacy URL Input</label>
                  <input
                    type="text"
                    disabled
                    value="Disabled - use direct upload from your computer"
                    className="w-full rounded-2xl border-none bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
              <h3 className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 text-lg font-black uppercase tracking-tight text-gray-900">
                <Tag size={20} className="text-[#facc15]" /> Publish Controls
              </h3>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isSaving || isUploading}
                  onClick={() => {
                    void submitWithIntent("draft");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-sm font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-black disabled:opacity-50"
                >
                  {isSaving && pendingIntent === "draft" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving && pendingIntent === "draft" ? "Saving Draft..." : "Save Draft"}
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#facc15] py-4 text-sm font-black uppercase tracking-widest text-black shadow-xl transition-all duration-300 hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {isUploading || (isSaving && pendingIntent === "publish") ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isUploading ? "Uploading Files..." : isSaving && pendingIntent === "publish" ? "Publishing..." : "Publish Product"}
                </button>

                <Link
                  href="/admin/products"
                  className="flex w-full items-center justify-center rounded-2xl bg-gray-100 py-4 text-sm font-black uppercase tracking-widest text-gray-700 transition-all duration-300 hover:bg-gray-200"
                >
                  Cancel
                </Link>
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Variant setup</p>
              <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-gray-900">Attributes and generated variants</h3>
            </div>
            <button
              type="button"
              onClick={handleGenerateVariants}
              disabled={!formData.hasVariants}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-black uppercase tracking-wider text-gray-900 transition-colors hover:bg-[#facc15] disabled:opacity-50"
            >
              <WandSparkles size={14} /> Generate
            </button>
          </div>

          {!formData.hasVariants ? (
            <p className="text-sm font-semibold text-gray-500">
              Enable Variant Product in Basic Product Details to configure attributes and variant rows.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                {formData.attributes.map((attribute, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-[1fr_minmax(0,2fr)_auto]">
                    <input
                      type="text"
                      placeholder="Attribute name (e.g. Size)"
                      value={attribute.name}
                      onChange={(event) => handleAttributeChange(index, "name", event.target.value)}
                      className="rounded-2xl border-none bg-gray-50 px-4 py-3 text-sm font-bold uppercase text-gray-800 outline-none focus:ring-2 focus:ring-[#facc15]"
                    />
                    <input
                      type="text"
                      placeholder="Values comma-separated (e.g. 250g, 500g)"
                      value={attribute.valuesText}
                      onChange={(event) => handleAttributeChange(index, "valuesText", event.target.value)}
                      className="rounded-2xl border-none bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#facc15]"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="rounded-xl p-3 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAttribute}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-black uppercase tracking-wider text-gray-900 transition-colors hover:bg-[#facc15]"
              >
                <Plus size={14} /> Add Attribute
              </button>

              {formData.variants.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search variants by label or SKU"
                      value={variantSearch}
                      onChange={(event) => setVariantSearch(event.target.value)}
                      className="w-full rounded-2xl border-none bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#facc15]"
                    />
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <div className="max-h-125 overflow-auto">
                      <table className="w-full min-w-230 border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider">Use</th>
                            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider">Variant</th>
                            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider">SKU</th>
                            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider">Compare</th>
                            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider">Stock</th>
                            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {filteredVariants.map((variant) => {
                            const rowIndex = formData.variants.findIndex((entry) => entry.id === variant.id);

                            return (
                              <tr key={variant.id} className="hover:bg-gray-50/60">
                                <td className="px-4 py-3 align-top">
                                  <input
                                    type="checkbox"
                                    checked={variant.selected}
                                    onChange={(event) => handleVariantFieldChange(rowIndex, "selected", event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-[#facc15]"
                                  />
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <p className="font-black uppercase tracking-tight text-gray-800">{variant.combinationLabel}</p>
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <input
                                    type="text"
                                    value={variant.sku}
                                    onChange={(event) => handleVariantFieldChange(rowIndex, "sku", event.target.value)}
                                    className="w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#facc15]"
                                  />
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={variant.price}
                                    onChange={(event) => handleVariantFieldChange(rowIndex, "price", event.target.value)}
                                    className="w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#facc15]"
                                  />
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={variant.comparePrice}
                                    onChange={(event) => handleVariantFieldChange(rowIndex, "comparePrice", event.target.value)}
                                    className="w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#facc15]"
                                  />
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <input
                                    type="number"
                                    min={0}
                                    value={variant.stock}
                                    onChange={(event) => handleVariantFieldChange(rowIndex, "stock", event.target.value)}
                                    className="w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#facc15]"
                                  />
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <select
                                    value={variant.status}
                                    onChange={(event) => handleVariantFieldChange(rowIndex, "status", event.target.value as ProductVariant["status"])}
                                    className="w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#facc15]"
                                  >
                                    {VARIANT_STATUS_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-tight text-gray-400">
                    Tip: Uncheck rows you do not want to publish.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </form>
    </div>
  );
}
