import { useState } from "react";

// Shows a shimmer placeholder until the real image finishes loading, and
// falls back to `fallback` (e.g. your existing ProductSwatch) if there's
// no src yet or the image fails to load. Use this for every real product
// photo so images never "pop" in abruptly or show a broken-image icon.
//
// Usage:
//   <div className="aspect-square">
//     <ImageWithSkeleton src={product.image} alt={product.name} fallback={<ProductSwatch .../>} />
//   </div>
export function ImageWithSkeleton({ src, alt, className = "", fallback = null }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || errored) return fallback;

  return (
    <div className={`relative w-full h-full ${!loaded ? "skeleton" : ""}`}>
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${className} ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
