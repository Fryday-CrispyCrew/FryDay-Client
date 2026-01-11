import React from "react";
import ChevronUp from "../assets/svg/chevrons/ChevronUp";
import ChevronDown from "../assets/svg/chevrons/ChevronDown";
import ChevronLeft from "../assets/svg/chevrons/ChevronLeft";
import ChevronRight from "../assets/svg/chevrons/ChevronRight";

const MAP = {
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
};

export default function ChevronIcon({
  direction = "down", // "up" | "down" | "left" | "right"
  size = 16,
  color = colors.gr700,
  strokeWidth = 1.5,
}) {
  const Icon = MAP[direction] ?? ChevronDown;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
