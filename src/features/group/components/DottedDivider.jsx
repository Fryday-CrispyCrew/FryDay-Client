import React from "react";
import Svg, { Line } from "react-native-svg";
import colors from "../../../shared/styles/colors";

/**
 * 점선 디바이더. direction 으로 가로/세로 선택.
 * Figma Dotted 스펙 (stroke #EAEAEA, dash 4·gap 6, round cap) 그대로.
 *
 * @prop {"horizontal" | "vertical"} direction
 * @prop {number} length - 방향에 따라 width 또는 height
 */
export default function DottedDivider({ direction = "horizontal", length }) {
  const stroke = colors.gr200;

  if (direction === "vertical") {
    const h = length ?? 100;
    return (
      <Svg width={1} height={h}>
        <Line
          x1={0.5}
          y1={0.5}
          x2={0.5}
          y2={h - 0.5}
          stroke={stroke}
          strokeLinecap="round"
          strokeDasharray="4 6"
        />
      </Svg>
    );
  }

  // horizontal - length 미지정 시 100% 로 stretch 되도록 부모가 감싸는걸 권장
  const w = length ?? 335;
  return (
    <Svg width={w} height={1}>
      <Line
        x1={0.5}
        y1={0.5}
        x2={w - 0.5}
        y2={0.5}
        stroke={stroke}
        strokeLinecap="round"
        strokeDasharray="4 6"
      />
    </Svg>
  );
}
