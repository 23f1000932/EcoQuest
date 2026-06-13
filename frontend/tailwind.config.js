/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Material 3 semantic tokens — EcoQuest light palette
        "primary":                  "#006e2f",
        "on-primary":               "#ffffff",
        "primary-container":        "#22c55e",
        "on-primary-container":     "#004b1e",
        "primary-fixed":            "#6bff8f",
        "primary-fixed-dim":        "#4ae176",
        "on-primary-fixed":         "#002109",
        "on-primary-fixed-variant": "#005321",
        "inverse-primary":          "#4ae176",

        "secondary":                "#006c49",
        "on-secondary":             "#ffffff",
        "secondary-container":      "#6cf8bb",
        "on-secondary-container":   "#00714d",
        "secondary-fixed":          "#6ffbbe",
        "secondary-fixed-dim":      "#4edea3",
        "on-secondary-fixed":       "#002113",
        "on-secondary-fixed-variant": "#005236",

        "tertiary":                 "#006591",
        "on-tertiary":              "#ffffff",
        "tertiary-container":       "#36b6fb",
        "on-tertiary-container":    "#004564",
        "tertiary-fixed":           "#c9e6ff",
        "tertiary-fixed-dim":       "#89ceff",
        "on-tertiary-fixed":        "#001e2f",
        "on-tertiary-fixed-variant":"#004c6e",

        "surface":                  "#f8f9ff",
        "surface-dim":              "#cbdbf5",
        "surface-bright":           "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low":    "#eff4ff",
        "surface-container":        "#e5eeff",
        "surface-container-high":   "#dce9ff",
        "surface-container-highest":"#d3e4fe",
        "surface-variant":          "#d3e4fe",
        "surface-tint":             "#006e2f",
        "inverse-surface":          "#213145",
        "inverse-on-surface":       "#eaf1ff",

        "on-surface":               "#0b1c30",
        "on-surface-variant":       "#3d4a3d",
        "background":               "#f8f9ff",
        "on-background":            "#0b1c30",

        "outline":                  "#6d7b6c",
        "outline-variant":          "#bccbb9",

        "error":                    "#ba1a1a",
        "on-error":                 "#ffffff",
        "error-container":          "#ffdad6",
        "on-error-container":       "#93000a",

        // Legacy Tailwind green/emerald — keep for any old references
        green: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0",
          300: "#86efac", 400: "#4ade80", 500: "#22c55e",
          600: "#16a34a", 700: "#15803d", 800: "#166534",
          900: "#14532d", 950: "#052e16",
        },
        emerald: {
          50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0",
          300: "#6ee7b7", 400: "#34d399", 500: "#10b981",
          600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        geist: ["Geist", "system-ui", "sans-serif"],
      },
      spacing: {
        "xs":             "0.25rem",
        "sm":             "0.5rem",
        "md":             "1rem",
        "lg":             "1.5rem",
        "xl":             "2.5rem",
        "2xl":            "4rem",
        "gutter":         "1rem",
        "margin-mobile":  "1.25rem",
        "margin-desktop": "5rem",
        "base":           "4px",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg:      "0.5rem",
        xl:      "0.75rem",
        "2xl":   "1rem",
        full:    "9999px",
      },
      animation: {
        "float":          "float 6s ease-in-out infinite",
        "float-delayed":  "float 6s ease-in-out 2s infinite",
        "float-slow":     "float 8s ease-in-out 1s infinite",
        "count-up":       "countUp 2s ease-out forwards",
        "slide-up":       "slideUp 0.5s ease-out forwards",
        "fade-in":        "fadeIn 0.6s ease-out forwards",
        "pulse-green":    "pulseGreen 2s ease-in-out infinite",
        "shimmer":        "shimmer 2s linear infinite",
        "spin":           "spin 1s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,110,47,0.3)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(0,110,47,0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(0,110,47,0.08) 0%, rgba(0,108,73,0.04) 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
      },
      boxShadow: {
        "card": "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.04)",
        "card-hover": "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
}
