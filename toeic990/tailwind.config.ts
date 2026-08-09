import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "oklch(0.985 0.004 265)",
        surface: "#fff",
        navy: "oklch(0.14 0.02 265)",
        ink: {
          DEFAULT: "oklch(0.2 0.014 265)",
          muted: "oklch(0.5 0.012 265)",
          faint: "oklch(0.65 0.01 265)",
        },
        border: {
          DEFAULT: "oklch(0.9 0.006 265)",
          strong: "oklch(0.85 0.06 25)",
        },
        primary: {
          DEFAULT: "oklch(0.56 0.19 265)",
          dark: "oklch(0.46 0.19 265)",
          soft: "oklch(0.94 0.035 265)",
        },
        accent: {
          DEFAULT: "oklch(0.68 0.19 35)",
          soft: "oklch(0.95 0.04 35)",
          text: "oklch(0.45 0.15 35)",
        },
        success: {
          DEFAULT: "oklch(0.64 0.15 145)",
          soft: "oklch(0.95 0.04 145)",
          text: "oklch(0.35 0.13 145)",
        },
        danger: {
          DEFAULT: "oklch(0.58 0.18 25)",
          soft: "oklch(0.95 0.04 25)",
          text: "oklch(0.4 0.14 25)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(30,20,60,0.06), 0 12px 32px oklch(0.5 0.09 265 / 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
