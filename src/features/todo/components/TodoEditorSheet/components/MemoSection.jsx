import React from "react";
import { View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

export default function MemoSection({
  visible,
  memoInputRef,
  value,
  onChangeText,
  isFocused,
  setIsFocused,
}) {
  if (!visible) return null;

  return (
    <View
      className="rounded-2xl rounded-t-none bg-[#FAFAFA] px-4 py-3 border border-[#F2F2F2]"
      style={isFocused ? { borderColor: "#EAEAEA" } : null}
    >
      <BottomSheetTextInput
        ref={memoInputRef}
        value={value ?? ""}
        onChangeText={onChangeText}
        placeholder="기억해야 할 메모를 입력해 주세요."
        placeholderTextColor="#C6C6C6"
        maxLength={101}
        multiline
        blurOnSubmit={false}
        scrollEnabled
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="py-0 text-[12px] text-gr700"
        style={{
          fontFamily: "Pretendard-Medium",
          lineHeight: 18,
          maxHeight: 54,
          textAlignVertical: "top",
        }}
      />
    </View>
  );
}
