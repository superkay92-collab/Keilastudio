"use client";

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/currency";

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, subtotal } =
    useCart();
  const { currency } = useCurrency();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full w-full sm:w-96 bg-cream z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-dark">
          <h2 className="font-semibold tracking-wide text-sm uppercase tracking-widest">
            Your Bag ({totalItems})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted hover:text-charcoal transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={56} className="text-cream-dark" />
              <p className="text-muted text-sm">Your bag is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-charcoal underline underline-offset-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.selectedLength}`}
                  className="flex gap-4"
                >
                  <div className="relative w-20 h-24 flex-shrink-0 bg-cream-dark overflow-hidden">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {item.selectedLength} &middot; {item.product.specs.texture}
                    </p>
                    <p className="text-sm font-semibold mt-1.5">
                      {formatPrice(item.product.price, currency)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-cream-dark">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="px-2 py-1.5 text-muted hover:text-charcoal transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="px-2 py-1.5 text-muted hover:text-charcoal transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-muted hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-dark px-6 py-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">
                {formatPrice(subtotal, currency)}
              </span>
            </div>
            <p className="text-xs text-muted mb-5">
              Shipping calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-charcoal text-cream text-sm font-medium text-center py-4 tracking-wide hover:bg-charcoal/90 transition-colors"
            >
              Checkout
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="block w-full text-center text-xs text-muted mt-3 hover:text-charcoal transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
