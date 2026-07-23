import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "Helvetica", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      colors: {
        cream: "#FBF7F0",
        "cream-dark": "#F6E8DF",
        "olive-deep": "#3B4527",
        olive: "#66793F",
        "olive-soft": "#A6B583",
        blush: "#E7C4B5",
        "blush-pale": "#F6E8DF",
        ink: "#28281F",
        charcoal: "#000000",
        muted: "#666666",
        gold: "#ff007f",
      },
    },
  },
  plugins: [],
};

export default config;
