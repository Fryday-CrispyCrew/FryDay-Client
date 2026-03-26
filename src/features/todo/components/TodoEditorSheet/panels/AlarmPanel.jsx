import React from "react";
import { View } from "react-native";
import ChevronIcon from "../../../../../shared/components/ChevronIcon";
import AlarmTimeSettingSection from "../AlarmTimeSettingsSection";

export default function AlarmPanel({
  visible,
  alarmDraftDate,
  alarmTime,
  hasPickedAlarmTime,
  isIosInlineAlarmPickerOpen,
  setAlarmDraftDate,
  setAlarmTime,
  setHasPickedAlarmTime,
  setIsIosInlineAlarmPickerOpen,
  todoDateStr,
  onClosePanel,
}) {
  if (!visible) return null;

  return (
    <View className="min-h-[335px] pb-8">
      <View className="py-[15px]">
        <ChevronIcon direction="down" size={0} color="transparent" />
      </View>

      <AlarmTimeSettingSection
        alarmDraftDate={alarmDraftDate}
        alarmTime={alarmTime}
        hasPickedAlarmTime={hasPickedAlarmTime}
        isIosInlineAlarmPickerOpen={isIosInlineAlarmPickerOpen}
        setAlarmDraftDate={setAlarmDraftDate}
        setAlarmTime={setAlarmTime}
        setHasPickedAlarmTime={setHasPickedAlarmTime}
        setIsIosInlineAlarmPickerOpen={setIsIosInlineAlarmPickerOpen}
        todoDateStr={todoDateStr}
        onClosePanel={onClosePanel}
      />
    </View>
  );
}
