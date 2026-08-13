const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./App.tsx",
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Phase 3 accent: a deep coral-red ("sun-dried tomato") in place of
        // the old template orange (#FF7622). Still warm for appetite appeal,
        // but deeper and redder so it reads as a deliberate choice, and
        // white stays legible on top of it.
        primary: {
          DEFAULT: "#E0533A",
          foreground: "#FFFFFF",
        },
        // Dark neutral ink for headings and body text, slightly softer than
        // pure black.
        secondary: {
          DEFAULT: "#262B33",
          foreground: "#FFFFFF",
        },
        // Crisp, modern warm-gray for soft surfaces (stepper, cards, pills)
        // providing strong contrast against white without yellow/cream cast.
        "surface-muted": "#F2F4F7",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "#646982",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "text-gray": "#646982",
        "text-gray-dark": "#32343E",
      },
      fontFamily: {
        // High-level semantic roles
        display: ["Bricolage-ExtraBold"],
        title: ["Bricolage-Bold"],
        body: ["Geist"],
        label: ["Geist-Medium"],
        caption: ["Geist-Medium"],
        numeric: ["Geist-SemiBold"],

        // Direct family access
        bricolage: ["Bricolage-Bold"],
        "bricolage-semibold": ["Bricolage-SemiBold"],
        "bricolage-bold": ["Bricolage-Bold"],
        "bricolage-extrabold": ["Bricolage-ExtraBold"],

        geist: ["Geist"],
        "geist-medium": ["Geist-Medium"],
        "geist-semibold": ["Geist-SemiBold"],
        "geist-bold": ["Geist-Bold"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require("tailwindcss-animate")],
};
