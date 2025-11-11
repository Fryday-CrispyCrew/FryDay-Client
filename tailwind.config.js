/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",  // Fryday 메인 컬러
        secondary: "#ffffff",
      },
      borderRadius: {
        md: 8,
        lg: 16,
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
      },
      fontFamily: {
        sans: ["NotoSansKR", "System"],
      },
    },
  },
  plugins: [],
};
