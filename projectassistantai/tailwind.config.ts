// tailwind.config.ts
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
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
      },
      colors: {
        bg: "#0a0d12",
        surface: "#111620",
        "surface-2": "#181f2e",
        border: "#1e2a3a",
        "border-2": "#2a3a52",
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e8c76a",
          dim: "#8a6f32",
        },
        emerald: {
          DEFAULT: "#2ecc8f",
          dim: "#1a5e42",
        },
        text: {
          DEFAULT: "#e8edf5",
          2: "#8a9bb5",
          3: "#4a5a72",
        },
        danger: "#e05252",
        info: "#4a8fff",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.3s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "orb-float": "orbFloat 12s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        orbFloat: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(30px, -30px)" },
        },
      },
      boxShadow: {
        "glow-gold": "0 0 30px rgba(201, 168, 76, 0.15)",
        "glow-gold-lg": "0 0 60px rgba(201, 168, 76, 0.25)",
        "glow-emerald": "0 0 30px rgba(46, 204, 143, 0.15)",
        "card": "0 8px 40px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 12px 60px rgba(0, 0, 0, 0.6)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(201,168,76,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,.03) 1px, transparent 1px)",
        "gold-gradient": "linear-gradient(135deg, #c9a84c, #8a6f32)",
        "surface-gradient": "linear-gradient(135deg, #111620, #0a0d12)",
      },
      backgroundSize: {
        grid: "50px 50px",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
