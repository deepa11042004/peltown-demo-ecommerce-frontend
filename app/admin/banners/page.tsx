"use client";
import React, { useEffect, useState } from "react";
import { Plus, Image as ImageIcon, Trash2, Link2, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { heroBannerApi, uploadApi } from "@/lib/api";
import { toast } from "react-hot-toast";

type HeroBanner = {
  id: number | string;
  title: string;
  subtitle?: string | null;
  link?: string | null;
  image: string;
  isActive: boolean;
  sortOrder?: number | null;
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

const resolveBannerImage = (value: string) => {
  if (!value) {
    return "/Img/hero.webp";
  }

  if (value.startsWith("http")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newLink, setNewLink] = useState("/products");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBanners = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await heroBannerApi.listAdmin();
        const items = (response.data?.data || []) as HeroBanner[];

        if (!mounted) {
          return;
        }

        setBanners(items);
      } catch (requestError: unknown) {
        if (mounted) {
          setLoadError(getErrorMessage(requestError, "Failed to load hero banners"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBanners();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleToggleActive = async (banner: HeroBanner) => {
    setTogglingId(banner.id);

    try {
      const response = await heroBannerApi.update(banner.id, { isActive: !banner.isActive });
      const updated = response.data?.data as HeroBanner | undefined;

      setBanners((previous) =>
        previous.map((entry) => (String(entry.id) === String(banner.id) ? (updated || entry) : entry)),
      );
      toast.success(updated?.isActive ? "Banner activated" : "Banner deactivated");
    } catch (requestError: unknown) {
      toast.error(getErrorMessage(requestError, "Failed to update banner"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (banner: HeroBanner) => {
    if (!confirm("Are you sure you want to delete this hero banner?")) {
      return;
    }

    setDeletingId(banner.id);

    try {
      await heroBannerApi.remove(banner.id);
      setBanners((previous) => previous.filter((entry) => String(entry.id) !== String(banner.id)));
      toast.success("Hero banner deleted");
    } catch (requestError: unknown) {
      toast.error(getErrorMessage(requestError, "Failed to delete banner"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleAddBanner = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      toast.error("Banner title is required");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a hero banner image to upload");
      return;
    }

    setIsSaving(true);

    try {
      setIsUploading(true);
      const uploadResponse = await uploadApi.uploadHeroBannerImage(selectedFile, trimmedTitle);
      const imagePath = uploadResponse.data?.data?.path as string | undefined;

      if (!imagePath) {
        throw new Error("Image upload failed");
      }

      setIsUploading(false);

      const createResponse = await heroBannerApi.create({
        title: trimmedTitle,
        subtitle: newSubtitle.trim() || null,
        link: newLink.trim() || null,
        image: imagePath,
        isActive: true,
      });
      const created = createResponse.data?.data as HeroBanner | undefined;

      if (created) {
        setBanners((previous) => [created, ...previous]);
      }

      setIsAddModalOpen(false);
      setNewTitle("");
      setNewSubtitle("");
      setNewLink("/products");
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success("Hero banner created");
    } catch (requestError: unknown) {
      toast.error(getErrorMessage(requestError, "Failed to create banner"));
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Hero Slider</h2>
          <p className="text-gray-500 font-medium text-sm">Upload and manage hero banners displayed on the storefront slider.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gray-900 text-[#facc15] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-[#facc15]/20 cursor-pointer"
        >
          <Plus size={18} />
          Upload Banner
        </button>
      </div>

      {/* Grid view of banners */}
      {loading ? (
        <div className="p-12 flex items-center justify-center gap-3 text-gray-500 font-bold text-sm uppercase tracking-widest">
          <Loader2 size={18} className="animate-spin" /> Loading hero banners...
        </div>
      ) : loadError ? (
        <div className="p-12 text-center text-sm font-bold text-red-600">{loadError}</div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center text-sm font-bold text-gray-500">No hero banners yet. Upload the first slide.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden flex flex-col group">
              <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                <Image
                  src={resolveBannerImage(banner.image)}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    disabled={togglingId === banner.id}
                    className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                      banner.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                    } ${togglingId === banner.id ? "opacity-70" : ""}`}
                    title={banner.isActive ? "Deactivate Banner" : "Activate Banner"}
                  >
                    {banner.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {banner.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-md">{banner.title}</h3>
                  {banner.subtitle ? (
                    <p className="text-xs font-semibold text-gray-200 mt-1 drop-shadow-sm">{banner.subtitle}</p>
                  ) : null}
                </div>
              </div>

              <div className="p-6 flex items-center justify-between bg-white border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 truncate max-w-xs">
                  <Link2 size={16} className="text-[#facc15] shrink-0" />
                  <span className="truncate">{banner.link || "/shop"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(banner)}
                    disabled={deletingId === banner.id}
                    className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                    title="Delete Banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 z-50 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black uppercase text-gray-900">Upload Hero Banner</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="font-bold text-gray-400 hover:text-gray-900 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddBanner} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Eid Mega Discount"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Subtitle / Offer Details</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={e => setNewSubtitle(e.target.value)}
                  placeholder="e.g. Save flat 30% on premium almonds"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Target Link URL</label>
                <input
                  type="text"
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  placeholder="/products?category=dry-fruits"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Banner Graphic</label>
                <label className="relative w-full h-36 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-[#facc15] transition-colors cursor-pointer overflow-hidden">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Hero banner preview"
                      fill
                      sizes="100vw"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <>
                      <ImageIcon size={32} className="mb-2 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">Click to browse or drag image file</span>
                      <span className="text-[10px] text-gray-400">1920x800px recommended (WEBP/PNG)</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 rounded-full font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-6 py-3 rounded-full font-black bg-black hover:bg-gray-900 text-[#facc15] uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-70"
                >
                  {isUploading ? "Uploading..." : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
