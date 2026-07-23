import { useReveal } from "../hooks/useReveal";

// Wrap any block to fade + slide it up once it scrolls into view.
// Use `delay` to stagger a row of cards: <Reveal delay={i * 80}>...
export function Reveal({ children, delay = 0, className = "" }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
