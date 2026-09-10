import React from "react";
import { View } from "react-native";
import AppText from "../../../shared/components/AppText";
import DottedRound from "../assets/svg/dotted-round.svg";

const RADIUS = 12;
const DARK_BG = "rgba(20, 19, 18, 0.5)"; // gray-scale-transparency-text-50

// 크기 & 여백
const OUTER_PAD_H = 5;
const OUTER_PAD_V = 5;
const INNER_W = 48; // 점선 pocket 가로 (얇게)
const INNER_H = 52; // 점선 pocket 세로 (상단 공백 살짝 축소)
const TEXT_BOTTOM = 10;

/**
 * 본인 카드 우상단 "내 가게" 포켓 태그.
 *
 * - 외곽: dark 반투명 rounded (하단만 12)
 * - 내부: dotted-round.svg 로 점선 pocket outline (WT 75%)
 * - 텍스트: M600 12px WT, 포켓 하단 근처에 위치 (상단 여백을 크게)
 */
export default function MyStoreTag({ label = "내 가게" }) {
  return (
    <View
      style={{
        backgroundColor: DARK_BG,
        borderBottomLeftRadius: RADIUS,
        borderBottomRightRadius: RADIUS,
        paddingHorizontal: OUTER_PAD_H,
        paddingTop: 0, // 점선이 tag 최상단까지 닿게
        paddingBottom: OUTER_PAD_V,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: INNER_W,
          height: INNER_H,
          position: "relative",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: TEXT_BOTTOM,
        }}
      >
        {/* 점선 pocket outline (정사각 SVG 를 가로세로 개별 stretch) */}
        <DottedRound
          width={INNER_W}
          height={INNER_H}
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        <AppText
          variant="M600"
          style={{
            color: "#FAFAFA",
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.144,
          }}
        >
          {label}
        </AppText>
      </View>
    </View>
  );
}
