import type { Product } from "@/types";

// A product is considered "published" (safe to show on the public storefront)
// when it has a real name (not just digits/blank) AND at least one real price
// — either the flat `price` field or a length tier with a positive price.
export function isPublishedProduct(p: Product): boolean {
  const name = (p.name ?? "").trim();
  if (!name) return false;
  if (/^\d+$/.test(name)) return false;
  const hasFlatPrice = p.price > 0;
  const hasTierPrice = Array.isArray(p.lengths) && p.lengths.some((l) => l.price > 0);
  return hasFlatPrice || hasTierPrice;
}
