/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: "#0b0f19",
          card: "#111827",
          cardBorder: "#1f293d",
          hover: "#1e293b",
          accentBlue: "#2563eb",
          accentTeal: "#0d9488",
          accentPurple: "#7c3aed",
          accentGold: "#d97706",
          danger: "#ef4444",
          warning: "#f59e0b",
          success: "#10b981",
          textMuted: "#94a3b8",
        }
      }
    },
  },
  plugins: [],
}
