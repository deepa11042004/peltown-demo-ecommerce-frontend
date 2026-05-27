export type UiSelectionInput = {
  id: string | number;
  name: string;
  price: string | number;
  image: string;
  quantity?: number;
  variantId?: string | number | null;
};

type ApiCartItem = {
  id: number;
  productId: number;
  variantId: number | null;
  product?: {
    title?: string;
    thumbnail?: string | null;
  } | null;
  variant?: {
    title?: string | null;
    image?: string | null;
  } | null;
  quantity: number;
  unitPrice: number;
  latestPrice: number;
  priceChanged?: boolean;
  outOfStock?: boolean;
  availableStock?: number | null;
};

type ApiWishlistItem = {
  id: number;
  productId: number;
  variantId: number | null;
  product?: {
    title?: string;
    thumbnail?: string | null;
  } | null;
  variant?: {
    title?: string | null;
    image?: string | null;
  } | null;
  latestPrice?: number | null;
  inStock?: boolean;
};

export type ContextCartItem = {
  id: string;
  cartItemId: number;
  productId: number;
  variantId: number | null;
  name: string;
  price: number;
  latestPrice: number;
  image: string;
  quantity: number;
  priceChanged: boolean;
  outOfStock: boolean;
  availableStock: number | null;
};

export type ContextWishlistItem = {
  id: string;
  wishlistItemId: number;
  productId: number;
  variantId: number | null;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
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
    const parsed = new URL(src);

    if (
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      parsed.pathname.startsWith("/uploads/")
    ) {
      if (UPLOADS_BASE_URL) {
        return `${UPLOADS_BASE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
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

const normalizeNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/(\d+)(?!.*\d)/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
};

export const buildSelectionKey = (productId: number, variantId?: number | null) => {
  return `product-${productId}:${variantId ?? "simple"}`;
};

const parseSelectionKey = (value: string | number) => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/^product-(\d+):(simple|\d+)$/);
  if (!match) {
    return null;
  }

  return {
    productId: Number(match[1]),
    variantId: match[2] === "simple" ? null : Number(match[2]),
  };
};

export const normalizeSelectionInput = (item: UiSelectionInput) => {
  const selectionKey = parseSelectionKey(item.id);
  const productId = selectionKey?.productId ?? normalizeNumber(item.id);
  const variantId = selectionKey?.variantId ?? normalizeNumber(item.variantId ?? null);

  if (!productId) {
    throw new Error("Unable to resolve product id for shopping action");
  }

  return {
    productId,
    variantId,
    quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    name: item.name,
  };
};

export const normalizeSelectionId = (value: string | number, variantId?: string | number | null) => {
  const selectionKey = parseSelectionKey(value);

  if (selectionKey) {
    return buildSelectionKey(selectionKey.productId, selectionKey.variantId);
  }

  const productId = normalizeNumber(value);

  if (!productId) {
    return String(value);
  }

  return buildSelectionKey(productId, normalizeNumber(variantId ?? null));
};

export const mapCartItem = (item: ApiCartItem): ContextCartItem => {
  const variantLabel = item.variant?.title?.trim();
  const productName = item.product?.title?.trim() || `Product ${item.productId}`;
  const name = variantLabel ? `${productName} - ${variantLabel}` : productName;

  return {
    id: buildSelectionKey(item.productId, item.variantId),
    cartItemId: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name,
    price: Number(item.unitPrice ?? 0),
    latestPrice: Number(item.latestPrice ?? item.unitPrice ?? 0),
    image:
      normalizeImageSrc(item.variant?.image || "") ||
      normalizeImageSrc(item.product?.thumbnail || "") ||
      "/Img/walnuts.jpg",
    quantity: Number(item.quantity ?? 0),
    priceChanged: Boolean(item.priceChanged),
    outOfStock: Boolean(item.outOfStock),
    availableStock:
      typeof item.availableStock === "number" ? item.availableStock : null,
  };
};

export const mapWishlistItem = (item: ApiWishlistItem): ContextWishlistItem => {
  const variantLabel = item.variant?.title?.trim();
  const productName = item.product?.title?.trim() || `Product ${item.productId}`;
  const name = variantLabel ? `${productName} - ${variantLabel}` : productName;

  return {
    id: buildSelectionKey(item.productId, item.variantId),
    wishlistItemId: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name,
    price: Number(item.latestPrice ?? 0),
    image:
      normalizeImageSrc(item.variant?.image || "") ||
      normalizeImageSrc(item.product?.thumbnail || "") ||
      "/Img/walnuts.jpg",
    inStock: item.inStock !== false,
  };
};