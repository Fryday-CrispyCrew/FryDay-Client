import React from "react";
import { View } from "react-native";
import RepeatRow from "./RepeatRow";
import AlarmTimeSettingSection from "../../TodoEditorSheet/AlarmTimeSettingsSection";
import { alarmLabel } from "../utils/labels";

export default function RepeatAlarmPanel({
  repeatAlarm,
  repeatAlarmTime,
  repeatAlarmDraftDate,
  hasPickedRepeatAlarmTime,
  isIosInlineRepeatAlarmPickerOpen,
  setRepeatAlarmDraftDate,
  setHasPickedRepeatAlarmTime,
  setIsIosInlineRepeatAlarmPickerOpen,
  setRepeatAlarm,
  setRepeatAlarmTime,
  onToggleOpenKey,
}) {
  return (
    <View>
      <RepeatRow
        label="반복 알림 설정"
        value={alarmLabel(repeatAlarm, repeatAlarmTime)}
        isOpen
        onPress={() => onToggleOpenKey("repeatAlarm")}
      />

      <View className="h-[287px] justify-evenly pb-3">
        <AlarmTimeSettingSection
          alarmDraftDate={repeatAlarmDraftDate}
          alarmTime={repeatAlarmTime}
          hasPickedAlarmTime={hasPickedRepeatAlarmTime}
          isIosInlineAlarmPickerOpen={isIosInlineRepeatAlarmPickerOpen}
          setAlarmDraftDate={setRepeatAlarmDraftDate}
          setHasPickedAlarmTime={setHasPickedRepeatAlarmTime}
          setIsIosInlineAlarmPickerOpen={setIsIosInlineRepeatAlarmPickerOpen}
          setAlarmTime={(t) => {
            const compact = t ? t.replace(/\s+/g, "") : null;

            if (!compact) {
              setRepeatAlarm("unset");
              setRepeatAlarmTime(null);
              return;
            }

            setRepeatAlarm("custom");
            setRepeatAlarmTime(compact);
          }}
          onClosePanel={() => onToggleOpenKey("repeatAlarm")}
        />
      </View>
    </View>
  );
}
