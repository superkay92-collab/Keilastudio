import type { CartItem } from "@/types";

// The price of ONE unit of this cart item. Prefers the price captured at
// add-to-cart time (which may reflect a per-length tier) and falls back to
// the product's base price.
export function cartUnitPrice(item: CartItem): number {
  return typeof item.unitPrice === "number" ? item.unitPrice : item.product.price;
}

export function cartLineTotal(item: CartItem): number {
  return cartUnitPrice(item) * item.quantity;
}
