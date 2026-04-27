import React from "react";
import { TouchableOpacity, View } from "react-native";
import ChevronIcon from "../../../../../shared/components/ChevronIcon";
import colors from "../../../../../shared/styles/colors";
import MemoIcon from "../../../assets/svg/todoEditorSheet/memo.svg";
import AlarmIcon from "../../../assets/svg/todoEditorSheet/alarm.svg";
import RepeatIcon from "../../../assets/svg/todoEditorSheet/repeat.svg";
import SelectDateIcon from "../../../assets/svg/todoEditorSheet/calendarSelect.svg";

const EDIT_TOOL_ICONS = [
  { key: "memo", Icon: MemoIcon },
  { key: "alarm", Icon: AlarmIcon },
  { key: "repeat", Icon: RepeatIcon },
  { key: "select", Icon: SelectDateIcon },
];

export default function EditToolsRow({
  selectedToolKey,
  onSelectTool,
  onSubmit,
  disabled,
  selectedColor,
}) {
  return (
    <View className="mt-4 mb-4 flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        {EDIT_TOOL_ICONS.map(({ key, Icon }) => {
          const isSelected = selectedToolKey === key;

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => onSelectTool(key)}
              className="w-7 h-7 rounded-[10px] items-center justify-center"
            >
              <Icon
                width={24}
                height={24}
                color={isSelected ? colors.or : colors.gr500}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSubmit}
        disabled={disabled}
        className={`ml-2 w-11 h-11 rounded-full items-center justify-center ${
          disabled ? "bg-[#E4E4E4]" : ""
        }`}
        style={
          !disabled
            ? { backgroundColor: selectedColor || "#FF5B22" }
            : null
        }
      >
        <ChevronIcon
          direction="right"
          size={24}
          color={disabled ? colors.gr300 : "#FFFFFF"}
          strokeWidth={2.5}
        />
      </TouchableOpacity>
    </View>
  );
}
