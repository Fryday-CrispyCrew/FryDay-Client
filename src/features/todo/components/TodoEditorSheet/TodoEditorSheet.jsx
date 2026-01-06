// src/features/todo/components/TodoEditorSheet/TodoEditorSheet.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {InteractionManager} from "react-native";
import MemoIcon from "../../assets/svg/todoEditorSheet/memo.svg";
import AlarmIcon from "../../assets/svg/todoEditorSheet/alarm.svg";
import RepeatIcon from "../../assets/svg/todoEditorSheet/repeat.svg";
import StartDateIcon from "../../assets/svg/todoEditorSheet/calendarStart.svg";
import SelectDateIcon from "../../assets/svg/todoEditorSheet/calendarSelect.svg";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import {useRepeatEditorStore} from "../../stores/repeatEditorStore";
import RepeatSettingsSection from "../RepeatSettingsSection/RepeatSettingsSection";
import colors from "../../../../shared/styles/colors";
import AlarmTimeSettingSection from "./AlarmTimeSettingsSection";

/**
 * ✅ BottomSheetTextInput만 분리 (IME-safe 로직 포함)
 * - 기존 로직 유지하면서 multiline 등 확장 props 추가
 */
function TodoBottomSheetTextInput({
  inputRef,
  value,
  onChangeText,
  onSubmitEditing,
  onEnabledChange,
  placeholder = "두근두근, 무엇을 튀겨볼까요?",
  maxLength = 20,
  style,
  multiline = false,
  blurOnSubmit = true,
  scrollEnabled = false,
  returnKeyType,
  onFocus,
  onBlur,
  autoFocus = false,
}) {
  const isSubmitEnabled = (value?.trim?.() ?? "").length > 0;

  const [localText, setLocalText] = useState(value);

  useEffect(() => {
    if (localText !== value) setLocalText(value);
  }, [value]);

  const onChangeLocalText = (text) => {
    setLocalText(text);
    onChangeText?.(text);
  };

  useEffect(() => {
    onEnabledChange?.(isSubmitEnabled);
  }, [isSubmitEnabled, onEnabledChange]);

  return (
    <BottomSheetTextInput
      ref={inputRef}
      value={localText}
      onChangeText={onChangeLocalText}
      placeholder={placeholder}
      placeholderTextColor="#C6C6C6"
      returnKeyType={returnKeyType ?? (multiline ? "default" : "done")}
      onSubmitEditing={onSubmitEditing}
      maxLength={maxLength}
      style={style}
      multiline={multiline}
      blurOnSubmit={blurOnSubmit}
      scrollEnabled={scrollEnabled}
      onFocus={onFocus}
      onBlur={onBlur}
      autoFocus={autoFocus}
    />
  );
}

const ORANGE = "#FF5B22";
const GRAY = "#8A8989";

const TodoEditorSheet = React.forwardRef(function TodoEditorSheet(
  {
    mode = "create", // ✅ "create" | "edit"
    value,
    onChangeText,
    onSubmit,
    onCloseTogether,
    onDismiss,
    categoryLabel = "카테고리",
    categories = [],
    initialCategoryId = 0,
  },
  ref
) {
  const insets = useSafeAreaInsets();
  const repeatPayload = useRepeatEditorStore.getState().getRepeatPayload();

  const EDIT_TOOL_ICONS = [
    {key: "memo", Icon: MemoIcon},
    {key: "alarm", Icon: AlarmIcon},
    {key: "repeat", Icon: RepeatIcon},
    {key: "start", Icon: StartDateIcon},
    {key: "select", Icon: SelectDateIcon},
  ];

  const inputRef = useRef(null);

  // ✅ 메모 입력용 ref/state 추가
  const memoInputRef = useRef(null);
  const [memoText, setMemoText] = useState("");

  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isMemoFocused, setIsMemoFocused] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState(initialCategoryId);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const [selectedToolKey, setSelectedToolKey] = useState(null);
  const selectedToolKeyRef = useRef(null);

  // 알림 시간(임시 선택 값)
  const [alarmDraftDate, setAlarmDraftDate] = useState(new Date());
  // 적용된 알림 시간(저장될 값)
  const [alarmTime, setAlarmTime] = useState(null); // e.g. "07:30"
  // ✅ 알림 시간을 "사용자가 실제로 선택했는지" (초기: 미설정 상태)
  const [hasPickedAlarmTime, setHasPickedAlarmTime] = useState(false);
  // ✅ iOS에서만: 버튼 누른 뒤 인라인 스피너로 전환
  const [isIosInlineAlarmPickerOpen, setIsIosInlineAlarmPickerOpen] =
    useState(false);

  // ✅ repeat panel 내부 드롭다운 open 상태 (하나만 열리게)
  const [openRepeatDropdownKey, setOpenRepeatDropdownKey] = useState(null); // "repeatStart" | "repeatEnd" | "repeatCycle" | "repeatAlarm" | null

  const isMemoOpen = mode === "edit" && selectedToolKey === "memo";
  2;
  const isAlarmOpen = mode === "edit" && selectedToolKey === "alarm";
  const isRepeatOpen = mode === "edit" && selectedToolKey === "repeat";

  useEffect(() => {
    selectedToolKeyRef.current = selectedToolKey;
  }, [selectedToolKey]);

  useEffect(() => {
    if (!isRepeatOpen) setOpenRepeatDropdownKey(null);
  }, [isRepeatOpen]);

  useEffect(() => {
    if (isAlarmOpen) {
      // ✅ 알림 패널에 들어올 때, 아직 저장된 알림이 없으면 "미설정" 상태 유지
      if (!alarmTime) setHasPickedAlarmTime(false);
      // ✅ 저장된 알림이 있다면(추후 todo 편집 진입 시 주입한다면) 표시 상태로
      if (alarmTime) setHasPickedAlarmTime(true);
    }
  }, [isAlarmOpen, alarmTime]);

  useEffect(() => {
    if (!isAlarmOpen) setIsIosInlineAlarmPickerOpen(false);
  }, [isAlarmOpen]);

  const toggleRepeatDropdown = useCallback((key) => {
    setOpenRepeatDropdownKey((prev) => (prev === key ? null : key));
  }, []);

  // ✅ edit일 때 높이 조금 더 (메모 input이 나타나므로 상향)
  const snapPoints = useMemo(() => {
    return mode === "edit" ? ["20%"] : ["15%"];
  }, [mode]);

  const blurAllInputs = useCallback(() => {
    // TextInput blur
    inputRef.current?.blur?.();
    memoInputRef.current?.blur?.();

    // focus 상태 리셋 (borderColor 원복)
    setIsTitleFocused(false);
    setIsMemoFocused(false);

    // 키보드까지 확실히 내리고 싶다면
    Keyboard.dismiss();
  }, []);

  const openToolAfterKeyboardDismiss = useCallback((key) => {
    // 1) 먼저 포커스/키보드 정리
    inputRef.current?.blur?.();
    memoInputRef.current?.blur?.();
    setIsTitleFocused(false);
    setIsMemoFocused(false);
    Keyboard.dismiss();

    // 2) 키보드/시트 인터랙션이 끝난 다음 프레임에 패널 오픈
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setSelectedToolKey(key);
      });
    });
  }, []);

  const focusTitleInput = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, []);

  const blurMemoOnly = useCallback(() => {
    memoInputRef.current?.blur?.();
    setIsMemoFocused(false);
  }, []);

  const closeToolAndFocusTitle = useCallback(
    (closingKey) => {
      // ✅ 메모 입력이 열려있었으면 메모만 내리기
      blurMemoOnly();

      // ✅ 알림 인라인 picker도 같이 닫기
      if (closingKey === "alarm") setIsIosInlineAlarmPickerOpen(false);

      // ✅ 키보드는 내리지 않고, 제목 input으로 포커스 이동
      setIsTitleFocused(true);
      focusTitleInput();
    },
    [blurMemoOnly, focusTitleInput]
  );

  const onSelectTool = useCallback(
    (key) => {
      const current = selectedToolKeyRef.current;

      // ✅ 같은 아이콘 다시 누르면: 패널 닫고 제목으로 복귀(키보드 올리기)
      if (current === key) {
        if (key === "alarm") setIsIosInlineAlarmPickerOpen(false);
        setSelectedToolKey(null);
        setIsTitleFocused(true);
        focusTitleInput();
        return;
      }

      // ✅ memo는 키보드 유지(메모 입력 UX) - 기존 의도 유지
      if (key === "memo") {
        setSelectedToolKey("memo");
        return;
      }

      // ✅ alarm/repeat/start/select 등: A안 적용 (키보드 내려간 뒤 열기)
      if (key === "alarm") setIsIosInlineAlarmPickerOpen(false);
      openToolAfterKeyboardDismiss(key);
    },
    [focusTitleInput, openToolAfterKeyboardDismiss]
  );

  const focusInput = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, []);

  const handleSheetAnimate = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === -1 && toIndex >= 0) focusInput();
    },
    [focusInput]
  );

  const renderBackdrop = useCallback(
    (props) => (
      <Pressable style={[StyleSheet.absoluteFill]} onPress={onCloseTogether}>
        <BottomSheetBackdrop
          {...props}
          pressBehavior="none"
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      </Pressable>
    ),
    [onCloseTogether]
  );

  useEffect(() => {
    setDraftCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  const handlePickCategory = useCallback((categoryId) => {
    setDraftCategoryId(categoryId);
    setIsCategoryOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, []);

  const handleSubmitInternal = useCallback(() => {
    const payload = {
      // 기존 title, memo, icon 등등...
      ...repeatPayload,
    };

    // ✅ 추후 서버에 memo도 저장하려면 payload로 확장
    // onSubmit?.({ categoryId: draftCategoryId, title: value, memo: memoText })
    onSubmit?.(draftCategoryId);
  }, [onSubmit, draftCategoryId]);

  const handleDismiss = useCallback(() => {
    setIsCategoryOpen(false);
    setDraftCategoryId(initialCategoryId);
    setSelectedToolKey(null);
    setMemoText(""); // ✅ 닫을 때 메모 입력 초기화
    onDismiss?.();
  }, [onDismiss, initialCategoryId]);

  const otherCategories = useMemo(() => {
    return categories
      .filter((c) => c.categoryId !== 0)
      .filter((c) => c.categoryId !== draftCategoryId);
  }, [categories, draftCategoryId]);

  const handleClearText = useCallback(() => {
    onChangeText?.("");
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, [onChangeText]);

  const renderEditTools = () => {
    return (
      <View style={styles.toolsRow}>
        <View style={styles.toolsLeft}>
          {EDIT_TOOL_ICONS.map(({key, Icon}) => {
            const isSelected = selectedToolKey === key;

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                style={styles.toolIconButton}
                onPress={() => onSelectTool(key)}
              >
                <Icon
                  width={24}
                  height={24}
                  color={isSelected ? ORANGE : GRAY}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSubmitInternal}
          disabled={!isSubmitEnabled}
          style={[
            styles.submitButton,
            !isSubmitEnabled && styles.submitButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.submitIcon,
              !isSubmitEnabled && styles.submitIconDisabled,
            ]}
          >
            ➔
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      // snapPoints={snapPoints}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      onAnimate={handleSheetAnimate}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{backgroundColor: "#FAFAFA"}}
      handleIndicatorStyle={{backgroundColor: "#D0D0D0", width: "38.4%"}}
      enableContentPanningGesture={false} // ✅ content로는 시트 이동 X (고정)
      bottomInset={insets.bottom}
      // detached={true}
    >
      <BottomSheetView>
        <View style={styles.container}>
          {/* 카테고리 row */}
          <View style={styles.categoryInlineRow}>
            <View style={styles.categoryChipSelected}>
              <Text style={styles.categorySelectedText}>
                {categories.find((c) => c.categoryId === draftCategoryId)
                  ?.label ?? categoryLabel}
              </Text>
            </View>

            {!isCategoryOpen && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsCategoryOpen(true)}
                style={styles.chevronButton}
                hitSlop={8}
              >
                <Text style={styles.chevronText}>›</Text>
              </TouchableOpacity>
            )}

            {isCategoryOpen && (
              <ScrollView
                horizontal
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryInlineList}
                style={styles.categoryInlineScroll}
              >
                {otherCategories.map((c) => (
                  <TouchableOpacity
                    key={c.categoryId}
                    activeOpacity={0.7}
                    onPress={() => handlePickCategory(c.categoryId)}
                    style={styles.categoryChip}
                  >
                    <Text style={styles.categoryText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* ✅ create/edit 레이아웃 분기 */}
          {mode === "create" ? (
            // ===== 생성 모드: input 옆에 submit =====
            <View style={styles.inputRow}>
              <View
                style={[
                  styles.inputWrapper,
                  isTitleFocused && styles.inputWrapperFocused,
                ]}
              >
                <TodoBottomSheetTextInput
                  inputRef={inputRef}
                  value={value}
                  onChangeText={onChangeText}
                  onSubmitEditing={handleSubmitInternal}
                  onEnabledChange={setIsSubmitEnabled}
                  maxLength={20}
                  style={styles.input}
                  onFocus={() => setIsTitleFocused(true)}
                  onBlur={() => setIsTitleFocused(false)}
                />

                {!!value?.length && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClearText}
                    style={styles.clearButton}
                    hitSlop={8}
                  >
                    <Text style={styles.clearIcon}>×</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSubmitInternal}
                disabled={!isSubmitEnabled}
                style={[
                  styles.submitButton,
                  !isSubmitEnabled && styles.submitButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.submitIcon,
                    !isSubmitEnabled && styles.submitIconDisabled,
                  ]}
                >
                  ➔
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // ===== 수정 모드: memo 선택 시 제목 아래 메모 input + toolsRow + submit =====
            <View>
              <View
                style={[
                  styles.inputWrapperEdit,
                  isTitleFocused && styles.inputWrapperFocused,
                ]}
              >
                <TodoBottomSheetTextInput
                  inputRef={inputRef}
                  value={value}
                  onChangeText={onChangeText}
                  onSubmitEditing={handleSubmitInternal}
                  onEnabledChange={setIsSubmitEnabled}
                  maxLength={20}
                  style={styles.inputEdit}
                  placeholder="두근두근, 무엇을 튀겨볼까요?"
                  onFocus={() => {
                    setIsTitleFocused(true);

                    if (selectedToolKey) {
                      // ✅ 켜져있던 툴/패널 닫기
                      setSelectedToolKey(null);
                      // ✅ repeat 내부 드롭다운도 정리
                      setOpenRepeatDropdownKey(null);
                      // ✅ 알림 인라인 picker 정리
                      setIsIosInlineAlarmPickerOpen(false);
                      // ✅ 메모 input 열려있으면 내려주기
                      blurMemoOnly();
                    }
                  }}
                  onBlur={() => setIsTitleFocused(false)}
                />

                {!!value?.length && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClearText}
                    style={styles.clearButton}
                    hitSlop={8}
                  >
                    <Text style={styles.clearIcon}>×</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* ✅ memo 아이콘 선택 시: 최대 3줄 메모 input */}
              {isMemoOpen && (
                <View
                  style={[
                    styles.memoWrapper,
                    isMemoFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <TodoBottomSheetTextInput
                    inputRef={memoInputRef}
                    value={memoText}
                    onChangeText={setMemoText}
                    onEnabledChange={() => {}}
                    placeholder="기억해야 할 메모를 입력해 주세요."
                    maxLength={200}
                    multiline
                    blurOnSubmit={false}
                    scrollEnabled
                    style={styles.memoInput}
                    onFocus={() => setIsMemoFocused(true)}
                    onBlur={() => setIsMemoFocused(false)}
                    autoFocus={true}
                  />
                </View>
              )}

              {renderEditTools()}

              {/* ✅ iOS/Android 공통: 처음엔 동일한 '미설정' UI */}
              {isAlarmOpen && (
                <View style={styles.alarmPanel}>
                  <Text style={styles.alarmTitle}>알림 설정</Text>

                  <AlarmTimeSettingSection
                    alarmDraftDate={alarmDraftDate}
                    alarmTime={alarmTime}
                    hasPickedAlarmTime={hasPickedAlarmTime}
                    isIosInlineAlarmPickerOpen={isIosInlineAlarmPickerOpen}
                    setAlarmDraftDate={setAlarmDraftDate}
                    setAlarmTime={setAlarmTime}
                    setHasPickedAlarmTime={setHasPickedAlarmTime}
                    setIsIosInlineAlarmPickerOpen={
                      setIsIosInlineAlarmPickerOpen
                    }
                    onClosePanel={() => setSelectedToolKey(null)}
                    styles={styles}
                  />
                </View>
              )}

              <RepeatSettingsSection
                visible={isRepeatOpen}
                openKey={openRepeatDropdownKey}
                onToggleOpenKey={toggleRepeatDropdown}
              />
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default TodoEditorSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    // paddingBottom: 16,
  },

  categoryInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },

  categoryChipSelected: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FF5B22",
  },
  categorySelectedText: {
    fontSize: 13,
    color: "#FFFFFF",
  },

  chevronButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronText: {
    fontSize: 28,
    lineHeight: 22,
    color: "#B0B0B0",
  },

  categoryInlineScroll: {flex: 1},
  categoryInlineList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 6,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F0F0F0",
  },
  categoryText: {
    fontSize: 13,
    color: "#B0B0B0",
  },

  // ===== create =====
  inputRow: {flexDirection: "row", alignItems: "center"},
  inputWrapper: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingVertical: 6,
    position: "relative",
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  inputWrapperFocused: {
    borderColor: "#EAEAEA",
  },
  input: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: "#333333",
    paddingRight: 26,
  },

  // ===== edit =====
  inputWrapperEdit: {
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingVertical: 6,
    position: "relative",
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  inputEdit: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: "#333333",
    paddingRight: 26,
    // borderWidth: 1,
  },

  // ✅ memo input
  memoWrapper: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  // ✅ "3줄" 높이로 제한 (lineHeight 18 * 3 = 54)
  memoInput: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: "#333333",
    lineHeight: 18,
    // minHeight: 54,
    maxHeight: 54,
    textAlignVertical: "top",
    paddingVertical: 0, // wrapper가 padding을 담당하므로 깔끔
    // borderWidth: 1,
  },

  clearButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
  },
  clearIcon: {
    fontSize: 16,
    lineHeight: 16,
    color: "#B0B0B0",
  },

  // ===== edit tools row =====
  toolsRow: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // borderWidth: 1,
  },
  toolsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  toolIconButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // submit (공통)
  submitButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF5B22",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#E4E4E4",
  },
  submitIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  submitIconDisabled: {
    color: "#888888",
  },
  panelWrapper: {
    marginTop: 14,
  },
  panelTitle: {
    fontSize: 12,
    color: "#B0B0B0",
    marginBottom: 10,
  },
  pickerBox: {
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
  },
  panelFooter: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  applyButton: {
    backgroundColor: "#FF5B22",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
  },
  alarmPanel: {
    justifyContent: "space-between",
    minHeight: 335,
    paddingTop: 16,
    paddingBottom: 32,
    // borderWidth: 1,
  },
  alarmTitle: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.gr700,
    marginBottom: 10,
  },
});
