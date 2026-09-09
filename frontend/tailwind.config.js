/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          canvas: "#09090b",
          surface: "#121215",
          surfaceElevated: "#18181c",
          surfaceSubtle: "#1c1c22",
          border: "#27272a",
          borderSubtle: "#1e1e24",
          borderFocus: "#3f3f46",
          // Primary broadcast signal / tally accent (used sparingly)
          signal: "#FF4D3D",
          signalHover: "#e03e2f",
          // Operational state semantics
          healthy: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#60a5fa",
          grafana: "#f97316",
        },
      },
      fontFamily: {
        sans: ["Inter", "Geist Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
