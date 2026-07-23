import { useReveal } from "../hooks/useReveal";

// Drop-in replacement for a static WaveDivider — the line "draws" itself
// the first time it scrolls into view, tying your signature motif to motion.
export function AnimatedWaveDivider({ color = "#66793F", height = 28 }) {
  const { ref, visible } = useReveal();
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      className={`wave-draw ${visible ? "wave-visible" : ""}`}
      style={{ width: "100%", height, display: "block" }}
    >
      <path
        d="M0 14 Q 50 -2 100 14 T 200 14 T 300 14 T 400 14"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
