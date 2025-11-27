// src/shared/components/AppText.jsx
import React from "react";
import {Text} from "react-native";

// Figma 타이포그래피 → NativeWind className 매핑
const TYPO = {
  // Head
  H1: "font-pretendard text-h1 font-bold",
  H2: "font-pretendard text-h2 font-semibold",
  H3: "font-pretendard text-h3 font-semibold",

  // Body XL
  XL400: "font-pretendard text-body-xl font-normal",
  XL500: "font-pretendard text-body-xl font-medium",

  // Body L
  L400: "font-pretendard text-body-l font-normal",
  L500: "font-pretendard text-body-l font-medium",
  L600: "font-pretendard text-body-l font-semibold",

  // Body M
  M400: "font-pretendard text-body-m font-normal",
  M500: "font-pretendard text-body-m font-medium",
  M600: "font-pretendard text-body-m font-semibold",

  // Body S
  S400: "font-pretendard text-body-s font-normal",
  S500: "font-pretendard text-body-s font-medium",
  S600: "font-pretendard text-body-s font-semibold",
};

export default function AppText({
  variant = "L400",
  className = "",
  children,
  ...rest
}) {
  const base = TYPO[variant] || "";

  if (!base) {
    console.warn(`[AppText] Unknown variant: ${variant}`);
  }

  const combinedClass = [base, className].filter(Boolean).join(" ");

  return (
    <Text className={combinedClass} {...rest}>
      {children}
    </Text>
  );
}
