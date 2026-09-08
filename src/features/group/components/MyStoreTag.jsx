import React, { useState } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import AppText from "../../../shared/components/AppText";

const RADIUS = 12;
const DARK_BG = "rgba(20, 19, 18, 0.5)"; // gray-scale-transparency-text-50
const DASH_COLOR = "rgba(250, 250, 250, 0.75)"; // surface-75

/**
 * 본인 카드 우상단 "내 가게" 태그.
 *
 * 스펙:
 * - 외곽: padding 24/12/12/12, bottom-only radius 12, bg 다크 반투명
 * - 내부: 3면(좌/하/우) 점선 outline, bottom-only radius 12, white 75%
 * - 텍스트: M600 12px, #FAFAFA, line-height 150%
 *
 * 내부 점선 outline 은 RN 의 borderStyle dashed 가 rounded corner 에서
 * 플랫폼 편차 심해서 react-native-svg Path 로 대신 그림.
 */
export default function MyStoreTag({ label = "내 가게" }) {
  return (
    <View
      style={{
        // outer: dashed box 와 outer 경계 사이 12px 여백
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: DARK_BG,
        borderBottomLeftRadius: RADIUS,
        borderBottomRightRadius: RADIUS,
      }}
    >
      <InnerDashedBox>
        <AppText
          variant="M600"
          style={{
            color: "#FAFAFA",
            fontSize: 12,
            lineHeight: 18, // 150% of 12
            letterSpacing: 0.144,
          }}
        >
          {label}
        </AppText>
      </InnerDashedBox>
    </View>
  );
}

/**
 * 3면(좌/하/우) 점선 border + bottom-only rounded 를 SVG 로 그리는 컨테이너.
 * 자식 콘텐츠 크기를 재고 그 위에 SVG 오버레이.
 */
function InnerDashedBox({ children }) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  return (
    <View
      style={{
        // 내부 패딩 12만 — 텍스트와 점선 사이 간격이 12.
        padding: 12,
        position: "relative",
      }}
      onLayout={(e) =>
        setSize({
          w: e.nativeEvent.layout.width,
          h: e.nativeEvent.layout.height,
        })
      }
    >
      {size.w > 0 && (
        <Svg
          width={size.w}
          height={size.h}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Path
            d={buildBorderPath(size.w, size.h, RADIUS)}
            fill="none"
            stroke={DASH_COLOR}
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
        </Svg>
      )}
      {children}
    </View>
  );
}

/**
 * top-open, bottom-rounded 3면 border path.
 * 좌상단 → 좌하단 → 우하단 → 우상단.
 */
function buildBorderPath(w, h, r) {
  return [
    `M 0.5 0`,
    `L 0.5 ${h - r}`,
    `Q 0.5 ${h - 0.5} ${r} ${h - 0.5}`,
    `L ${w - r} ${h - 0.5}`,
    `Q ${w - 0.5} ${h - 0.5} ${w - 0.5} ${h - r}`,
    `L ${w - 0.5} 0`,
  ].join(" ");
}
