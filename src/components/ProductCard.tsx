"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ImageOff } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/currency";
import toast from "react-hot-toast";

const categoryColors: Record<string, string> = {
  wigs: "text-amber-700",
  bundles: "text-stone-600",
  extensions: "text-teal-700",
  "closures-frontals": "text-purple-700",
  nails: "text-rose-600",
  "hair-care": "text-green-700",
};

const categoryLabels: Record<string, string> = {
  wigs: "Wigs",
  bundles: "Bundles",
  extensions: "Extensions",
  "closures-frontals": "Closures & Frontals",
  nails: "Nails",
  "hair-care": "Hair Care",
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { currency } = useCurrency();
  const [imgError, setImgError] = useState(false);
  const src = product.images?.[0];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product, 1, product.specs.length);
    toast.success(`${product.name} added to bag`);
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-cream-dark aspect-[3/4] flex items-center justify-center">
        {src && !imgError ? (
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105 brightness-75 group-hover:brightness-50"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImageOff size={32} className="text-muted/40" />
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cream text-charcoal text-xs font-medium tracking-wide px-5 py-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap shadow-sm"
        >
          <ShoppingBag size={13} />
          Add to Bag
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        <p
          className={`text-[10px] tracking-widest uppercase font-semibold ${categoryColors[product.category] ?? "text-muted"}`}
        >
          {categoryLabels[product.category] ?? product.category}
        </p>
        <h3 className="text-sm font-medium text-charcoal mt-1 leading-snug">
          {product.name}
        </h3>
        <p className="text-[11px] text-muted mt-0.5">
          {product.specs.length} &middot; {product.specs.texture}
        </p>
        <p className="text-sm font-semibold text-charcoal mt-2">
          {formatPrice(product.price, currency)}
        </p>
      </div>
    </Link>
  );
}
