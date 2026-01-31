/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090B", // Zinc 950
        surface: "#18181B", // Zinc 900
        surfaceLight: "#27272A", // Zinc 800
        primary: "#3B82F6", // Blue 500
        secondary: "#8B5CF6", // Violet 500
        accent: "#F59E0B", // Amber 500
        success: "#10B981", // Emerald 500
        error: "#EF4444", // Red 500
        text: "#FAFAFA", // Zinc 50
        textSecondary: "#A1A1AA", // Zinc 400
      },
    },
  },
  plugins: [],
}
