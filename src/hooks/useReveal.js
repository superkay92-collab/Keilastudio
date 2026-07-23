import { useEffect, useRef, useState } from "react";

// Fades + slides an element up the first time it scrolls into view.
// Usage:
//   const { ref, visible } = useReveal();
//   <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""}`}>...</div>
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
