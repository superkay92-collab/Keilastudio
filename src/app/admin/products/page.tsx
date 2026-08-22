"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, X, Check, Search,
  ImageOff, ToggleLeft, ToggleRight, Star, Package, Upload, EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Product, LengthOption } from "@/types";
import { isPublishedProduct } from "@/lib/publishedProduct";
import clsx from "clsx";

const CATEGORIES = [
  "extensions", "closures-frontals", "wigs", "hair-care",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  extensions: "Extensions", "closures-frontals": "Closures & Frontals",
  wigs: "Wigs", "hair-care": "Hair Care",
  // legacy labels kept for display of older products
  bundles: "Bundles", closures: "Closures", nails: "Nails",
};

const EMPTY_FORM: Omit<Product, "id"> = {
  name: "",
  category: "extensions", // default to first canonical category
  price: 0,
  images: [],
  description: "",
  specs: { length: "", texture: "" },
  availableLengths: [],
  inStock: true,
  featured: false,
};

function Thumb({ src }: { src: string }) {
  const [err, setErr] = useState(false);
  if (!src || err)
    return (
      <div className="w-12 h-14 bg-cream flex items-center justify-center rounded-sm flex-shrink-0">
        <ImageOff size={16} className="text-muted" />
      </div>
    );
  return (
    <div className="relative w-12 h-14 flex-shrink-0 overflow-hidden rounded-sm bg-cream">
      <Image src={src} alt="" fill className="object-cover" sizes="48px" onError={() => setErr(true)} />
    </div>
  );
}

function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-cream w-full max-w-sm rounded-sm p-6 shadow-xl">
        <h3 className="font-semibold mb-2">Delete product?</h3>
        <p className="text-sm text-muted mb-6">
          <span className="font-medium text-charcoal">{name}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-cream-dark py-2 text-sm hover:bg-cream-dark transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2 text-sm hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({
  initial, onSave, onClose, loading,
}: {
  initial: Omit<Product, "id"> & { id?: string };
  onSave: (data: Omit<Product, "id"> & { id?: string }) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [imagesText, setImagesText] = useState(initial.images?.join("\n") ?? "");
  const [lengthsText, setLengthsText] = useState(initial.availableLengths?.join(", ") ?? "");
  const [tiers, setTiers] = useState<LengthOption[]>(initial.lengths ?? []);
  const [uploading, setUploading] = useState(false);
  const set = (k: keyof typeof form, v: unknown) => setForm((prev) => ({ ...prev, [k]: v }));

  function updateTier(idx: number, patch: Partial<LengthOption>) {
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }
  function addTier() {
    setTiers((prev) => [...prev, { inches: 0, fallsAt: "", price: 0 }]);
  }
  function removeTier(idx: number) {
    setTiers((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", form.category);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { const { error } = await res.json(); toast.error(error); return; }
      const { path } = await res.json();
      setImagesText((prev) => prev.trim() ? `${prev.trim()}\n${path}` : path);
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (form.price < 0) { toast.error("Price must be 0 or more"); return; }
    const cleanTiers = tiers
      .filter((t) => Number.isFinite(t.inches) && t.inches > 0 && Number.isFinite(t.price) && t.price > 0)
      .sort((a, b) => a.inches - b.inches);
    onSave({
      ...form,
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      availableLengths: lengthsText.split(",").map((s) => s.trim()).filter(Boolean),
      lengths: cleanTiers.length > 0 ? cleanTiers : undefined,
    });
  }

  const isEdit = !!initial.id;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
      <div className="bg-cream w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark flex-shrink-0">
          <h2 className="font-bold text-lg">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-1 hover:opacity-60"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Product Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal"
              placeholder="e.g. Raw Virgin Body Wave Bundle" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value as Product["category"])}
                className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Price (GH₵) *</label>
              <input type="number" min={0} step={1} value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Images
              </label>
              <label className={clsx(
                "flex items-center gap-1.5 text-xs border border-cream-dark px-3 py-1.5 cursor-pointer transition-colors",
                uploading ? "opacity-50 pointer-events-none" : "hover:border-charcoal"
              )}>
                {uploading
                  ? <><span className="animate-pulse">Uploading…</span></>
                  : <><Upload size={11} /> Upload photo</>}
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            <textarea rows={3} value={imagesText} onChange={(e) => setImagesText(e.target.value)}
              className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal font-mono text-xs resize-none"
              placeholder={"/uploads/extensions/img.jpg\n/uploads/wigs/img.jpg"} />
            <p className="text-[10px] text-muted mt-1">One path per line — or use Upload to add photos directly.</p>
            {imagesText.split("\n").filter(Boolean).length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagesText.split("\n").map((s) => s.trim()).filter(Boolean).map((src, i) => <Thumb key={i} src={src} />)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none"
              placeholder="Describe the product..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Size / Length</label>
              <input value={form.specs.length} onChange={(e) => set("specs", { ...form.specs, length: e.target.value })}
                className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal"
                placeholder='18" or 250ml' />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Texture</label>
              <input value={form.specs.texture} onChange={(e) => set("specs", { ...form.specs, texture: e.target.value })}
                className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal"
                placeholder="Body Wave" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Available Sizes / Lengths <span className="font-normal normal-case text-muted">(comma-separated)</span>
            </label>
            <input value={lengthsText} onChange={(e) => setLengthsText(e.target.value)}
              className="w-full border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-charcoal"
              placeholder='12", 14", 16", 18", 20"' />
          </div>

          <div className="border border-cream-dark bg-white/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Length tiers with per-length pricing (optional)
              </label>
              <button
                type="button"
                onClick={addTier}
                className="flex items-center gap-1 text-xs border border-cream-dark px-2 py-1 hover:border-charcoal"
              >
                <Plus size={11} /> Add tier
              </button>
            </div>
            {tiers.length === 0 ? (
              <p className="text-[11px] text-muted">
                Leave empty to use the single price above. Add rows here for wigs/extensions with
                different prices per length. If present, this replaces the flat price on the product page.
              </p>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-[70px_1fr_90px_28px] gap-2 text-[10px] uppercase tracking-wider text-muted">
                  <span>Inches</span>
                  <span>Falls at (optional)</span>
                  <span>Price GH₵</span>
                  <span></span>
                </div>
                {tiers.map((t, i) => (
                  <div key={i} className="grid grid-cols-[70px_1fr_90px_28px] gap-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={t.inches || ""}
                      onChange={(e) => updateTier(i, { inches: Number(e.target.value) })}
                      className="border border-cream-dark bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-charcoal"
                      placeholder="18"
                    />
                    <input
                      value={t.fallsAt ?? ""}
                      onChange={(e) => updateTier(i, { fallsAt: e.target.value })}
                      className="border border-cream-dark bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-charcoal"
                      placeholder="Mid-back"
                    />
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={t.price || ""}
                      onChange={(e) => updateTier(i, { price: Number(e.target.value) })}
                      className="border border-cream-dark bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-charcoal"
                      placeholder="1450"
                    />
                    <button
                      type="button"
                      onClick={() => removeTier(i)}
                      className="text-muted hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <button type="button" onClick={() => set("inStock", !form.inStock)} className="flex items-center gap-2 text-sm">
              {form.inStock ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-muted" />}
              <span className={form.inStock ? "text-green-700 font-medium" : "text-muted"}>In Stock</span>
            </button>
            <button type="button" onClick={() => set("featured", !form.featured)} className="flex items-center gap-2 text-sm">
              {form.featured ? <ToggleRight size={24} className="text-amber-500" /> : <ToggleLeft size={24} className="text-muted" />}
              <span className={form.featured ? "text-amber-600 font-medium" : "text-muted"}>Featured</span>
            </button>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-cream-dark flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-cream-dark py-2.5 text-sm hover:bg-cream-dark transition-colors">Cancel</button>
          <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={loading}
            className="flex-1 bg-charcoal text-cream py-2.5 text-sm font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <span className="animate-pulse">Saving…</span> : <><Check size={14} /> {isEdit ? "Save Changes" : "Add Product"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsCMS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [modal, setModal] = useState<{ open: boolean; product: (Omit<Product, "id"> & { id?: string }) | null }>({ open: false, product: null });
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      setProducts(await res.json());
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchCat = filterCat === "all" || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  async function handleSave(data: Omit<Product, "id"> & { id?: string }) {
    setSaving(true);
    try {
      if (data.id) {
        await fetch(`/api/products/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        toast.success("Product updated — shop refreshing…");
      } else {
        await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        toast.success("Product added — shop refreshing…");
      }
      setModal({ open: false, product: null });
      await fetchProducts();
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  }

  async function handleDelete(product: Product) {
    setSaving(true);
    try {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      toast.success(`"${product.name}" deleted`);
      setConfirmDelete(null);
      await fetchProducts();
    } catch { toast.error("Delete failed"); }
    finally { setSaving(false); }
  }

  async function handleToggle(product: Product, field: "inStock" | "featured") {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !product[field] }),
      });
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, [field]: !p[field] } : p));
    } catch { toast.error("Update failed"); }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-xs text-muted mt-0.5">
            {products.length} total · {products.filter(isPublishedProduct).length} live on shop
            {products.length - products.filter(isPublishedProduct).length > 0
              ? ` · ${products.length - products.filter(isPublishedProduct).length} draft (hidden)`
              : ""}
          </p>
        </div>
        <button onClick={() => setModal({ open: true, product: { ...EMPTY_FORM } })}
          className="flex items-center gap-2 bg-charcoal text-cream px-5 py-2.5 text-sm font-medium hover:bg-charcoal/90 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-8 pr-3 py-2 border border-cream-dark bg-white text-sm focus:outline-none focus:border-charcoal" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat("all")}
            className={clsx("px-3 py-1.5 text-xs font-medium border transition-colors", filterCat === "all" ? "bg-charcoal text-cream border-charcoal" : "border-cream-dark hover:border-charcoal")}>
            All ({products.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = products.filter((p) => p.category === c).length;
            if (count === 0) return null;
            return (
              <button key={c} onClick={() => setFilterCat(c)}
                className={clsx("px-3 py-1.5 text-xs font-medium border transition-colors", filterCat === c ? "bg-charcoal text-cream border-charcoal" : "border-cream-dark hover:border-charcoal")}>
                {CATEGORY_LABELS[c]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-cream-dark animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-cream-dark p-16 text-center text-muted text-sm">
          {search || filterCat !== "all" ? "No products match your filter." : "No products yet. Add your first one!"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div key={product.id} className="bg-cream-dark flex items-center gap-4 p-3 sm:p-4">
              <Thumb src={product.images?.[0] ?? ""} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  {!isPublishedProduct(product) && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-medium" title="Hidden from shop until it has a real name and price > 0">
                      <EyeOff size={9} /> Draft
                    </span>
                  )}
                  {product.featured && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                      <Star size={9} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5 capitalize">
                  {CATEGORY_LABELS[product.category] ?? product.category}
                  {product.specs.length ? ` · ${product.specs.length}` : ""}
                  {product.specs.texture ? ` · ${product.specs.texture}` : ""}
                </p>
                <p className="text-xs font-semibold mt-0.5">GH₵ {product.price.toLocaleString()}</p>
              </div>

              <button onClick={() => handleToggle(product, "inStock")}
                title={product.inStock ? "Click to mark out of stock" : "Click to mark in stock"}
                className={clsx("flex items-center gap-1 text-[11px] px-2 py-1 rounded font-medium transition-colors shrink-0",
                  product.inStock ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200")}>
                <Package size={11} /> {product.inStock ? "In Stock" : "Out of Stock"}
              </button>

              <button onClick={() => handleToggle(product, "featured")}
                title={product.featured ? "Remove from featured" : "Mark as featured"}
                className={clsx("p-1.5 rounded transition-colors shrink-0",
                  product.featured ? "text-amber-500 hover:text-amber-700" : "text-muted hover:text-amber-400")}>
                <Star size={16} fill={product.featured ? "currentColor" : "none"} />
              </button>

              <button onClick={() => setModal({ open: true, product: { ...product } })}
                className="p-1.5 text-muted hover:text-charcoal transition-colors shrink-0" title="Edit">
                <Pencil size={15} />
              </button>

              <button onClick={() => setConfirmDelete(product)}
                className="p-1.5 text-muted hover:text-red-600 transition-colors shrink-0" title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted mt-4 text-right">Showing {filtered.length} of {products.length} products</p>
      )}

      {modal.open && modal.product && (
        <ProductModal initial={modal.product} onSave={handleSave} onClose={() => setModal({ open: false, product: null })} loading={saving} />
      )}

      {confirmDelete && (
        <ConfirmDialog name={confirmDelete.name} onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}

