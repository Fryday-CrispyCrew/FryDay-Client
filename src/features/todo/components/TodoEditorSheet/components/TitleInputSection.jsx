import React from "react";
import { TouchableOpacity, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import ClearIcon from "../../../../../shared/assets/svg/Clear.svg";
import colors from "../../../../../shared/styles/colors";

function InputBase({
  inputRef,
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = "두근두근, 무엇을 튀겨볼까요?",
  maxLength = 20,
  onFocus,
  onBlur,
  className = "",
  style,
}) {
  return (
    <BottomSheetTextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      placeholderTextColor="#C6C6C6"
      maxLength={maxLength}
      onBlur={onBlur}
      onFocus={onFocus}
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
}) {
  const [localValue, setLocalValue] = React.useState(value ?? "");

  React.useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleChangeText = React.useCallback(
    (text) => {
      setLocalValue(text);
      onChangeText?.(text);
    },
    [onChangeText],
  );

  const handleClear = React.useCallback(() => {
    setLocalValue("");
    onClear?.();
  }, [onClear]);

  const wrapperClass =
    mode === "create"
      ? "flex-1 rounded-2xl bg-[#FAFAFA] px-4 h-[46px] justify-center border border-gr100 relative"
      : `rounded-2xl bg-[#FAFAFA] px-4 min-h-[44px] justify-center border border-gr100 relative ${
          isMemoOpen ? "rounded-b-none" : ""
        }`;

  return (
    <View
      className={wrapperClass}
      style={isFocused ? { borderColor: "#EAEAEA" } : null}
    >
      <InputBase
        inputRef={inputRef}
        value={localValue}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => {
          setIsFocused?.(true);
          onFocusExtra?.();

          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }}
        onBlur={() => setIsFocused?.(false)}
        className={
          mode === "create"
            ? "h-full text-[12px] text-gr900"
            : "h-full text-[12px] text-gr700"
        }
        style={mode === "edit" ? { color: colors.gr700 } : null}
      />

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
