import { useEffect, useState } from "react";

// Returns true once the page has scrolled past `threshold` px.
// Use it to add a frosted/blurred background to a sticky nav on scroll.
export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
