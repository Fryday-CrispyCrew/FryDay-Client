import React from "react";
import { View } from "react-native";
import colors from "../../../shared/styles/colors";

const TAIL_WIDTH = 16;
const TAIL_HEIGHT = 8;
const BORDER = 1;

/**
 * 캐릭터 위에 뜨는 말풍선. 아래쪽 중앙에 tail 삼각형.
 * 그림자 없음, border 만.
 */
export default function SpeechBubble({ children, style }) {
  return (
    <View style={[{ alignItems: "center" }, style]}>
      <View
        style={{
          backgroundColor: colors.wt,
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderWidth: BORDER,
          borderColor: colors.gr100,
        }}
      >
        {children}
      </View>

      {/* tail: border 색 (뒤) + bg 색 (앞) 겹쳐서 테두리 유지 */}
      <View style={{ marginTop: -BORDER, alignItems: "center" }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: TAIL_WIDTH / 2 + BORDER,
            borderRightWidth: TAIL_WIDTH / 2 + BORDER,
            borderTopWidth: TAIL_HEIGHT + BORDER,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: colors.gr100,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            width: 0,
            height: 0,
            borderLeftWidth: TAIL_WIDTH / 2,
            borderRightWidth: TAIL_WIDTH / 2,
            borderTopWidth: TAIL_HEIGHT,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: colors.wt,
          }}
        />
      </View>
    </View>
  );
}
