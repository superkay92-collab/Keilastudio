import { useEffect, useState } from "react";

// Wrap page content with this for a soft fade on each page change.
// Pass the current `page` string so it re-triggers on navigation.
export function PageFade({ children, page }) {
  const [fadeClass, setFadeClass] = useState("page-fade-enter-active");

  useEffect(() => {
    setFadeClass("page-fade-enter");
    const t = requestAnimationFrame(() => setFadeClass("page-fade-enter-active"));
    return () => cancelAnimationFrame(t);
  }, [page]);

  return <div className={fadeClass}>{children}</div>;
}
