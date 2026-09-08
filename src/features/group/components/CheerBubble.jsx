import React, { useState } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import colors from "../../../shared/styles/colors";

const TAIL_H = 8; // 삼각형 튀어나오는 가로 길이
const TAIL_W = 10; // 삼각형 세로 폭 (뚱뚱한 tail)
const RADIUS = 16; // 좀 더 둥글게
const PAD_V = 10; // 세로 padding ↓
const PAD_H = 32; // 가로 padding ↑↑↑ (더 길게)

/**
 * 좌향 tail 미니 말풍선. bg WT (#FAFAFA) / stroke GR200 (#EAEAEA) 1px.
 * SVG Path 로 아웃라인 한번에 그려서 이음새 seam 없음.
 */
export default function CheerBubble({ children, style }) {
  // 자식 콘텐츠 크기를 재고, 그 위에 SVG 로 아웃라인 오버레이
  const [size, setSize] = useState({ w: 0, h: 0 });

  const bubbleW = size.w + PAD_H * 2;
  const bubbleH = size.h + PAD_V * 2;

  return (
    <View style={[{ position: "relative" }, style]}>
      {size.w > 0 && (
        <Svg
          width={bubbleW + TAIL_H}
          height={bubbleH}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <Path
            d={buildBubblePath(bubbleW, bubbleH, TAIL_H, TAIL_W, RADIUS)}
            fill={colors.wt}
            stroke={colors.gr200}
            strokeWidth={1}
          />
        </Svg>
      )}
      <View
        style={{
          marginLeft: TAIL_H,
          paddingVertical: PAD_V,
          paddingHorizontal: PAD_H,
        }}
      >
        <View
          onLayout={(e) =>
            setSize({
              w: e.nativeEvent.layout.width,
              h: e.nativeEvent.layout.height,
            })
          }
        >
          {children}
        </View>
      </View>
    </View>
  );
}

/**
 * 좌측 중앙에 삼각형 tail 이 붙은 rounded-rect path.
 * bw/bh = 본체 크기, th = tail 튀어나오는 길이, tw = tail 세로폭, r = corner radius
 * 좌표계: (0,0) 가 SVG 좌상단. bubble 좌상단은 (th, 0) 에 위치.
 */
function buildBubblePath(bw, bh, th, tw, r) {
  const x0 = th; // bubble left (tail 오프셋만큼 우측으로)
  const x1 = th + bw; // bubble right
  const y0 = 0; // bubble top
  const y1 = bh; // bubble bottom
  const cy = bh / 2; // tail 세로 중앙
  const tt = cy - tw / 2; // tail top
  const tb = cy + tw / 2; // tail bottom

  return [
    `M ${x0 + r} ${y0}`,
    `L ${x1 - r} ${y0}`,
    `Q ${x1} ${y0} ${x1} ${y0 + r}`,
    `L ${x1} ${y1 - r}`,
    `Q ${x1} ${y1} ${x1 - r} ${y1}`,
    `L ${x0 + r} ${y1}`,
    `Q ${x0} ${y1} ${x0} ${y1 - r}`,
    `L ${x0} ${tb}`, // 좌측 아래 → tail bottom
    `L ${x0 - th} ${cy}`, // tail tip
    `L ${x0} ${tt}`, // tail top → 좌측 위로
    `L ${x0} ${y0 + r}`,
    `Q ${x0} ${y0} ${x0 + r} ${y0}`,
    "Z",
  ].join(" ");
}
