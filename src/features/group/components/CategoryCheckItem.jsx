import React from "react";
import { Pressable } from "react-native";
import AppText from "../../../shared/components/AppText";
import TodoRadioOnIcon from "../../todo/assets/svg/RadioOn.svg";
import TodoRadioOffIcon from "../../todo/assets/svg/RadioOff.svg";

/**
 * 공개 카테고리 선택 리스트의 한 줄.
 * 투두 탭에서 쓰던 체크박스 아이콘(RadioOn/Off) 재사용.
 * checked 시 아이콘 색상 = 카테고리 색상.
 *
 * @prop {{ id, label, color }} category
 * @prop {boolean} checked
 * @prop {(next: boolean) => void} onToggle
 */
export default function CategoryCheckItem({ category, checked, onToggle }) {
  // 서버 raw 응답 필드는 colorHex, todo 화면들에선 color 로 매핑해 씀. 둘 다 폴백.
  const color = category?.color ?? category?.colorHex ?? "#FF5B22";

  return (
    <Pressable
      onPress={() => onToggle?.(!checked)}
      hitSlop={4}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      {checked ? (
        <TodoRadioOnIcon width={24} height={24} color={color} />
      ) : (
        <TodoRadioOffIcon width={24} height={24} />
      )}
      <AppText variant="L500" className="text-bk" style={{ marginLeft: 12 }}>
        {category?.label ?? category?.name ?? ""}
      </AppText>
    </Pressable>
  );
}
