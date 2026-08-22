import type { Product } from "@/types";

// A product is considered "published" (safe to show on the public storefront)
// when it has a real name (not just digits/blank) and a non-zero price.
export function isPublishedProduct(p: Product): boolean {
  const name = (p.name ?? "").trim();
  if (!name) return false;
  if (/^\d+$/.test(name)) return false;
  if (!(p.price > 0)) return false;
  return true;
}
