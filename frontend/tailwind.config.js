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
          bg: "#09090b",
          surface: "#121215",
          hover: "#1a1a20",
          border: "#27272a",
          borderStrong: "#3f3f46",
          red: "#ef4444",
          green: "#10b981",
          amber: "#f59e0b",
          cyan: "#38bdf8",
          grafana: "#f97316",
        },
      },
      fontFamily: {
        mono: ["Geist Mono", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      animation: {
        pulseFast: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glitch: "glitch 0.3s ease-in-out infinite",
      },
      keyframes: {
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
      },
    },
  },
  plugins: [],
};
