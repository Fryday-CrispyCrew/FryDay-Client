import React from "react";
import { TouchableOpacity, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import ClearIcon from "../../../../../shared/assets/svg/Clear.svg";
import colors from "../../../../../shared/styles/colors";
import {toast} from "../../../../../shared/components/toast/CenterToast";

function InputBase({
                     inputRef,
                     value,
                     onChangeText,
                     onSubmitEditing,
                     placeholder = "두근두근, 무엇을 튀겨볼까요?",
                     maxLength = 40,
                     onFocus,
                     onBlur,
                     className = "",
                     style,
                     editable = true,
                     onLimitPress,
                   }) {
  return (
    <BottomSheetTextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      placeholderTextColor="#C6C6C6"
      maxLength={maxLength+1}
      onKeyPress={({ nativeEvent }) => {
        if (
          value?.length > maxLength &&
          nativeEvent.key !== "Backspace"
        ) {
          onLimitPress?.();
        }
      }}
      onBlur={onBlur}
      onFocus={onFocus}
      editable={editable}
      showSoftInputOnFocus={editable}
      className={className}
      autoFocus={false}
      style={[
        {
          fontFamily: "Pretendard-Medium",
          fontSize: 12,
          color: colors.gr900,
          paddingRight: 26,
          paddingLeft: 0,
          paddingTop: 0,
          paddingBottom: 0,
          margin: 0,
          height: "100%",
        },
        style,
      ]}
    />
  );
}

export default function TitleInputSection({
  mode = "create",
  inputRef,
  value,
  onChangeText,
  onSubmitEditing,
  isFocused,
  setIsFocused,
  onClear,
  isMemoOpen = false,
  onFocusExtra,
  editable = true,
  maxLength = 40,
}) {
  const [localValue, setLocalValue] = React.useState(value ?? "");
  const lastEmittedRef = React.useRef(value ?? "");

  React.useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value ?? "";
      setLocalValue(value ?? "");
    }
  }, [value]);

  const handleChangeText = React.useCallback(
    (text) => {
      const chars = [...text];

      if (chars.length > maxLength) {
        toast.show("투두는 40자까지 입력 가능해요", {
          position: "center",
        });
      }
      const sliced = chars.slice(0, maxLength).join("");

      lastEmittedRef.current = sliced;
      setLocalValue(sliced);
      onChangeText?.(sliced);
    },
    [maxLength, onChangeText],
  );

  const handleClear = React.useCallback(() => {
    lastEmittedRef.current = "";
    setLocalValue("");
    onClear?.();
  }, [onClear]);

  const wrapperClass =
    mode === "create"
      ? "flex-1 rounded-2xl bg-[#FAFAFA] px-4 h-[44px] justify-center border border-gr100 relative"
      : `rounded-2xl bg-[#FAFAFA] px-4 h-[44px] justify-center border border-gr100 relative ${
          isMemoOpen ? "rounded-b-none" : ""
        }`;

  return (
    <View
      className={wrapperClass}
      style={isFocused ? { borderColor: "#EAEAEA" } : null}
    >
      <View pointerEvents={editable ? "auto" : "none"}>
        <InputBase
          inputRef={inputRef}
          value={localValue}
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          onLimitPress={() => {
            toast.show("투두는 40자까지 입력 가능해요", {
              position: "center",
            });
          }}
          onFocus={() => {
            if (!editable) return;
            setIsFocused?.(true);
            onFocusExtra?.();
          }}
          onBlur={() => setIsFocused?.(false)}
          className={
            mode === "create"
              ? "h-full text-[12px] text-gr900"
              : "h-full text-[12px] text-gr700"
          }
          style={mode === "edit" ? { color: colors.gr700 } : null}
        />
      </View>

      {!!localValue?.length && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClear}
          hitSlop={8}
          className="absolute right-3 top-0 bottom-0 w-6 items-center justify-center"
        >
          <ClearIcon width={16} height={16} color={colors.gr300} />
        </TouchableOpacity>
      )}
    </View>
  );
}
