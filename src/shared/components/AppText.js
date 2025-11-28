// src/shared/components/AppText.jsx
import React from "react";
import {Text} from "react-native";

// Figma 타이포그래피 → NativeWind className 매핑
const TYPO = {
  // Head
  H1: "font-pretendard-bold text-h1",
  H2: "font-pretendard-semibold text-h2",
  H3: "font-pretendard-semibold text-h3",

  // Body XL
  XL400: "font-pretendard-regular text-body-xl",
  XL500: "font-pretendard-medium text-body-xl",

  // Body L
  L400: "font-pretendard-regular text-body-l",
  L500: "font-pretendard-medium text-body-l",
  L600: "font-pretendard-semibold text-body-l",

  // Body M
  M400: "font-pretendard-regular text-body-m",
  M500: "font-pretendard-medium text-body-m",
  M600: "font-pretendard-semibold text-body-m",

  // Body S
  S400: "font-pretendard-regular text-body-s",
  S500: "font-pretendard-medium text-body-s",
  S600: "font-pretendard-semibold text-body-s",
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
