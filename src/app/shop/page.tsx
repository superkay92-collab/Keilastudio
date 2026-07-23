"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import type { Category } from "@/types";
import clsx from "clsx";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "extensions", label: "Extensions" },
  { value: "closures-frontals", label: "Closures & Frontals" },
  { value: "wigs", label: "Wigs" },
  { value: "hair-care", label: "Hair Care" },
];

function CategorySync({ onCategory }: { onCategory: (c: Category) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const cat = searchParams.get("category") as Category | null;
    if (cat) onCategory(cat);
  }, [searchParams, onCategory]);
  return null;
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  const filtered = useMemo(() => {
    let list =
      activeCategory === "all"
        ? products
        : products.filter((p) => p.category === activeCategory);
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [activeCategory, sortBy]);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
      <Suspense fallback={null}>
        <CategorySync onCategory={setActiveCategory} />
      </Suspense>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">
          The Collection
        </p>
        <h1 className="text-4xl font-bold">Shop All Hair</h1>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-cream-dark">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={clsx(
                "px-5 py-2 text-sm font-medium border transition-colors",
                activeCategory === cat.value
                  ? "bg-charcoal text-cream border-charcoal"
                  : "bg-transparent text-charcoal border-cream-dark hover:border-charcoal"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-sm border border-cream-dark bg-cream px-3 py-2 text-charcoal focus:outline-none focus:border-charcoal"
        >
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <p className="text-center py-20 text-muted">
          No products in this category.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
