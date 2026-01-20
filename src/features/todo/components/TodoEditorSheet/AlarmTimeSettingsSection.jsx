import React, {useCallback, useMemo} from "react";
import {View, Text, TouchableOpacity, Platform, StyleSheet} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import colors from "../../../../shared/styles/colors";

/**
 * Alarm UI (alarmBox ~ alarmFooter) 전담 컴포넌트
 * - 상태값은 부모가 들고
 * - 로직/함수/스타일은 여기서 관리
 */
export default function AlarmTimeSettingSection({
  // state
  alarmDraftDate,
  alarmTime, // (optional) 안 쓰면 제거 가능
  hasPickedAlarmTime,
  isIosInlineAlarmPickerOpen,

  // setters
  setAlarmDraftDate,
  setAlarmTime,
  setHasPickedAlarmTime,
  setIsIosInlineAlarmPickerOpen,

  // parent control
  onClosePanel, // 예: () => setSelectedToolKey(null)
}) {
  const hhmm = useMemo(() => {
    const h = String(alarmDraftDate.getHours()).padStart(2, "0");
    const m = String(alarmDraftDate.getMinutes()).padStart(2, "0");
    return `${h}:${m}`; // ✅ 저장/전송용
  }, [alarmDraftDate]);

  const displayHHmm = useMemo(() => {
    const [h, m] = hhmm.split(":");
    return `${h}   :   ${m}`; // ✅ 화면 표시용 (기존 UI 유지)
  }, [hhmm]);

  const displayText = hasPickedAlarmTime ? displayHHmm : "--   :   --";

  const openAndroidAlarmPicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: alarmDraftDate,
      mode: "time",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event?.type === "dismissed") return;
        if (!selectedDate) return;

        setAlarmDraftDate(selectedDate);
        setHasPickedAlarmTime(true);
      },
    });
  }, [alarmDraftDate, setAlarmDraftDate, setHasPickedAlarmTime]);

  const handlePressPick = useCallback(() => {
    if (Platform.OS === "android") {
      openAndroidAlarmPicker();
      return;
    }
    setIsIosInlineAlarmPickerOpen(true);
  }, [openAndroidAlarmPicker, setIsIosInlineAlarmPickerOpen]);

  const handleClear = useCallback(() => {
    setHasPickedAlarmTime(false);
    setAlarmTime(null);
    setIsIosInlineAlarmPickerOpen(false);
  }, [setHasPickedAlarmTime, setAlarmTime, setIsIosInlineAlarmPickerOpen]);

  const handleApply = useCallback(() => {
    // ✅ clear를 눌러서 "미설정" 상태면, 적용하기는 '삭제/미설정 적용'으로 동작
    if (!hasPickedAlarmTime) {
      setAlarmTime(null);
      setIsIosInlineAlarmPickerOpen(false);
      onClosePanel?.();
      return;
    }

    // ✅ 실제로 시간을 고른 상태면 그 값 적용
    setAlarmTime(hhmm);
    setHasPickedAlarmTime(true);
    setIsIosInlineAlarmPickerOpen(false);
    onClosePanel?.();
  }, [
    hhmm,
    setAlarmTime,
    setHasPickedAlarmTime,
    setIsIosInlineAlarmPickerOpen,
    onClosePanel,
    hasPickedAlarmTime,
  ]);

  return (
    <>
      {/* alarmBox */}
      <View style={styles.box}>
        {Platform.OS === "ios" && isIosInlineAlarmPickerOpen ? (
          <View style={styles.iosInlineBox}>
            <DateTimePicker
              value={alarmDraftDate}
              mode="time"
              display="spinner"
              minuteInterval={1}
              onChange={(event, date) => {
                if (!date) return;
                setAlarmDraftDate(date);
                setHasPickedAlarmTime(true);
              }}
              style={styles.iosInlinePicker}
            />
          </View>
        ) : (
          <>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{displayText}</Text>

              {hasPickedAlarmTime && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.clearButton}
                  onPress={handleClear}
                  hitSlop={8}
                >
                  <Text style={styles.clearIcon}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.pickButton}
              onPress={handlePressPick}
            >
              <Text style={styles.pickText}>
                여기를 터치해서 알림 시간 설정하기
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* alarmFooter */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyText}>적용하기</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
  },

  timeRow: {
    position: "relative",
    height: 91,
    alignItems: "center",
    justifyContent: "center",
  },

  timeText: {
    textAlign: "center",
    fontSize: 24,
    lineHeight: 36,
    color: colors.or,
    fontFamily: "Pretendard-Bold",
  },

  clearButton: {
    position: "absolute",
    right: "20%",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  clearIcon: {
    fontSize: 18,
    lineHeight: 18,
    color: "#B0B0B0",
  },

  divider: {
    height: 1,
    backgroundColor: "#E6E6E6",
  },

  pickButton: {
    height: 73,
    alignItems: "center",
    justifyContent: "center",
  },

  pickText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: colors.gr500,
  },

  iosInlineBox: {
    height: 164,
    alignItems: "center",
    justifyContent: "center",
  },

  iosInlinePicker: {
    width: "100%",
  },

  footer: {
    marginTop: 18,
    alignItems: "flex-end",
  },

  applyButton: {
    // height: 52,
    paddingVertical: 12,
    width: 100,
    borderRadius: 16,
    backgroundColor: colors.or,
    alignItems: "center",
    justifyContent: "center",
  },

  applyText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: colors.wt,
  },
});
