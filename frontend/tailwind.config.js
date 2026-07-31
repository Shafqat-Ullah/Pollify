/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10B981",
          hover: "#34D399",
        },
        accent: {
          DEFAULT: "#10B981",
          hover: "#34D399",
        },
        destructive: {
          DEFAULT: "#F43F5E",
          hover: "#FB7185",
        },
        background: "#09090B",
        surface: {
          DEFAULT: "#18181B",
          light: "#27272A",
        },
        border: "#27272A",
        muted: "#A1A1AA",
        text: "#F4F4F5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        heading: ["Syne", "Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.35)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
