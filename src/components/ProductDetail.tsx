"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import type { Product, LengthOption } from "@/types";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/currency";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetail({ product, related = [] }: { product: Product; related?: Product[] }) {
  const { addItem } = useCart();
  const { currency } = useCurrency();

  const tiers: LengthOption[] = product.lengths ?? [];
  const hasTiers = tiers.length > 0;
  const defaultTier = hasTiers
    ? tiers[Math.floor(tiers.length / 2)]
    : undefined;

  const [selectedTier, setSelectedTier] = useState<LengthOption | undefined>(defaultTier);
  const [selectedLength, setSelectedLength] = useState(
    hasTiers ? `${defaultTier!.inches}"` : product.specs.length
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const displayPrice = selectedTier?.price ?? product.price;

  function handleAddToCart() {
    addItem(product, quantity, selectedLength, selectedTier?.price);
    toast.success("Added to bag!");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function pickTier(t: LengthOption) {
    setSelectedTier(t);
    setSelectedLength(`${t.inches}"`);
  }

  return (
    <div className="pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-cream-dark overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-xs tracking-widest uppercase text-muted">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            <p className="text-xs text-muted mt-1">
              {product.specs.length} &middot; {product.specs.texture}
            </p>
            <p className="text-2xl font-semibold mt-4 text-charcoal">
              {formatPrice(displayPrice, currency)}
              {hasTiers && selectedTier?.fallsAt && (
                <span className="ml-2 text-sm font-normal text-muted">
                  · Falls at {selectedTier.fallsAt}
                </span>
              )}
            </p>

            <div className="h-px bg-cream-dark my-6" />

            {/* Length / Size */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">
                {product.category === "nails" ? "Size" : "Length"}:{" "}
                <span className="text-muted font-normal">{selectedLength}</span>
              </p>
              {hasTiers ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {tiers.map((t) => {
                    const active = selectedTier?.inches === t.inches;
                    return (
                      <button
                        key={t.inches}
                        onClick={() => pickTier(t)}
                        className={`relative rounded-md border p-2.5 text-center transition-colors ${
                          active
                            ? "border-charcoal border-2 bg-cream-dark/40"
                            : "border-cream-dark hover:border-charcoal"
                        }`}
                      >
                        {active && (
                          <span className="absolute top-1 right-1.5 text-[10px] font-bold text-charcoal">✓</span>
                        )}
                        <span className="block text-base font-bold leading-tight">{t.inches}&quot;</span>
                        <span className="block text-[10.5px] text-muted mt-0.5">
                          {formatPrice(t.price, currency)}
                        </span>
                        {t.fallsAt && (
                          <span className="block text-[9.5px] text-muted mt-0.5 truncate">{t.fallsAt}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {product.availableLengths.map((len) => (
                    <button
                      key={len}
                      onClick={() => setSelectedLength(len)}
                      className={`px-3 py-2 text-xs border transition-colors ${
                        selectedLength === len
                          ? "bg-charcoal text-cream border-charcoal"
                          : "border-cream-dark text-charcoal hover:border-charcoal"
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center border border-cream-dark w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-muted hover:text-charcoal transition-colors text-lg"
                >
                  −
                </button>
                <span className="px-6 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-3 text-muted hover:text-charcoal transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-2 py-4 text-sm font-medium tracking-wide transition-all ${
                added
                  ? "bg-green-600 text-cream"
                  : "bg-charcoal text-cream hover:bg-charcoal/90"
              }`}
            >
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}
              {added ? "Added to Bag!" : "Add to Bag"}
            </button>
            <Link
              href="/checkout"
              onClick={() => addItem(product, quantity, selectedLength, selectedTier?.price)}
              className="mt-3 flex items-center justify-center py-4 text-sm font-medium border border-charcoal hover:bg-cream-dark transition-colors"
            >
              Buy Now
            </Link>

            <div className="h-px bg-cream-dark my-6" />

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Product Details</h3>
              <p className="text-sm text-muted leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Shipping note */}
            <div className="mt-6 p-4 bg-cream-dark text-xs text-muted space-y-1.5">
              <p>📦 Orders before 3 PM processed same day</p>
              <p>🚚 Delivery within Accra: 1–2 business days</p>
              <p>🔒 Secure checkout via Paystack &amp; Flutterwave</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24 border-t border-cream-dark pt-16">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
