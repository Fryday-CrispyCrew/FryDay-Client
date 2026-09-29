import React from "react";
import { View } from "react-native";
import AppText from "../../../shared/components/AppText";

/**
 * 설정 페이지에서 sub-section 을 감싸는 래퍼.
 * 상단 회색 라벨 + 자식 (카드/버튼 등).
 *
 * @prop {string} label - "그룹 정보", "그룹 설정" 같은 섹션 라벨
 * @prop {ReactNode} children
 * @prop {object} style - 외곽 style override
 */
export default function SettingSection({ label, children, style }) {
  return (
    <View style={[{ paddingHorizontal: 20 }, style]}>
      {label ? (
        <AppText
          variant="M500"
          className="text-gr500"
          style={{ marginBottom: 8, marginLeft: 4 }}
        >
          {label}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}
