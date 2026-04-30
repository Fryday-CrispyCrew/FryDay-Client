import React, { useRef } from "react";
import { View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { toast } from "../../../../../shared/components/toast/CenterToast";
import colors from "../../../../../shared/styles/colors";

export default function MemoSection({
  visible,
  memoInputRef,
  value,
  onChangeText,
  isFocused,
  setIsFocused,
}) {
  const currentTextRef = useRef(value ?? "");
  if (!visible) return null;

  const handleChangeText = (text) => {
    currentTextRef.current = text;
    onChangeText(text);
  };

  const handleKeyPress = ({ nativeEvent }) => {
    if (
      currentTextRef.current.length >= 100 &&
      nativeEvent.key !== "Backspace"
    ) {
      toast.show("메모는 100자까지 입력 가능합니다.");
    }
  };

  return (
    <View
      className="rounded-2xl rounded-t-none bg-[#FAFAFA] px-4 py-3 border border-[#F2F2F2]"
      style={isFocused ? { borderColor: "#EAEAEA" } : null}
    >
      <BottomSheetTextInput

        ref={memoInputRef}
        defaultValue={value ?? ""}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        maxLength={100}
        placeholder="기억해야 할 메모를 입력해 주세요."
        placeholderTextColor="#C6C6C6"
        multiline
        blurOnSubmit={false}
        scrollEnabled
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          fontFamily: "Pretendard-Medium",
          fontSize: 12,
          lineHeight: 18,
          maxHeight: 54,
          textAlignVertical: "top",
          paddingTop: 0,
          paddingBottom: 0,
          color:colors.gr700
        }}
      />
    </View>
  );
}
