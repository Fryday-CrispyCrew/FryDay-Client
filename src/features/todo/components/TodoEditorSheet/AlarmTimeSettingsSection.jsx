import React, {useCallback, useMemo} from "react";
import {View, Text, TouchableOpacity, Platform, StyleSheet} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import colors from "../../../../shared/styles/colors";
import {toast} from "../../../../shared/components/toast/CenterToast";
import XCircleIcon from "../../assets/svg/xCircle.svg";
import AppText from "../../../../shared/components/AppText";
import {useModalStore} from "../../../../shared/stores/modal/modalStore";

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

  // todo date
  todoDateStr, // "2026-02-18" 형태의 투두 날짜 문자열

  // 반복 investigation instance override 확인 모달용
  masterAlarmHHmm = null, // recurrence Master 알림 시각 ("HH:mm"). 반복 instance 편집이 아니면 null

  // parent control
  onClosePanel, // 예: () => setSelectedToolKey(null)
}) {
  const openModal = useModalStore((s) => s.open);
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
    // ✅ 투두 날짜 + 알림 시간을 합산하여 현재 시간과 비교
    const isAlarmInPast = (timeHHmm) => {
      if (!todoDateStr || !timeHHmm) return false;
      const alarmDate = new Date(`${todoDateStr}T${timeHHmm}:00`);
      return alarmDate <= new Date();
    };

    // 실제 알림 적용 (setState + panel 닫기)
    const commitApply = (newHHmm) => {
      setAlarmTime(newHHmm);
      setHasPickedAlarmTime(true);
      setIsIosInlineAlarmPickerOpen(false);
      onClosePanel?.();
    };

    // 반복 Master 알림이 있는 instance 에서 새로운 개별 알림을 설정하려는 경우 확인 모달.
    // masterAlarmHHmm 이 null 이면 반복 instance 가 아니거나 Master 알림이 없음 → 모달 스킵.
    const needsOverrideConfirm = (newHHmm) =>
      !!masterAlarmHHmm && newHHmm && newHHmm !== masterAlarmHHmm;

    const applyWithMaybeConfirm = (newHHmm) => {
      if (!needsOverrideConfirm(newHHmm)) {
        commitApply(newHHmm);
        return;
      }
      openModal({
        title: "새 알림 적용하기",
        description:
          "새 알림을 설정하면 기존 반복 알림은 사라지고\n새 알림으로 적용돼요. 설정할까요?",
        showClose: true,
        closeOnBackdrop: true,
        backdropColor: "rgba(255,255,255,0.6)",
        buttons: [
          {
            label: "네, 설정할래요",
            variant: "primary",
            onPress: () => commitApply(newHHmm),
          },
          {
            label: "아니요, 반복 알림을 유지할래요",
            variant: "outline",
            onPress: () => {
              // 개별 알림 미적용 — draft 는 초기화
              setHasPickedAlarmTime(false);
              setIsIosInlineAlarmPickerOpen(false);
              onClosePanel?.();
            },
          },
        ],
      });
    };

    // ✅ iOS picker가 열려있었다면 무조건 시간이 선택된 것으로 간주
    if (Platform.OS === "ios" && isIosInlineAlarmPickerOpen) {
      // 선택한 시간이 현재 시간 이전인지 확인
      if (isAlarmInPast(hhmm)) {
        toast.show("알림 시간은 현재 시간 이후로 설정해야 합니다.");
        return;
      }

      applyWithMaybeConfirm(hhmm);
      return;
    }

    // ✅ clear를 눌러서 "미설정" 상태면, 적용하기는 '삭제/미설정 적용'으로 동작
    if (!hasPickedAlarmTime) {
      setAlarmTime(null);
      setIsIosInlineAlarmPickerOpen(false);
      onClosePanel?.();
      return;
    }

    // ✅ Android에서 시간을 고른 상태면 그 값 적용 (시간 체크)
    if (isAlarmInPast(hhmm)) {
      toast.show("알림 시간은 현재 시간 이후로 설정해야 합니다.");
      return;
    }

    // ✅ 실제로 시간을 고른 상태면 그 값 적용
    applyWithMaybeConfirm(hhmm);
  }, [
    hhmm,
    setAlarmTime,
    setHasPickedAlarmTime,
    setIsIosInlineAlarmPickerOpen,
    onClosePanel,
    hasPickedAlarmTime,
    isIosInlineAlarmPickerOpen,
    todoDateStr,
    masterAlarmHHmm,
    openModal,
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
              textColor={colors.or}
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
              {hasPickedAlarmTime && (
                <View style={styles.timeLeftPlaceholder} />
              )}

              <AppText variant="H1" style={styles.timeText}>
                {displayText}
              </AppText>

              {hasPickedAlarmTime && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.clearButton}
                  onPress={handleClear}
                  hitSlop={8}
                >
                  <XCircleIcon width={15} height={15} />
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
    // position: "relative",
    flexDirection: "row",
    height: 91,
    alignItems: "center",
    justifyContent: "center",
  },

  timeLeftPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 13,
    marginRight: 16,
    // borderWidth: 1,
  },

  timeText: {
    textAlign: "center",
    // fontSize: 24,
    lineHeight: 36,
    color: colors.or,
    // fontFamily: "Pretendard-Bold",
    // borderWidth: 1,
  },

  clearButton: {
    // position: "absolute",
    // right: "20%",
    width: 18,
    height: 18,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    // borderWidth: 1,
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
    marginTop: 32,
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
