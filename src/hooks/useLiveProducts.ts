"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types";

// Fetches /api/products on mount and re-fetches whenever the tab/window regains focus
// so admin edits made in another tab show up automatically.
export function useLiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch(`/api/products?published=1&_=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setProducts(data as Product[]);
      } catch {
        // swallow — keep whatever we had before
      } finally {
        inFlight.current = false;
        if (!cancelled) setLoading(false);
      }
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

  return { products, loading };
}
