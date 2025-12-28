// tailwind.config.js
const {fontFamily} = require("tailwindcss/defaultTheme");

// helper: size 기준으로 lineHeight/letterSpacing 한 번에 정의
const makeType = (size) => [
  size,
  {
    // lineHeight: size * 1.5, // 150%
    letterSpacing: size * 0.012, // 1.2%
  },
];

const colors = require("./src/shared/styles/colors"); // 경로는 네 구조에 맞게

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // 기본 폰트 Pretendard
        "pretendard-regular": ["Pretendard-Regular"],
        "pretendard-medium": ["Pretendard-Medium"],
        "pretendard-semibold": ["Pretendard-SemiBold"],
        "pretendard-bold": ["Pretendard-Bold"],
      },
      fontSize: {
        // Head
        h1: makeType(24),
        h2: makeType(20),
        h3: makeType(16),

        // Body (XL/L/M/S)
        "body-xl": makeType(16),
        "body-l": makeType(14),
        "body-m": makeType(12),
        "body-s": makeType(10),
      },
      colors,
      borderRadius: {
        // Radius System
        chip: 24, // Chip / Badge
        card: 20, // Card / Modal
        btn: 16, // Button
        navTop: 24, // Nav Bar / Bottom Sheet 상단 라운드
      },
      spacing: {
        // Grid System
        "mg-screen": 20, // screen margin
        gt: 16, // gutter
        col: 72, // column width
      },
    },
  },
  plugins: [],
};
