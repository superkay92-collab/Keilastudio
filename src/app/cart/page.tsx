"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/currency";
import { cartUnitPrice, cartLineTotal } from "@/lib/cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { currency } = useCurrency();
  const shipping = subtotal >= 2000 ? 0 : 150;

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={64} className="text-cream-dark mb-6" />
          <h1 className="text-2xl font-bold mb-3">Your bag is empty</h1>
          <p className="text-muted mb-8">Discover our luxury hair collection</p>
          <Link
            href="/shop"
            className="bg-charcoal text-cream px-8 py-4 text-sm font-medium hover:bg-charcoal/90 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-10">
          Your Bag ({items.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedLength}`}
                className="flex gap-5 pb-6 border-b border-cream-dark"
              >
                <Link
                  href={`/products/${item.product.id}`}
                  className="relative w-28 h-36 flex-shrink-0 bg-cream-dark overflow-hidden"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-medium hover:text-gold transition-colors leading-snug">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted mt-0.5">
                    {item.selectedLength} &middot; {item.product.specs.texture}
                  </p>
                  <p className="text-sm font-semibold mt-2">
                    {formatPrice(cartUnitPrice(item), currency)}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-cream-dark">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="px-3 py-2 text-muted hover:text-charcoal transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-4 text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="px-3 py-2 text-muted hover:text-charcoal transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="flex items-center gap-1 text-xs text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm">
                    {formatPrice(cartLineTotal(item), currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-cream-dark p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm border-b border-cream pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : formatPrice(shipping, currency)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gold">
                    Free shipping on orders over GH₵ 2,000
                  </p>
                )}
              </div>
              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>{formatPrice(subtotal + shipping, currency)}</span>
              </div>
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-charcoal text-cream py-4 text-sm font-medium hover:bg-charcoal/90 transition-colors"
              >
                Proceed to Checkout
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/shop"
                className="block text-center text-xs text-muted mt-4 hover:text-charcoal transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
