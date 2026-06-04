import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black:  "#080808",
          white:  "#F9F7F4",
          cream:  "#F2EDE4",
          warm:   "#E8DDD0",
          stone:  "#C4B5A5",
          ash:    "#8C8279",
          muted:  "#5C554E",
          dark:   "#2A2520",
          accent: "#B8956A",
          gold:   "#D4A84B",
          green:  "#3D6B4F",
          blush:  "#C4877A",
          gray: {
            50:  "#F7F5F2",
            100: "#EDE9E3",
            200: "#DDD7CE",
            300: "#C8C0B4",
            400: "#A89D92",
            500: "#887D72",
            600: "#6B6058",
            700: "#504840",
            800: "#36302A",
            900: "#1E1A15",
          },
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-dm-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem"    }],
        "10xl":["10rem",    { lineHeight: "0.85"    }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
      },
      letterSpacing: {
        "widest-2": "0.2em",
        "widest-3": "0.35em",
        "widest-4": "0.5em",
      },
      lineHeight: {
        "none-plus": "0.9",
      },
      transitionTimingFunction: {
        brand:   "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        spring:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth:  "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        "fade-up":    "fadeUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "fade-in":    "fadeIn 0.5s ease forwards",
        "slide-left": "slideLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "shimmer":    "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      screens: {
        xs: "375px",
      },
      aspectRatio: {
        "2/3":    "2 / 3",
        "4/5":    "4 / 5",
        "5/6":    "5 / 6",
        "7/8":    "7 / 8",
        "golden": "1.618 / 1",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
