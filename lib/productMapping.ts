export type ApiCategory = {
  id: number;
  name: string;
  slug?: string;
};

export type ApiInventory = {
  quantity?: number;
};

export type ApiVariant = {
  id?: number;
  title?: string | null;
  sku?: string | null;
  price?: string | number;
  comparePrice?: string | number | null;
  status?: "active" | "inactive" | string;
  image?: string | null;
  media?: ApiMedia[];
  inventory?: ApiInventory | null;
  attributeValues?: ApiVariantAttributeValue[];
};

export type ApiAttributeRef = {
  id?: number;
  name?: string;
  slug?: string;
};

export type ApiAttributeValueRef = {
  id?: number;
  value?: string;
  valueSlug?: string;
};

export type ApiVariantAttributeValue = {
  id?: number;
  attribute?: ApiAttributeRef | null;
  attributeValue?: ApiAttributeValueRef | null;
};

export type ApiMedia = {
  url?: string;
};

export type ApiMetaEntry = {
  metaKey?: string;
  metaValue?: string | null;
  valueType?: "string" | "number" | "boolean" | "json";
};

export type ApiProduct = {
  id: number | string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string | null;
  productType?: string;
  hasVariants?: boolean;
  status?: "active" | "inactive" | string;
  thumbnail?: string | null;
  minPrice?: string | number;
  totalStock?: string | number;
  categories?: ApiCategory[];
  variants?: ApiVariant[];
  media?: ApiMedia[];
  metaEntries?: ApiMetaEntry[];
};

export type UiSpec = {
  label: string;
  value: string;
};

export type UiProduct = {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  priceValue: number;
  oldPrice?: string;
  oldPriceValue: number | null;
  stock: number;
  category: string;
  productType: string;
  hasVariants: boolean;
  variantCount: number;
  status: string;
  image: string;
  defaultVariantId: number | null;
  rating: number;
  benefits: string[];
  specs: UiSpec[];
};

export type UiVariant = {
  id: number;
  title: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  image: string;
  stock: number;
  status: string;
  attributes: UiSpec[];
};

export type UiProductDetail = UiProduct & {
  gallery: string[];
  variants: UiVariant[];
};

const FALLBACK_IMAGE = "/Img/walnuts.jpg";
const BROKEN_PLACEHOLDER_HOSTS = new Set(["cdn.example.com"]);

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

const normalizeImageSrc = (rawSrc: string) => {
  const src = rawSrc.trim();

  if (!src) {
    return "";
  }

  if (src.startsWith("/")) {
    if (src.startsWith("/uploads/") && UPLOADS_BASE_URL) {
      return `${UPLOADS_BASE_URL}${src}`;
    }

    return src;
  }

  if (src.startsWith("data:image/")) {
    return src;
  }

  try {
    const parsedUrl = new URL(src);

    if (BROKEN_PLACEHOLDER_HOSTS.has(parsedUrl.hostname)) {
      return "";
    }

    if (
      (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") &&
      parsedUrl.pathname.startsWith("/uploads/")
    ) {
      if (UPLOADS_BASE_URL) {
        return `${UPLOADS_BASE_URL}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }

      // Fallback to local path when no public uploads base is configured.
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }

    return src;
  } catch {
    if (src.startsWith("uploads/")) {
      if (UPLOADS_BASE_URL) {
        return `${UPLOADS_BASE_URL}/${src}`;
      }

      return `/${src}`;
    }

    return src;
  }
};

const parseMetaValue = (entry: ApiMetaEntry) => {
  const rawValue = entry.metaValue;

  if (rawValue === null || typeof rawValue === "undefined") {
    return null;
  }

  if (entry.valueType === "json") {
    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  if (entry.valueType === "number") {
    const numberValue = Number(rawValue);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  if (entry.valueType === "boolean") {
    return rawValue === "true";
  }

  return rawValue;
};

const getMetaMap = (entries: ApiMetaEntry[] = []) => {
  const result: Record<string, unknown> = {};

  for (const entry of entries) {
    const key = (entry.metaKey || "").trim();
    if (!key) {
      continue;
    }

    result[key] = parseMetaValue(entry);
  }

  return result;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatPrice = (value: unknown) => {
  const numberValue = toNumber(value, 0);
  return numberValue.toFixed(2);
};

const resolveImage = (product: ApiProduct) => {
  const firstVariantImage = (product.variants || [])
    .map((variant) => variant.image || "")
    .find(Boolean);

  const firstMediaUrl = (product.media || [])
    .map((media) => media.url || "")
    .find(Boolean);

  const candidates = [
    product.thumbnail || "",
    firstVariantImage || "",
    firstMediaUrl || "",
  ];

  for (const candidate of candidates) {
    const normalized = normalizeImageSrc(candidate);

    if (normalized) {
      return normalized;
    }
  }

  return FALLBACK_IMAGE;
};

const resolveGallery = (product: ApiProduct) => {
  const gallery = new Set<string>();

  const pushIfValid = (value: string) => {
    const normalized = normalizeImageSrc(value);
    if (normalized) {
      gallery.add(normalized);
    }
  };

  pushIfValid(String(product.thumbnail || ""));

  for (const media of product.media || []) {
    pushIfValid(String(media.url || ""));
  }

  for (const variant of product.variants || []) {
    pushIfValid(String(variant.image || ""));
    for (const media of variant.media || []) {
      pushIfValid(String(media.url || ""));
    }
  }

  if (gallery.size === 0) {
    gallery.add(FALLBACK_IMAGE);
  }

  return [...gallery];
};

const resolveStock = (product: ApiProduct) => {
  const totalStock = toNumber(product.totalStock, NaN);

  if (Number.isFinite(totalStock)) {
    return totalStock;
  }

  return (product.variants || []).reduce((sum, variant) => {
    return sum + toNumber(variant.inventory?.quantity, 0);
  }, 0);
};

const resolvePrice = (product: ApiProduct) => {
  const listMinPrice = toNumber(product.minPrice, NaN);

  if (Number.isFinite(listMinPrice)) {
    return listMinPrice;
  }

  const variantPrices = (product.variants || [])
    .map((variant) => toNumber(variant.price, NaN))
    .filter((price) => Number.isFinite(price));

  if (variantPrices.length > 0) {
    return Math.min(...variantPrices);
  }

  return 0;
};

const resolveComparePrice = (product: ApiProduct) => {
  const variantComparePrices = (product.variants || [])
    .map((variant) => toNumber(variant.comparePrice, NaN))
    .filter((value) => Number.isFinite(value));

  if (variantComparePrices.length > 0) {
    return Math.max(...variantComparePrices);
  }

  return null;
};

const resolveDefaultVariantId = (product: ApiProduct) => {
  const variants = product.variants || [];

  const inStockVariant = variants.find((variant) => {
    const variantId = toNumber(variant.id, NaN);
    return Number.isFinite(variantId) && toNumber(variant.inventory?.quantity, 0) > 0;
  });

  if (inStockVariant?.id) {
    return Number(inStockVariant.id);
  }

  const firstVariant = variants.find((variant) => Number.isFinite(toNumber(variant.id, NaN)));

  return firstVariant?.id ? Number(firstVariant.id) : null;
};

const resolveBenefits = (metaMap: Record<string, unknown>) => {
  const rawBenefits = metaMap.healthBenefits;

  if (Array.isArray(rawBenefits)) {
    const values = rawBenefits.map((entry) => String(entry || "").trim()).filter(Boolean);
    if (values.length > 0) {
      return values;
    }
  }

  return ["Fresh premium quality", "Direct from trusted farms"];
};

const resolveSpecs = (metaMap: Record<string, unknown>) => {
  const rawSpecs = metaMap.specifications;

  if (Array.isArray(rawSpecs)) {
    const values = rawSpecs
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const maybeSpec = item as { label?: unknown; value?: unknown };
        const label = String(maybeSpec.label || "").trim();
        const value = String(maybeSpec.value || "").trim();

        if (!label || !value) {
          return null;
        }

        return {
          label,
          value,
        };
      })
      .filter(Boolean) as UiSpec[];

    if (values.length > 0) {
      return values;
    }
  }

  return [
    { label: "Storage", value: "Cool and dry place" },
    { label: "Quality", value: "Premium" },
  ];
};

const resolveStatusLabel = (status: string | undefined, stock: number) => {
  if (status === "inactive") {
    return "Inactive";
  }

  if (stock <= 0) {
    return "Out of Stock";
  }

  if (stock <= 10) {
    return "Low Stock";
  }

  return "In Stock";
};

export const mapApiProductToUiProduct = (product: ApiProduct): UiProduct => {
  const metaMap = getMetaMap(product.metaEntries || []);
  const stock = resolveStock(product);
  const priceNumber = resolvePrice(product);
  const comparePriceNumber = resolveComparePrice(product);

  return {
    id: product.id,
    slug: String(product.slug || ""),
    name: String(product.title || "Untitled Product"),
    description: String(product.description || ""),
    shortDescription: String(product.shortDescription || product.description || ""),
    price: formatPrice(priceNumber),
    priceValue: priceNumber,
    oldPrice: comparePriceNumber && comparePriceNumber > priceNumber ? formatPrice(comparePriceNumber) : undefined,
    oldPriceValue: comparePriceNumber,
    stock,
    category: product.categories?.[0]?.name || "Uncategorized",
    productType: String(product.productType || "simple"),
    hasVariants: Boolean(product.hasVariants),
    variantCount: Array.isArray(product.variants) ? product.variants.length : 0,
    status: resolveStatusLabel(String(product.status || "active"), stock),
    image: resolveImage(product),
    defaultVariantId: resolveDefaultVariantId(product),
    rating: 4.5,
    benefits: resolveBenefits(metaMap),
    specs: resolveSpecs(metaMap),
  };
};

const mapVariantToUiVariant = (variant: ApiVariant): UiVariant | null => {
  const variantId = toNumber(variant.id, NaN);
  if (!Number.isFinite(variantId)) {
    return null;
  }

  const attributePairs = (variant.attributeValues || [])
    .map((entry) => {
      const label = String(entry.attribute?.name || "").trim();
      const value = String(entry.attributeValue?.value || "").trim();

      if (!label || !value) {
        return null;
      }

      return { label, value };
    })
    .filter(Boolean) as UiSpec[];

  const variantGalleryImage = (variant.media || [])
    .map((media) => normalizeImageSrc(String(media.url || "")))
    .find(Boolean);

  return {
    id: Number(variantId),
    title: String(variant.title || "Standard"),
    sku: String(variant.sku || ""),
    price: toNumber(variant.price, 0),
    comparePrice: (() => {
      const comparePrice = toNumber(variant.comparePrice, NaN);
      return Number.isFinite(comparePrice) ? comparePrice : null;
    })(),
    image:
      normalizeImageSrc(String(variant.image || "")) ||
      variantGalleryImage ||
      FALLBACK_IMAGE,
    stock: toNumber(variant.inventory?.quantity, 0),
    status: String(variant.status || "active"),
    attributes: attributePairs,
  };
};

export const mapApiProductToUiProductDetail = (product: ApiProduct): UiProductDetail => {
  const base = mapApiProductToUiProduct(product);
  const mappedVariants = (product.variants || [])
    .map(mapVariantToUiVariant)
    .filter(Boolean) as UiVariant[];

  return {
    ...base,
    variants: mappedVariants,
    variantCount: mappedVariants.length,
    gallery: resolveGallery(product),
    hasVariants: mappedVariants.length > 0 || base.hasVariants,
    defaultVariantId:
      base.defaultVariantId ??
      mappedVariants.find((variant) => variant.stock > 0)?.id ??
      mappedVariants[0]?.id ??
      null,
  };
};
