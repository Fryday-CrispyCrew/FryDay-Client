import React from "react";
import { TouchableOpacity, View } from "react-native";
import ChevronIcon from "../../../../shared/components/ChevronIcon";
import TitleInputSection from "./components/TitleInputSection";
import colors from "../../../../shared/styles/colors";

export default function CreateTodoSection({
  inputRef,
  editingText,
  setEditingText,
  handleSubmitInternal,
  isSubmitEnabled,
  isTitleFocused,
  setIsTitleFocused,
  handleClearText, selectedColor,
}) {
  return (
    <View className="flex-row items-center pb-4">
      <TitleInputSection
        mode="create"
        inputRef={inputRef}
        value={editingText}
        onChangeText={setEditingText}
        onSubmitEditing={handleSubmitInternal}
        isFocused={isTitleFocused}
        setIsFocused={setIsTitleFocused}
        onClear={handleClearText}
      />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSubmitInternal}
        disabled={!isSubmitEnabled}
        className={`ml-2 h-11 w-11 items-center justify-center rounded-full ${
          isSubmitEnabled ? "" : "bg-[#E4E4E4]"
        }`}
        style={
          isSubmitEnabled
            ? { backgroundColor: selectedColor || "#FF5B22" }
            : null
        }
      >
        <ChevronIcon
          direction="right"
          size={24}
          strokeWidth={2.5}
          color={isSubmitEnabled ? "#FFFFFF" : colors.gr300}
        />
      </TouchableOpacity>
    </View>
  );
}
