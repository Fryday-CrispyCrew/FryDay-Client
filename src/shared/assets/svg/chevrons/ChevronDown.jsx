import * as React from "react";
import Svg, {Path} from "react-native-svg";

export default function ChevronDown({
  size = 14,
  color = "currentColor",
  strokeWidth = 3,
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={strokeWidth} // ✅ camelCase
        strokeLinecap="round" // ✅ camelCase
        strokeLinejoin="round" // ✅ camelCase
      />
    </Svg>
  );
}
