"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { Reveal } from "../components/Reveal";
import { useScrolled } from "../hooks/useScrolled";
import { AnimatedWaveDivider } from "../components/AnimatedWaveDivider";
import { PageFade } from "../components/PageFade";
import {
  ShoppingBag, MapPin, Phone, Mail, Check, Instagram,
  ChevronRight, X, Plus, Minus, Copy, Loader2, Search, Menu, Lock,
} from "lucide-react";
import { products as libProducts } from "@/lib/products";

const C = {
  oliveDeep: "#3B4527",
  olive: "#66793F",
  oliveSoft: "#A6B583",
  blush: "#E7C4B5",
  blushPale: "#F6E8DF",
  cream: "#FBF7F0",
  ink: "#28281F",
  white: "#FFFFFF",
};

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
    .f-display { font-family: 'Fraunces', serif; }
    .f-body { font-family: 'Work Sans', sans-serif; }
    .f-mono { font-family: 'IBM Plex Mono', monospace; }
    @keyframes lbZoom { from { opacity:0; transform:scale(0.72); } to { opacity:1; transform:scale(1); } }
  `}</style>
);


function ImageWithSkeleton({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  if (!src || errored) return <div className="w-full h-full skeleton" />;
  return (
    <div className={`relative w-full h-full ${!loaded ? "skeleton" : ""}`}>
      <img src={src} alt={alt} onLoad={() => setLoaded(true)} onError={() => setErrored(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 [image-rendering:-webkit-optimize-contrast] ${className} ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ display: "block", imageRendering: "-webkit-optimize-contrast" }} />
    </div>
  );
}

function WaveUnderline({ color = C.olive, width = 120 }: { color?: string; width?: number }) {
  return (
    <svg viewBox="0 0 120 12" style={{ width, height: 12, display: "block" }}>
      <path d="M2 8 Q 20 0 38 8 T 74 8 T 110 8" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ---------- Data ----------
const CAT_DISPLAY: Record<string, string> = {
  "extensions": "Extensions",
  "closures-frontals": "Closures & Frontals",
  "wigs": "Wigs",
  "hair-care": "Hair Care",
};

function mapProduct(p: (typeof libProducts)[0]) {
  return {
    id: p.id,
    name: p.name,
    category: CAT_DISPLAY[p.category] || p.category,
    texture: "-" as string,
    spec: "" as string,
    price: p.price,
    inStock: p.inStock,
    origin: "-" as string,
    density: "-" as string,
    lengths: [] as string[],
    colors: [] as string[],
    care: "" as string,
    shipping: "2\u20134 business days",
    desc: p.description || "",
    image: p.images?.[0] || "",
  };
}

let PRODUCTS = libProducts.map(mapProduct);

const CATEGORIES = ["All", "Extensions", "Closures & Frontals", "Wigs", "Hair Care"];

const DELIVERY_OPTIONS = [
  { id: "pickup", label: "Pickup — Adjiringanor, East Legon", fee: 0 },
  { id: "accra", label: "Delivery within Accra", fee: 30 },
  { id: "other", label: "Delivery outside Accra", fee: 60 },
];

const STATUS_STEPS = ["Pending Payment", "Payment Confirmed", "Processing", "Ready / Shipped", "Delivered"];

function genOrderId() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KSE-${y}${m}${day}-${rand}`;
}
function cedis(n: number) { return `GH₵ ${n.toFixed(2)}`; }

// ---------- localStorage helpers ----------
function storageSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}
function storageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageListKeys(prefix: string): string[] {
  try { return Object.keys(localStorage).filter((k) => k.startsWith(prefix)); } catch { return []; }
}

// ---------- Types ----------
type CartItem = { productId: string; qty: number };
type Order = {
  id: string; name: string; phone: string; email: string; address: string;
  deliveryOption: string | undefined;
  items: { id: string; name: string; qty: number; price: number }[];
  subtotal: number; deliveryFee: number; total: number;
  paymentMethod: string; reference: string; status: string; createdAt: string;
};

// ---------- Layout ----------
function NavBar({ page, setPage, cartCount }: { page: string; setPage: (p: string) => void; cartCount: number }) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const [bump, setBump] = useState(false);
  const prevCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);
  const links = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "shop", label: "Shop" },
    { id: "track", label: "Track Order" },
  ];
  return (
    <div className={`bg-cream border-b border-olive-soft/30 sticky top-0 z-40 transition-all ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
        <button onClick={() => setPage("home")} className="flex items-center gap-2">
          <img src="/image0.png" alt="Keilas Studio Extension" style={{ width: 40, height: 40, borderRadius: 999, objectFit: "cover" }} />
          <span className="f-display" style={{ color: C.oliveDeep, fontSize: 19, letterSpacing: 0.2 }}>Keilas Studio Extension</span>
        </button>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <button key={l.id} onClick={() => setPage(l.id)} className="f-body"
              style={{ fontSize: 14, fontWeight: 500, color: page === l.id ? C.oliveDeep : C.ink, borderBottom: page === l.id ? `2px solid ${C.olive}` : "2px solid transparent", paddingBottom: 3 }}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage("cart")} className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-olive-deep ${bump ? "cart-bounce" : ""}`}>
            <ShoppingBag size={16} color={C.cream} />
            <span className="f-body" style={{ color: C.cream, fontSize: 13, fontWeight: 600 }}>{cartCount}</span>
          </button>
          <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
            <Menu size={22} color={C.oliveDeep} />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden flex flex-col px-5 pb-4 gap-3">
          {links.map((l) => (
            <button key={l.id} onClick={() => { setPage(l.id); setOpen(false); }} className="f-body text-left" style={{ fontSize: 14, color: C.ink }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SiteFooter({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={{ background: C.oliveDeep }} className="mt-0">
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <span className="f-display" style={{ color: C.blushPale, fontSize: 20 }}>Keilas Studio Extension</span>
          <p className="f-body mt-3" style={{ color: C.oliveSoft, fontSize: 13.5, lineHeight: 1.6 }}>
            Premium hair extensions, curated in Accra for women who don&apos;t compromise on quality.
          </p>
        </div>
        <div className="f-body" style={{ color: C.blushPale, fontSize: 13.5, lineHeight: 2 }}>
          <div className="flex items-center gap-2"><MapPin size={14} /> East Legon, Adjiringanor — Accra, Ghana</div>
          <div className="flex items-center gap-2"><Phone size={14} /> +233 53 051 5474</div>
          <div className="flex items-center gap-2"><Mail size={14} /> thekeilasstudio17@gmail.com</div>
          <a href="https://www.instagram.com/keilas_studio_extensions_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity"><Instagram size={14} /> keilas_studio_extensions_</a>
          <a href="https://www.tiktok.com/@ksewholesalemarket" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
            ksewholesalemarket
          </a>
        </div>
        <div className="f-body" style={{ color: C.blushPale, fontSize: 13.5 }}>
          <button onClick={() => setPage("track")} className="block mb-2 opacity-90">Track an order →</button>
          <button onClick={() => setPage("admin")} className="block opacity-60 text-xs">Staff login</button>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.olive}` }} className="text-center py-4">
        <span className="f-mono" style={{ color: C.oliveSoft, fontSize: 11 }}>© {new Date().getFullYear()} Keilas Studio Extension · Accra, Ghana</span>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 f-body px-5 py-3 rounded-full shadow-lg flex items-center gap-2" style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5 }}>
      <Check size={15} /> {message}
    </div>
  );
}

// ---------- Pages ----------
function HomePage({ setPage, addToCart, notify, onOpen, onZoom }: { setPage: (p: string) => void; addToCart: (id: string) => void; notify: (msg: string) => void; onOpen: (p: typeof PRODUCTS[0]) => void; onZoom: (src: string) => void }) {
  const featured = PRODUCTS.slice(0, 4);
  return (
    <div>
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="f-mono" style={{ color: C.oliveDeep, fontSize: 11.5, letterSpacing: 3.5, fontWeight: 600 }}>ACCRA · EAST LEGON · ADJIRINGANOR</span>
          <h1 className="f-display mt-3" style={{ color: C.oliveDeep, fontSize: 44, lineHeight: 1.08 }}>
            Hair that moves<br />the way you do.
          </h1>
          <WaveUnderline color={C.blush} width={140} />
          <p className="f-body mt-5" style={{ color: C.ink, fontSize: 15.5, lineHeight: 1.7, maxWidth: 440 }}>
            Ethically sourced bundles, closures, frontals and ready-to-wear wigs — hand-checked in our
            East Legon studio before they reach you. Pay by Mobile Money or bank transfer, and track
            your order every step of the way.
          </p>
          <div className="flex gap-3 mt-7">
            <button onClick={() => setPage("shop")} className="f-body px-6 py-3 rounded-full" style={{ background: C.oliveDeep, color: C.cream, fontSize: 14, fontWeight: 600 }}>
              Shop the collection
            </button>
            <button onClick={() => setPage("track")} className="f-body px-6 py-3 rounded-full" style={{ border: `1.5px solid ${C.oliveDeep}`, color: C.oliveDeep, fontSize: 14, fontWeight: 600 }}>
              Track an order
            </button>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 32 }}>
          <img src="/hero.jpeg" alt="Keila's Studio Extensions" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </div>

      <AnimatedWaveDivider color={C.oliveSoft} height={30} />

      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="f-display" style={{ color: C.oliveDeep, fontSize: 26 }}>Studio Favourites</h2>
            <WaveUnderline color={C.olive} width={80} />
          </div>
          <button onClick={() => setPage("shop")} className="f-body flex items-center gap-1" style={{ color: C.olive, fontSize: 13.5, fontWeight: 600 }}>
            View all <ChevronRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((p, i) => <Reveal key={p.id} delay={i * 70}><ProductCardItem product={p} addToCart={addToCart} notify={notify} onOpen={onOpen} onZoom={onZoom} /></Reveal>)}
        </div>

        {/* Quality seals */}
        <div className="mt-8 py-5 flex flex-wrap gap-2.5 justify-center" style={{ borderTop: `1px solid ${C.oliveSoft}55`, borderBottom: `1px solid ${C.oliveSoft}55` }}>
          {["100% Raw Donor Hair", "Intact Cuticles", "Double Drawn Integrity", "Hand-Checked in Studio", "Ethically Sourced"].map((s) => (
            <span key={s} className="f-mono flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ fontSize: 10.5, letterSpacing: 0.8, border: `1px solid ${C.olive}66`, color: C.oliveDeep }}>
              <svg width="7" height="7" viewBox="0 0 8 8" fill={C.olive}><polygon points="4,0 5,3 8,3 5.5,5 6.5,8 4,6 1.5,8 2.5,5 0,3 3,3" /></svg>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: C.blushPale }} className="mt-4">
        <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { t: "Pay your way", d: "MTN MoMo, Telecel Cash, AirtelTigo Money or direct bank transfer." },
            { t: "Order tracking", d: "Follow your order from payment to your doorstep, in real time." },
            { t: "Pickup or delivery", d: "Collect free at Adjiringanor, or have it delivered anywhere in Ghana." },
          ].map((f, i) => (
            <div key={i}>
              <span className="f-mono" style={{ color: C.olive, fontSize: 12 }}>0{i + 1}</span>
              <h3 className="f-display mt-1" style={{ color: C.oliveDeep, fontSize: 18 }}>{f.t}</h3>
              <p className="f-body mt-1.5" style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.6 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.93)" }} onClick={onClose}>
      <img src={src} alt="" className="max-w-[92vw] max-h-[92vh] object-contain rounded-xl [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges]" style={{ animation: "lbZoom .28s cubic-bezier(.22,.68,0,1.2) both", imageRendering: "-webkit-optimize-contrast" }} onClick={(e) => e.stopPropagation()} />
      <button className="absolute top-4 right-4 rounded-full p-2" style={{ background: "rgba(255,255,255,0.15)" }} onClick={onClose}><X size={20} color="#fff" /></button>
    </div>
  );
}

function ProductCardItem({ product, addToCart, notify, onOpen, onZoom }: { product: typeof PRODUCTS[0]; addToCart: (id: string) => void; notify: (msg: string) => void; onOpen: (p: typeof PRODUCTS[0]) => void; onZoom: (src: string) => void }) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col card-hover" style={{ background: C.white, border: `1px solid ${C.oliveSoft}44` }}>
      <div className="aspect-square card-image">
        <button
          onClick={() => onZoom(product.image)}
          className="relative w-full h-full overflow-hidden group isolate flex items-center justify-center cursor-zoom-in select-none transition-all duration-300 active:scale-[0.98] active:duration-75 before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:transition-transform before:duration-1000 before:ease-out"
          style={{ background: C.blushPale }}
        >
          <ImageWithSkeleton src={product.image} alt={product.name} className="transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 pointer-events-none transition-all duration-200 group-hover:bg-white/10 group-active:bg-white/20 group-active:backdrop-blur-[4px] group-active:shadow-[inset_0_4px_12px_rgba(255,255,255,0.3)]" />
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(40,40,31,0.55)" }}>
              <span className="f-body px-3 py-1 rounded-full" style={{ background: C.ink, color: C.cream, fontSize: 11, fontWeight: 600 }}>Out of stock</span>
            </div>
          )}
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1 items-center text-center">
        <span className="f-mono" style={{ color: C.olive, fontSize: 10.5, letterSpacing: 0.5 }}>{product.category.toUpperCase()}</span>
        <button onClick={() => onOpen(product)} className="text-center">
          <h3 className="f-display mt-1" style={{ color: C.oliveDeep, fontSize: 16 }}>{product.name}</h3>
        </button>
        <span className="f-body" style={{ color: C.ink, opacity: 0.65, fontSize: 12.5 }}>{product.texture !== "-" ? `${product.texture} · ${product.spec}` : product.spec}</span>
        <div className="flex flex-col items-center gap-2 mt-3 w-full">
          <span className="f-mono" style={{ color: C.oliveDeep, fontSize: 15, fontWeight: 500 }}>{cedis(product.price)}</span>
          <div className="flex gap-1.5 justify-center">
            <button onClick={() => onOpen(product)} className="f-body px-3 py-1.5 rounded-full" style={{ background: "transparent", border: `1.5px solid ${C.oliveDeep}`, color: C.oliveDeep, fontSize: 12, fontWeight: 600 }}>Details</button>
            {product.inStock && (
              <button onClick={() => { addToCart(product.id); notify(`Added ${product.name} to cart`); }}
                className="f-body px-3 py-1.5 rounded-full" style={{ background: C.oliveDeep, color: C.cream, fontSize: 12.5, fontWeight: 600 }}>
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Product Detail Modal ----------
function ProductModal({ product, onClose, addToCart, notify, onZoom }: { product: typeof PRODUCTS[0]; onClose: () => void; addToCart: (id: string) => void; notify: (msg: string) => void; onZoom: (src: string) => void }) {
  const [selectedLength, setSelectedLength] = useState(product.lengths[0] || product.spec);
  const waMsg = encodeURIComponent(`Hi! I'm interested in the ${product.name}${product.lengths.length ? ` (${selectedLength})` : ""}. Could you give me more details?`);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ background: "rgba(28,28,20,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-t-2xl md:rounded-2xl overflow-y-auto" style={{ background: C.cream, maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.oliveSoft}44` }}>
          <span className="f-mono" style={{ color: C.olive, fontSize: 11, letterSpacing: 1 }}>{product.category.toUpperCase()}</span>
          <button onClick={onClose}><X size={20} color={C.ink} /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* image */}
          <button onClick={() => onZoom(product.image)} className="cursor-zoom-in" style={{ aspectRatio: "1/1", background: C.blushPale, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", imageRendering: "-webkit-optimize-contrast" }} />
          </button>
          {/* details */}
          <div className="px-5 py-5 overflow-y-auto">
            <h2 className="f-display" style={{ color: C.oliveDeep, fontSize: 22 }}>{product.name}</h2>
            <p className="f-body mt-2" style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.7 }}>{product.desc}</p>

            {/* specs grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                product.texture !== "-" && ["Texture", product.texture],
                product.origin !== "-" && ["Origin", product.origin],
                product.density !== "-" && ["Density", product.density],
                ["Shipping", product.shipping],
              ].filter((x): x is string[] => Boolean(x)).map(([k, v]) => (
                <div key={k as string} className="rounded-lg px-3 py-2" style={{ background: C.blushPale }}>
                  <span className="f-mono block" style={{ fontSize: 9.5, color: C.olive, letterSpacing: 1 }}>{(k as string).toUpperCase()}</span>
                  <span className="f-body" style={{ fontSize: 12.5, color: C.oliveDeep, fontWeight: 600 }}>{v as string}</span>
                </div>
              ))}
            </div>

            {/* length selector */}
            {product.lengths.length > 0 && (
              <div className="mt-4">
                <span className="f-body block mb-2" style={{ fontSize: 12, fontWeight: 600, color: C.oliveDeep }}>Length — {selectedLength}</span>
                <div className="flex flex-wrap gap-2">
                  {product.lengths.map((l) => (
                    <button key={l} onClick={() => setSelectedLength(l)} className="f-mono px-3 py-1.5 rounded-full"
                      style={{ fontSize: 11.5, fontWeight: 600, background: selectedLength === l ? C.oliveDeep : C.blushPale, color: selectedLength === l ? C.cream : C.oliveDeep, border: `1px solid ${selectedLength === l ? C.oliveDeep : C.oliveSoft}` }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* colors */}
            {product.colors.length > 0 && (
              <div className="mt-3">
                <span className="f-body block mb-1" style={{ fontSize: 12, fontWeight: 600, color: C.oliveDeep }}>Available colours</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map((c) => (
                    <span key={c} className="f-mono px-2.5 py-1 rounded-full" style={{ fontSize: 11, background: C.blushPale, color: C.oliveDeep }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* care */}
            <div className="mt-4 rounded-lg p-3" style={{ background: C.blushPale }}>
              <span className="f-mono block mb-1" style={{ fontSize: 9.5, color: C.olive, letterSpacing: 1 }}>CARE INSTRUCTIONS</span>
              <p className="f-body" style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.6 }}>{product.care}</p>
            </div>

            {/* price + actions */}
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.oliveSoft}44` }}>
              <span className="f-mono" style={{ fontSize: 22, color: C.oliveDeep, fontWeight: 500 }}>{cedis(product.price)}</span>
              {!product.inStock ? (
                <div className="mt-3 flex gap-2">
                  <a href={`https://wa.me/233530515474?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    className="f-body flex-1 py-3 rounded-full flex items-center justify-center gap-2 text-center" style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5, fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    Ask about restock
                  </a>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { addToCart(product.id); notify(`Added ${product.name} to cart`); onClose(); }}
                    className="f-body flex-1 py-3 rounded-full" style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5, fontWeight: 600 }}>
                    Add to cart
                  </button>
                  <a href={`https://wa.me/233530515474?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    className="f-body px-4 py-3 rounded-full flex items-center justify-center" style={{ background: C.oliveDeep, color: C.cream }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopPage({ addToCart, notify, onOpen, onZoom }: { addToCart: (id: string) => void; notify: (msg: string) => void; onOpen: (p: typeof PRODUCTS[0]) => void; onZoom: (src: string) => void }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const filtered = PRODUCTS.filter((p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="f-display" style={{ color: C.oliveDeep, fontSize: 30 }}>Shop</h1>
      <WaveUnderline color={C.blush} width={90} />
      <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6 mb-7">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full flex-1" style={{ background: C.blushPale }}>
          <Search size={15} color={C.oliveDeep} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hair, wigs, care..."
            className="f-body bg-transparent outline-none flex-1" style={{ fontSize: 13.5, color: C.ink }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className="f-body px-4 py-2 rounded-full"
              style={{ fontSize: 12.5, fontWeight: 600, background: cat === c ? C.oliveDeep : C.white, color: cat === c ? C.cream : C.ink, border: `1.3px solid ${cat === c ? C.oliveDeep : C.oliveSoft}` }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {filtered.map((p, i) => <Reveal key={p.id} delay={i * 50}><ProductCardItem product={p} addToCart={addToCart} notify={notify} onOpen={onOpen} onZoom={onZoom} /></Reveal>)}
      </div>
      {filtered.length === 0 && <p className="f-body text-center py-16" style={{ color: C.ink, opacity: 0.6 }}>No products match that search.</p>}
    </div>
  );
}

function CartPage({ cart, setCart, setPage }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; setPage: (p: string) => void }) {
  const items = cart.map((c) => ({ ...c, product: PRODUCTS.find((p) => p.id === c.productId)! }));
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, qty: Math.max(1, c.qty + delta) } : c).filter((c) => c.qty > 0));
  };
  const remove = (productId: string) => setCart((prev) => prev.filter((c) => c.productId !== productId));
  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="f-display" style={{ color: C.oliveDeep, fontSize: 30 }}>Your Cart</h1>
      <WaveUnderline color={C.blush} width={90} />
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="f-body" style={{ color: C.ink, opacity: 0.6, fontSize: 14 }}>Your cart is empty.</p>
          <button onClick={() => setPage("shop")} className="f-body mt-4 px-5 py-2.5 rounded-full" style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5, fontWeight: 600 }}>Browse the shop</button>
        </div>
      ) : (
        <div className="mt-8">
          {items.map((i) => (
            <div key={i.productId} className="flex items-center gap-4 py-4" style={{ borderBottom: `1px solid ${C.oliveSoft}44` }}>
              <div className="rounded-lg overflow-hidden" style={{ width: 64, height: 64, flexShrink: 0 }}>
                <img src={i.product.image} alt={i.product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: C.blushPale }} />
              </div>
              <div className="flex-1">
                <h3 className="f-display" style={{ color: C.oliveDeep, fontSize: 15 }}>{i.product.name}</h3>
                <span className="f-mono" style={{ color: C.ink, opacity: 0.6, fontSize: 12 }}>{cedis(i.product.price)} each</span>
              </div>
              <div className="flex items-center gap-2 rounded-full px-2 py-1" style={{ background: C.blushPale }}>
                <button onClick={() => updateQty(i.productId, -1)}><Minus size={13} color={C.oliveDeep} /></button>
                <span className="f-mono" style={{ fontSize: 13, width: 18, textAlign: "center" }}>{i.qty}</span>
                <button onClick={() => updateQty(i.productId, 1)}><Plus size={13} color={C.oliveDeep} /></button>
              </div>
              <span className="f-mono" style={{ color: C.oliveDeep, fontSize: 14, width: 80, textAlign: "right" }}>{cedis(i.product.price * i.qty)}</span>
              <button onClick={() => remove(i.productId)}><X size={16} color={C.ink} style={{ opacity: 0.4 }} /></button>
            </div>
          ))}
          <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: `1.5px solid ${C.oliveDeep}` }}>
            <span className="f-body" style={{ fontSize: 15, fontWeight: 600, color: C.oliveDeep }}>Subtotal</span>
            <span className="f-mono" style={{ fontSize: 19, color: C.oliveDeep }}>{cedis(subtotal)}</span>
          </div>
          <button onClick={() => setPage("checkout")} className="f-body w-full mt-6 py-3.5 rounded-full" style={{ background: C.oliveDeep, color: C.cream, fontSize: 14.5, fontWeight: 600 }}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-4">
      <span className="f-body block mb-1.5" style={{ fontSize: 12.5, fontWeight: 600, color: C.oliveDeep }}>{label}</span>
      <input {...props} className="f-body w-full px-3.5 py-2.5 rounded-lg outline-none" style={{ border: `1.3px solid ${C.oliveSoft}88`, fontSize: 13.5, background: C.white }} />
    </label>
  );
}

function CheckoutPage({ cart, setCart, setPage, setLastOrder }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; setPage: (p: string) => void; setLastOrder: (o: Order) => void }) {
  const items = cart.map((c) => ({ ...c, product: PRODUCTS.find((p) => p.id === c.productId)! }));
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [delivery, setDelivery] = useState("pickup");
  const [payMethod, setPayMethod] = useState("momo");
  const [momoNetwork, setMomoNetwork] = useState("MTN MoMo");
  const [reference, setReference] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyField = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedField(id); setTimeout(() => setCopiedField(null), 2000); };

  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.fee || 0;
  const total = subtotal + deliveryFee;
  const canSubmit = form.name && form.phone && (delivery !== "pickup" ? form.address : true) && reference;

  const placeOrder = () => {
    if (!canSubmit) { setError("Please fill in your details and payment reference before placing the order."); return; }
    setError(""); setPlacing(true);
    const order: Order = {
      id: genOrderId(), name: form.name, phone: form.phone, email: form.email,
      address: delivery === "pickup" ? "Pickup — Adjiringanor, East Legon" : form.address,
      deliveryOption: DELIVERY_OPTIONS.find((d) => d.id === delivery)?.label,
      items: items.map((i) => ({ id: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price })),
      subtotal, deliveryFee, total,
      paymentMethod: payMethod === "momo" ? momoNetwork : payMethod === "bitcoin" ? "Bitcoin (BTC)" : "Bank Transfer (GTBank)",
      reference, status: "Pending Payment", createdAt: new Date().toISOString(),
    };
    try {
      storageSet(`order:${order.id}`, JSON.stringify(order));
      setLastOrder(order); setCart([]); setPage("confirmation");
      // Fire-and-forget: email + SMS alerts to client and staff
      fetch("/api/notify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      }).catch(() => {});
    } catch { setError("Something went wrong saving your order. Please try again."); }
    setPlacing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="f-display" style={{ color: C.oliveDeep, fontSize: 30 }}>Checkout</h1>
      <WaveUnderline color={C.blush} width={90} />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mt-8">
        <div className="md:col-span-3">
          <h2 className="f-display mb-3" style={{ color: C.oliveDeep, fontSize: 17 }}>Your details</h2>
          <Field label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ama Owusu" />
          <Field label="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="024 000 0000" />
          <Field label="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />

          <h2 className="f-display mt-6 mb-3" style={{ color: C.oliveDeep, fontSize: 17 }}>Delivery</h2>
          {DELIVERY_OPTIONS.map((d) => (
            <label key={d.id} className="flex items-center justify-between py-2.5 px-3.5 rounded-lg mb-2 cursor-pointer" style={{ border: `1.3px solid ${delivery === d.id ? C.oliveDeep : C.oliveSoft + "66"}` }}>
              <span className="flex items-center gap-2">
                <input type="radio" checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                <span className="f-body" style={{ fontSize: 13.5, color: C.ink }}>{d.label}</span>
              </span>
              <span className="f-mono" style={{ fontSize: 13, color: C.oliveDeep }}>{d.fee === 0 ? "Free" : cedis(d.fee)}</span>
            </label>
          ))}
          {delivery !== "pickup" && <Field label="Delivery address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House number, street, area" />}

          <h2 className="f-display mt-6 mb-3" style={{ color: C.oliveDeep, fontSize: 17 }}>Payment</h2>

          {/* Method tabs */}
          <div className="flex gap-2 mb-5">
            {[
              { id: "momo", label: "Mobile Money" },
              { id: "bank", label: "GTBank" },
              { id: "bitcoin", label: "Bitcoin" },
            ].map((m) => (
              <button key={m.id} onClick={() => setPayMethod(m.id)} className="f-body flex-1 py-2.5 rounded-lg"
                style={{ fontSize: 12.5, fontWeight: 600, background: payMethod === m.id ? C.oliveDeep : C.blushPale, color: payMethod === m.id ? C.cream : C.oliveDeep }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* MTN MoMo */}
          {payMethod === "momo" && (
            <div className="rounded-xl mb-4" style={{ border: `1px solid ${C.oliveSoft}44` }}>
              <div className="flex gap-2 px-4 pt-4 flex-wrap">
                {["MTN MoMo", "Telecel Cash", "AirtelTigo Money"].map((n) => (
                  <button key={n} onClick={() => setMomoNetwork(n)} className="f-body px-3 py-1.5 rounded-full"
                    style={{ fontSize: 11.5, fontWeight: 600, background: momoNetwork === n ? C.oliveDeep : C.blushPale, color: momoNetwork === n ? C.cream : C.oliveDeep }}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="w-1.5 rounded-full shrink-0" style={{ background: "#FFCC00" }} />
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="f-mono block" style={{ fontSize: 9.5, letterSpacing: 1.2, color: C.oliveSoft }}>PHONE NUMBER</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="f-mono" style={{ fontSize: 18, color: C.oliveDeep, fontWeight: 500 }}>0530515474</span>
                        <button onClick={() => copyField("0530515474", "momo-phone")}
                          className="flex items-center gap-1 f-mono px-2.5 py-1 rounded-lg"
                          style={{ fontSize: 10.5, background: copiedField === "momo-phone" ? C.oliveDeep : C.blushPale, color: copiedField === "momo-phone" ? C.cream : C.oliveDeep }}>
                          {copiedField === "momo-phone" ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="f-mono block" style={{ fontSize: 9.5, letterSpacing: 1.2, color: C.oliveSoft }}>ACCOUNT NAME</span>
                      <span className="f-body" style={{ fontSize: 13.5, color: C.oliveDeep, fontWeight: 600 }}>Keila Gloria</span>
                    </div>
                    <p className="f-body" style={{ fontSize: 12, color: C.ink, opacity: 0.7 }}>Send <b>{cedis(total)}</b> via <b>{momoNetwork}</b>, then enter your transaction ID below.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GTBank */}
          {payMethod === "bank" && (
            <div className="rounded-xl mb-4" style={{ border: `1px solid ${C.oliveSoft}44` }}>
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="w-1.5 rounded-full shrink-0" style={{ background: "#E25822" }} />
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="f-mono block" style={{ fontSize: 9.5, letterSpacing: 1.2, color: C.oliveSoft }}>ACCOUNT NUMBER</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="f-mono" style={{ fontSize: 18, color: C.oliveDeep, fontWeight: 500 }}>3216001057814</span>
                        <button onClick={() => copyField("3216001057814", "bank-acc")}
                          className="flex items-center gap-1 f-mono px-2.5 py-1 rounded-lg"
                          style={{ fontSize: 10.5, background: copiedField === "bank-acc" ? C.oliveDeep : C.blushPale, color: copiedField === "bank-acc" ? C.cream : C.oliveDeep }}>
                          {copiedField === "bank-acc" ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="f-mono block" style={{ fontSize: 9.5, letterSpacing: 1.2, color: C.oliveSoft }}>ACCOUNT NAME</span>
                      <span className="f-body" style={{ fontSize: 13.5, color: C.oliveDeep, fontWeight: 600 }}>Keila&apos;s Studio</span>
                    </div>
                    <div>
                      <span className="f-mono block" style={{ fontSize: 9.5, letterSpacing: 1.2, color: C.oliveSoft }}>BANK</span>
                      <span className="f-body" style={{ fontSize: 13.5, color: C.oliveDeep, fontWeight: 600 }}>GTBank (GTCO)</span>
                    </div>
                    <p className="f-body" style={{ fontSize: 12, color: C.ink, opacity: 0.7 }}>Transfer <b>{cedis(total)}</b>, then enter your payment reference below.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bitcoin */}
          {payMethod === "bitcoin" && (
            <div className="rounded-xl mb-4" style={{ border: `1px solid ${C.oliveSoft}44` }}>
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="w-1.5 rounded-full shrink-0" style={{ background: "#F7931A" }} />
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="f-mono block" style={{ fontSize: 9.5, letterSpacing: 1.2, color: C.oliveSoft }}>BTC WALLET ADDRESS</span>
                      <div className="flex items-start gap-2 mt-0.5 flex-wrap">
                        <span className="f-mono break-all" style={{ fontSize: 12.5, color: C.oliveDeep, fontWeight: 500 }}>bc1qew48r44x2pwe3svpzd2wvkeq5nuzh006hw4vv</span>
                        <button onClick={() => copyField("bc1qew48r44x2pwe3svpzd2wvkeq5nuzh006hw4vv", "btc")}
                          className="flex items-center gap-1 f-mono px-2.5 py-1 rounded-lg shrink-0"
                          style={{ fontSize: 10.5, background: copiedField === "btc" ? C.oliveDeep : C.blushPale, color: copiedField === "btc" ? C.cream : C.oliveDeep }}>
                          {copiedField === "btc" ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="f-mono block" style={{ fontSize: 9.5, letterSpacing: 1.2, color: C.oliveSoft }}>NETWORK</span>
                      <span className="f-mono px-2.5 py-1 rounded-full inline-block" style={{ fontSize: 11, background: "#F7931A22", color: "#A0600A", fontWeight: 700 }}>BTC</span>
                    </div>
                    <p className="f-body" style={{ fontSize: 12, color: C.ink, opacity: 0.7 }}>Send <b>{cedis(total)}</b> worth of BTC, then enter your TX hash below.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Screenshot notice */}
          <div className="rounded-xl p-4 mb-4 text-center border border-dashed" style={{ background: C.blushPale, borderColor: C.blush }}>
            <p className="f-body" style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>Please send your payment screenshot after completing the transaction.</p>
            <span className="f-body" style={{ fontSize: 11.5, color: C.ink, opacity: 0.6 }}>Your order timeline initiates immediately upon transfer review.</span>
          </div>

          <Field label={payMethod === "momo" ? "MoMo transaction ID" : payMethod === "bitcoin" ? "Bitcoin TX hash / reference" : "Bank transfer reference / depositor name"}
            value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter the reference from your payment" />
          {error && <p className="f-body mb-3" style={{ color: "#B3452F", fontSize: 12.5 }}>{error}</p>}
          <button onClick={placeOrder} disabled={placing} className="f-body w-full py-3.5 rounded-full flex items-center justify-center gap-2"
            style={{ background: C.oliveDeep, color: C.cream, fontSize: 14.5, fontWeight: 600, opacity: placing ? 0.7 : 1 }}>
            {placing && <Loader2 size={15} className="animate-spin" />} Place Order — {cedis(total)}
          </button>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl p-5" style={{ background: C.blushPale }}>
            <h3 className="f-display mb-3" style={{ color: C.oliveDeep, fontSize: 16 }}>Order summary</h3>
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between f-body py-1.5" style={{ fontSize: 12.5, color: C.ink }}>
                <span>{i.product.name} × {i.qty}</span>
                <span className="f-mono">{cedis(i.product.price * i.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between f-body pt-3 mt-2" style={{ fontSize: 12.5, color: C.ink, borderTop: `1px solid ${C.oliveSoft}66` }}>
              <span>Subtotal</span><span className="f-mono">{cedis(subtotal)}</span>
            </div>
            <div className="flex justify-between f-body py-1" style={{ fontSize: 12.5, color: C.ink }}>
              <span>Delivery</span><span className="f-mono">{deliveryFee === 0 ? "Free" : cedis(deliveryFee)}</span>
            </div>
            <div className="flex justify-between mt-2 pt-2" style={{ borderTop: `1.5px solid ${C.oliveDeep}` }}>
              <span className="f-body" style={{ fontWeight: 600, color: C.oliveDeep, fontSize: 14 }}>Total</span>
              <span className="f-mono" style={{ color: C.oliveDeep, fontSize: 16 }}>{cedis(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationPage({ order, setPage }: { order: Order | null; setPage: (p: string) => void }) {
  if (!order) return <div className="max-w-xl mx-auto px-5 py-20 text-center f-body">No recent order found. <button className="underline" onClick={() => setPage("shop")}>Go shopping</button></div>;
  return (
    <div className="max-w-xl mx-auto px-5 py-16 text-center">
      <div className="mx-auto flex items-center justify-center rounded-full" style={{ width: 60, height: 60, background: C.blush }}>
        <Check size={28} color={C.oliveDeep} />
      </div>
      <h1 className="f-display mt-5" style={{ color: C.oliveDeep, fontSize: 26 }}>Order received!</h1>
      <p className="f-body mt-2" style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.6 }}>
        We&apos;ll confirm your payment shortly. Save your order ID to track its progress anytime.
      </p>
      <div className="mt-6 rounded-xl p-5 text-left" style={{ background: C.blushPale }}>
        <span className="f-body" style={{ fontSize: 12, color: C.ink, opacity: 0.65 }}>Order ID</span>
        <div className="f-mono flex items-center justify-between mt-1" style={{ fontSize: 19, color: C.oliveDeep, fontWeight: 500 }}>
          {order.id} <Copy size={15} color={C.olive} />
        </div>
        <div className="f-body mt-4" style={{ fontSize: 13, color: C.ink }}>Total: <b className="f-mono">{cedis(order.total)}</b></div>
        <div className="f-body mt-1" style={{ fontSize: 13, color: C.ink }}>Payment: {order.paymentMethod}</div>
        <div className="f-body mt-1" style={{ fontSize: 13, color: C.ink }}>{order.deliveryOption}</div>
      </div>
      <div className="flex gap-3 justify-center mt-7">
        <button onClick={() => setPage("track")} className="f-body px-5 py-2.5 rounded-full" style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5, fontWeight: 600 }}>Track this order</button>
        <button onClick={() => setPage("shop")} className="f-body px-5 py-2.5 rounded-full" style={{ border: `1.3px solid ${C.oliveDeep}`, color: C.oliveDeep, fontSize: 13.5, fontWeight: 600 }}>Continue shopping</button>
      </div>
    </div>
  );
}

function TrackOrderPage({ prefillId }: { prefillId?: string }) {
  const [id, setId] = useState(prefillId || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "notfound" | "found">("idle");

  useEffect(() => {
    if (!prefillId) return;
    const target = prefillId.trim();
    if (!target) return;
    setStatus("loading");
    const raw = storageGet(`order:${target}`);
    if (raw) { setOrder(JSON.parse(raw)); setStatus("found"); }
    else { setOrder(null); setStatus("notfound"); }
  }, [prefillId]);

  const lookup = (lookupId?: string) => {
    const target = (lookupId || id).trim();
    if (!target) return;
    setStatus("loading");
    const raw = storageGet(`order:${target}`);
    if (raw) { setOrder(JSON.parse(raw)); setStatus("found"); }
    else { setOrder(null); setStatus("notfound"); }
  };

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="f-display" style={{ color: C.oliveDeep, fontSize: 28 }}>Track your order</h1>
      <WaveUnderline color={C.blush} width={90} />
      <div className="flex gap-2 mt-6">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. KSE-260719-A3F9"
          className="f-mono flex-1 px-4 py-3 rounded-full outline-none" style={{ border: `1.3px solid ${C.oliveSoft}88`, fontSize: 13.5 }} />
        <button onClick={() => lookup()} className="f-body px-5 py-3 rounded-full" style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5, fontWeight: 600 }}>Track</button>
      </div>
      {status === "loading" && <p className="f-body mt-8 text-center" style={{ color: C.ink, opacity: 0.6 }}>Looking up your order...</p>}
      {status === "notfound" && <p className="f-body mt-8 text-center" style={{ color: "#B3452F" }}>We couldn&apos;t find an order with that ID. Please check and try again.</p>}
      {status === "found" && order && (
        <div className="mt-8">
          <div className="rounded-xl p-5 mb-6" style={{ background: C.blushPale }}>
            <div className="flex justify-between f-body" style={{ fontSize: 13, color: C.ink }}><span>Order</span><span className="f-mono">{order.id}</span></div>
            <div className="flex justify-between f-body mt-1" style={{ fontSize: 13, color: C.ink }}><span>Placed</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between f-body mt-1" style={{ fontSize: 13, color: C.ink }}><span>Total</span><span className="f-mono">{cedis(order.total)}</span></div>
          </div>
          <div className="relative pl-2">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex gap-4 items-start">
                <div className="flex flex-col items-center" style={{ width: 24 }}>
                  <div className="rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: i <= stepIndex ? C.oliveDeep : C.blushPale, border: `1.5px solid ${C.oliveDeep}` }}>
                    {i <= stepIndex && <Check size={12} color={C.cream} />}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <svg viewBox="0 0 400 28" preserveAspectRatio="none" style={{ width: "100%", height: 34, display: "block" }}>
                      <path d="M0 14 Q 50 -2 100 14 T 200 14 T 300 14 T 400 14" fill="none" stroke={i < stepIndex ? C.oliveDeep : C.oliveSoft} strokeWidth="2" strokeOpacity={i < stepIndex ? 1 : 0.4} strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div className="pb-1">
                  <span className="f-body" style={{ fontSize: 13.5, fontWeight: i === stepIndex ? 700 : 500, color: i <= stepIndex ? C.oliveDeep : C.ink, opacity: i <= stepIndex ? 1 : 0.5 }}>{s}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl p-4" style={{ border: `1px solid ${C.oliveSoft}66` }}>
            <span className="f-body" style={{ fontSize: 12, color: C.ink, opacity: 0.6 }}>Items</span>
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between f-body mt-1.5" style={{ fontSize: 12.5, color: C.ink }}>
                <span>{it.name} × {it.qty}</span><span className="f-mono">{cedis(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!pin) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) });
      if (res.ok) { setAuthed(true); }
      else { setLoginError("Incorrect PIN. Please try again."); }
    } catch { setLoginError("Could not connect. Please try again."); }
    setLoginLoading(false);
  };

  const loadOrders = () => {
    setLoading(true);
    const keys = storageListKeys("order:");
    const all: Order[] = [];
    for (const k of keys) {
      const raw = storageGet(k);
      if (raw) { try { all.push(JSON.parse(raw)); } catch {} }
    }
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(all);
    setLoading(false);
  };

  useEffect(() => { if (authed) loadOrders(); }, [authed]);

  const updateStatus = async (order: Order, newStatus: string) => {
    const updated = { ...order, status: newStatus };
    storageSet(`order:${order.id}`, JSON.stringify(updated));
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));

    // Trigger email + SMS alerts when staff confirms or marks as processed
    if (newStatus === "Confirmed" || newStatus === "Processed") {
      fetch("/api/notify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-5 py-20 text-center">
        <Lock size={26} color={C.oliveDeep} className="mx-auto" />
        <h1 className="f-display mt-3" style={{ color: C.oliveDeep, fontSize: 22 }}>Staff login</h1>
        <input value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} type="password" placeholder="Enter PIN"
          className="f-mono w-full mt-5 px-4 py-2.5 rounded-full text-center outline-none" style={{ border: `1.3px solid ${C.oliveSoft}88`, fontSize: 14 }} />
        {loginError && <p className="f-body mt-2" style={{ color: "#B3452F", fontSize: 12.5 }}>{loginError}</p>}
        <button onClick={handleLogin} disabled={loginLoading} className="f-body w-full mt-3 py-2.5 rounded-full flex items-center justify-center gap-2"
          style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5, fontWeight: 600, opacity: loginLoading ? 0.7 : 1 }}>
          {loginLoading && <Loader2 size={14} className="animate-spin" />} Log in
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="f-display" style={{ color: C.oliveDeep, fontSize: 26 }}>Orders</h1>
        <button onClick={loadOrders} className="f-body px-4 py-2 rounded-full" style={{ background: C.blushPale, color: C.oliveDeep, fontSize: 12.5, fontWeight: 600 }}>Refresh</button>
      </div>
      {loading && <p className="f-body mt-6" style={{ color: C.ink, opacity: 0.6 }}>Loading orders...</p>}
      {!loading && orders.length === 0 && <p className="f-body mt-6" style={{ color: C.ink, opacity: 0.6 }}>No orders yet.</p>}
      <div className="mt-6">
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg mb-3" style={{ border: `1px solid ${C.oliveSoft}66` }}>
            <button onClick={() => setOpenId(openId === o.id ? null : o.id)} className="w-full flex items-center justify-between px-4 py-3">
              <div className="text-left">
                <div className="f-mono" style={{ fontSize: 13, color: C.oliveDeep }}>{o.id}</div>
                <div className="f-body" style={{ fontSize: 12, color: C.ink, opacity: 0.65 }}>{o.name} · {new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="f-mono" style={{ fontSize: 13, color: C.oliveDeep }}>{cedis(o.total)}</span>
                <span className="f-body px-2.5 py-1 rounded-full" style={{ fontSize: 10.5, fontWeight: 600, background: C.blushPale, color: C.oliveDeep }}>{o.status}</span>
              </div>
            </button>
            {openId === o.id && (
              <div className="px-4 pb-4" style={{ borderTop: `1px solid ${C.oliveSoft}44` }}>
                <div className="f-body mt-3" style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.8 }}>
                  <div>Phone: {o.phone}{o.email ? ` · ${o.email}` : ""}</div>
                  <div>{o.address}</div>
                  <div>Payment: {o.paymentMethod} · Ref: {o.reference}</div>
                </div>
                <div className="mt-2">
                  {o.items.map((it) => (
                    <div key={it.id} className="flex justify-between f-body" style={{ fontSize: 12, color: C.ink }}>
                      <span>{it.name} × {it.qty}</span><span className="f-mono">{cedis(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {STATUS_STEPS.map((s) => (
                    <button key={s} onClick={() => updateStatus(o, s)} className="f-body px-3 py-1.5 rounded-full"
                      style={{ fontSize: 11, fontWeight: 600, background: o.status === s ? C.oliveDeep : C.blushPale, color: o.status === s ? C.cream : C.oliveDeep }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- About Page ----------
function AboutPage({ setPage }: { setPage: (p: string) => void }) {
  const services = [
    { title: "Raw Donor Hair", desc: "Premium, ethically sourced luxury hair." },
    { title: "Beauty Products", desc: "High performance products that deliver real results." },
    { title: "Private Licensed Nail Artist", desc: "Luxury nail services in a private, peaceful setting." },
    { title: "Luxury Beauty Consultant", desc: "Personalized beauty consultations and guidance." },
    { title: "Beauty Firm Interior Decorator", desc: "Designing beautiful, functional beauty spaces." },
  ];
  const pillars = [
    "Attention to detail",
    "Privacy is a priority",
    "Premium quality, always",
    "I formulate. I research. I test.",
    "Honest recommendations",
    "I go the extra mile",
    "I\u2019m a go-getter. Always.",
  ];
  return (
    <div>
      {/* ── Hero banner ── */}
      <div style={{ background: C.oliveDeep, position: "relative", overflow: "hidden" }} className="py-20 px-5">
        {/* decorative wave rows */}
        {[0,1,2,3].map(i => (
          <svg key={i} viewBox="0 0 800 40" preserveAspectRatio="none" style={{ position: "absolute", left: 0, width: "100%", height: 40, top: i * 60, opacity: 0.07 }}>
            <path d={`M0 20 Q 100 ${i%2?4:36} 200 20 T 400 20 T 600 20 T 800 20`} fill="none" stroke={C.blush} strokeWidth="3" />
          </svg>
        ))}
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="f-mono" style={{ color: C.oliveSoft, fontSize: 11, letterSpacing: 2 }}>LUXURY WITHOUT INTRODUCTION</span>
          <h1 className="f-display mt-3" style={{ color: C.blushPale, fontSize: 52, lineHeight: 1.05 }}>About<br />Keila&apos;s Studio</h1>
          <WaveUnderline color={C.blush} width={120} />
        </div>
      </div>

      {/* ── Story ── */}
      <div className="max-w-5xl mx-auto px-5 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4", background: C.oliveDeep }}>
            <img src="/image0 (2).png" alt="Keila — Founder of Keila's Studio Extensions" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
        </div>
        <div>
          <span className="f-mono" style={{ color: C.olive, fontSize: 11, letterSpacing: 1.5 }}>I&apos;M KEILA.</span>
          <h2 className="f-display mt-1" style={{ color: C.oliveDeep, fontSize: 34, lineHeight: 1.1 }}>Beauty Entrepreneur</h2>
          <WaveUnderline color={C.blush} width={100} />
          <div className="f-body mt-5 space-y-4" style={{ color: C.ink, fontSize: 14, lineHeight: 1.8 }}>
            <p>Beauty has always been more than a career to me — it has been part of who I am for as long as I can remember.</p>
            <p>After years in the beauty industry, I realised I still couldn&apos;t find the level of quality, honesty, and luxury I wanted as a client. So I built it.</p>
            <p>Keila&apos;s Studio Extensions was born as a private luxury beauty atelier where every service, product, and experience is intentionally curated for women who value quality, privacy, and excellence.</p>
            <p>Today, my work extends beyond one service. I specialise in premium raw donor hair, beauty products, luxury nail services, personalised beauty consultations, and creating elegant beauty spaces.</p>
            <p>Everything I do is guided by one belief: if someone chooses to spend their money with me, they deserve an experience that feels worth every cedi.</p>
          </div>
          {/* Philosophy quote */}
          <div className="mt-8 rounded-xl px-6 py-5" style={{ background: C.oliveDeep }}>
            <span className="f-mono" style={{ color: C.oliveSoft, fontSize: 10, letterSpacing: 1.5 }}>MY PHILOSOPHY</span>
            <WaveUnderline color={C.blush} width={50} />
            <blockquote className="f-display mt-3" style={{ color: C.blushPale, fontSize: 21, lineHeight: 1.45 }}>
              Luxury is not an indulgence.<br />It is a standard.
              <span className="f-body block mt-3" style={{ color: C.oliveSoft, fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
                Every woman deserves an experience that compromises on nothing.
              </span>
            </blockquote>
          </div>
        </div>
      </div>

      {/* ── What I Offer ── */}
      <div style={{ background: C.blushPale }} className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="f-mono" style={{ color: C.olive, fontSize: 11, letterSpacing: 2 }}>WHAT I OFFER</span>
            <h2 className="f-display mt-2" style={{ color: C.oliveDeep, fontSize: 28 }}>Services &amp; Expertise</h2>
            <WaveUnderline color={C.olive} width={80} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <div key={i} className="rounded-xl p-6" style={{ background: C.white, border: `1px solid ${C.oliveSoft}44` }}>
                <div className="rounded-full flex items-center justify-center mb-3" style={{ width: 40, height: 40, background: C.oliveDeep }}>
                  <span className="f-mono" style={{ color: C.blushPale, fontSize: 13, fontWeight: 600 }}>0{i + 1}</span>
                </div>
                <h3 className="f-display" style={{ color: C.oliveDeep, fontSize: 19, fontWeight: 700 }}>{s.title}</h3>
                <p className="f-body mt-1.5" style={{ color: C.ink, fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What Sets Me Apart ── */}
      <div className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="f-mono" style={{ color: C.olive, fontSize: 11, letterSpacing: 2 }}>WHAT SETS ME APART</span>
            <h2 className="f-display mt-2" style={{ color: C.oliveDeep, fontSize: 28 }}>Quality. Privacy. Excellence.</h2>
            <WaveUnderline color={C.blush} width={100} />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {pillars.map((p, i) => (
              <div key={i} className="f-body px-4 py-2 rounded-full" style={{ background: C.blushPale, color: C.oliveDeep, fontSize: 13, fontWeight: 500, border: `1px solid ${C.blush}` }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: C.oliveDeep }} className="py-14 px-5 text-center">
        <h2 className="f-display" style={{ color: C.blushPale, fontSize: 26 }}>Ready to experience luxury?</h2>
        <p className="f-body mt-2" style={{ color: C.oliveSoft, fontSize: 14 }}>This is more than beauty. This is an experience.</p>
        <button onClick={() => setPage("shop")} className="f-body mt-6 px-8 py-3 rounded-full inline-block" style={{ background: C.blush, color: C.oliveDeep, fontSize: 14, fontWeight: 600 }}>
          Shop the collection
        </button>
      </div>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState("");
  const [modalProduct, setModalProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [, forceRerender] = useState(0);
  const zoomImg = (src: string) => setLightboxImg(src);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    async function load() {
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await fetch("/api/products?published=1", { cache: "no-store" });
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        PRODUCTS = data.map(mapProduct);
        forceRerender((n) => n + 1);
      } catch {} finally { inFlight = false; }
    }

    load();

    const onFocus = () => load();
    const onVisibility = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) return prev.map((c) => c.productId === productId ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { productId, qty: 1 }];
    });
  };
  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const openModal = (p: typeof PRODUCTS[0]) => setModalProduct(p);

  let content;
  if (page === "home") content = <HomePage setPage={setPage} addToCart={addToCart} notify={notify} onOpen={openModal} onZoom={zoomImg} />;
  else if (page === "about") content = <AboutPage setPage={setPage} />;
  else if (page === "shop") content = <ShopPage addToCart={addToCart} notify={notify} onOpen={openModal} onZoom={zoomImg} />;
  else if (page === "cart") content = <CartPage cart={cart} setCart={setCart} setPage={setPage} />;
  else if (page === "checkout") content = <CheckoutPage cart={cart} setCart={setCart} setPage={setPage} setLastOrder={setLastOrder} />;
  else if (page === "confirmation") content = <ConfirmationPage order={lastOrder} setPage={setPage} />;
  else if (page === "track") content = <TrackOrderPage prefillId={lastOrder?.id} />;
  else if (page === "admin") content = <AdminPage />;

  return (
    <div className="f-body" style={{ background: C.cream, minHeight: "100vh" }}>
      {FONTS}
      <NavBar page={page} setPage={setPage} cartCount={cartCount} />
      <PageFade page={page}>
        {content}
      </PageFade>
      <SiteFooter setPage={setPage} />
      <Toast message={toast} />

      {/* Product detail modal */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          addToCart={addToCart}
          notify={notify}
          onZoom={zoomImg}
        />
      )}

      {/* Image lightbox */}
      {lightboxImg && <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/233530515474?text=Hi%20Keila's%20Studio!%20I'd%20like%20to%20enquire%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl"
        style={{ background: C.oliveDeep, color: C.cream, fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        <span className="hidden sm:inline">Contact us</span>
      </a>
    </div>
  );
}
