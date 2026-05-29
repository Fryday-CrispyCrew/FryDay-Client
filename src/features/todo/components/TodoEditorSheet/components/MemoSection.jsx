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
  const [localValue, setLocalValue] = React.useState(value ?? "");
  const lastEmittedRef = useRef(value ?? "");

  React.useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value ?? "";
      setLocalValue(value ?? "");
    }
  }, [value]);

  if (!visible) return null;

  const handleChangeText = (text) => {
    const chars = [...text];
    if (chars.length > 100) {
      toast.show("메모는 100자까지 입력 가능합니다.");
    }
    const sliced = chars.slice(0, 100).join("");

    lastEmittedRef.current = sliced;
    setLocalValue(sliced);
    onChangeText(sliced);
  };

  return (
    <View
      className="rounded-2xl rounded-t-none bg-[#FAFAFA] px-4 py-3 border border-gr100 border-t-0">
      <BottomSheetTextInput

        ref={memoInputRef}
        value={localValue}
        onChangeText={handleChangeText}
        maxLength={101}
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
