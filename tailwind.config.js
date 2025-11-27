// tailwind.config.js
const {fontFamily} = require("tailwindcss/defaultTheme");

// helper: size 기준으로 lineHeight/letterSpacing 한 번에 정의
const makeType = (size) => [
  size,
  {
    lineHeight: size * 1.5, // 150%
    letterSpacing: size * 0.012, // 1.2%
  },
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // 기본 폰트 Pretendard
        pretendard: ["Pretendard-Regular", ...fontFamily.sans], //fallback 폰트도 추가
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
      colors: {
        // Primary / Secondary
        or: "#FF5822", // Primary OR
        gr: "#F4F4F4", // Secondary GR

        // Secondary / Calendar (50%, 75% → opacity)
        rd50: "rgba(207, 48, 12, 0.5)", // #CF300C 50%
        rd75: "rgba(207, 48, 12, 0.75)", // #CF300C 75%
        bl50: "rgba(51, 121, 182, 0.5)", // #3379B6 50%
        bl75: "rgba(51, 121, 182, 0.75)", // #3379B6 75%

        // Secondary / Category
        br: "#85302A",
        lg: "#82B236",
        cb: "#367BAE",
        dp: "#D05D90",
        mb: "#3CB492",
        vl: "#9351A1",
        pk: "#F06B9C",
        mb2: "#AA7459",
        yl: "#FFA100",

        // Gray Scale
        bk: "#282424",
        gr900: "#4F4E4D",
        gr700: "#5D5E60",
        gr500: "#BAB8B9",
        gr300: "#C4C4C3",
        gr200: "#EAEAEA",
        gr100: "#F2F2F2",
        wt: "#FAFAFA",

        // Transparency (필요하면)
        bk25: "rgba(40, 36, 36, 0.25)",
        bk50: "rgba(40, 36, 36, 0.5)",
        bk75: "rgba(40, 36, 36, 0.75)",
        wt25: "rgba(250, 250, 250, 0.25)",
        wt50: "rgba(250, 250, 250, 0.5)",
        wt75: "rgba(250, 250, 250, 0.75)",
      },
    },
  },
  plugins: [],
};
