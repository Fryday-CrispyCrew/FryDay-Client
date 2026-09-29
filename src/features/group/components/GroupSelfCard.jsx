import React from "react";
import { View, useWindowDimensions } from "react-native";
import AppText from "../../../shared/components/AppText";
import CheerBubble from "./CheerBubble";
import MyStoreTag from "./MyStoreTag";
import colors from "../../../shared/styles/colors";

/**
 * 그룹 상세의 "본인" 카드.
 * 좌: 캐릭터/집 그래픽 슬롯 (외부에서 주입, 없으면 비어있음)
 * 우 상단: 닉네임 + n/m 카운트 (L600, /max 만 GR500, gap 4) — 내 가게 태그의 왼쪽에 위치
 * 우 하단: 응원 미니 말풍선
 * 우상단 코너: 내 가게 태그 (absolute)
 *
 * @prop {ReactNode} illustration - 좌측 그래픽 슬롯
 * @prop {string} name
 * @prop {number} current
 * @prop {number} max
 * @prop {number|string} cheerCount - "응원 X건이 도착했어요!" 의 X. 없으면 말풍선 숨김
 */
export default function GroupSelfCard({
  illustration,
  name,
  current = 0,
  max = 10,
  cheerCount,
}) {
  const { width } = useWindowDimensions();
  const graphicSize = width < 390 ? 80 : 120;
  const hasCheer = cheerCount !== undefined && cheerCount !== null;

  return (
    <View
      style={{
        position: "relative",
        backgroundColor: colors.gr100,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.gr200,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 146,
        overflow: "hidden",
      }}
    >
      {/* 내 가게 태그 — 카드 우상단 코너에 붙음 (padding 무시) */}
      <View style={{ position: "absolute", top: 0, right: 16 }}>
        <MyStoreTag />
      </View>

      <View
        style={{
          flex: 1, // minHeight 146 - paddingVertical 24 = 122 까지 세로로 늘어남
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch", // 우측 컬럼이 row 높이 만큼 stretch → space-between 이 벌어짐
          alignSelf: "stretch",
        }}
      >
        {/* 좌: 그래픽 슬롯 (외부 주입, 120x120) */}
        <View
          style={{
            width: graphicSize,
            height: graphicSize,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ transform: [{ scale: graphicSize / 120 }] }}>{illustration}</View>
        </View>

        {/* 우: name+count (상단, 좌측정렬) / bubble (하단). column · space-between · stretch */}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            gap: 12,
            alignSelf: "stretch",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginLeft: 12,
          }}
        >
          {/* 상단: 닉네임 (1줄) + current/max (다음줄). column, L600, 줄간격 4 */}
          <View style={{ width: "100%", paddingRight: 62, minHeight: 52, flexDirection: "column", gap: 4 }}>
            <AppText variant="L600" numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.or }}>
              {name}
            </AppText>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <AppText variant="L600" style={{ color: colors.or }}>
                {current}
              </AppText>
              <AppText variant="L600" className="text-gr500">
                /{max}
              </AppText>
            </View>
          </View>

          {/* 하단: 응원 말풍선 */}
          {hasCheer ? (
            <CheerBubble>
              <AppText variant="M500" style={{ color: colors.gr900, textAlign: "center" }}>
                <AppText variant="M600" style={{ color: colors.or }}>응원 {cheerCount}건</AppText>
                {"이 도착했어요!"}
              </AppText>
            </CheerBubble>
          ) : null}
        </View>
      </View>
    </View>
  );
}
