// src/screens/Home/components/TodoEditorSheet.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {InteractionManager} from "react-native";
import MemoIcon from "../assets/svg/todoEditorSheet/memo.svg";
import AlarmIcon from "../assets/svg/todoEditorSheet/alarm.svg";
import RepeatIcon from "../assets/svg/todoEditorSheet/repeat.svg";
import StartDateIcon from "../assets/svg/todoEditorSheet/calendarStart.svg";
import SelectDateIcon from "../assets/svg/todoEditorSheet/calendarSelect.svg";

/**
 * ✅ BottomSheetTextInput만 분리 (IME-safe 로직 포함)
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
      returnKeyType="done"
      onSubmitEditing={onSubmitEditing}
      maxLength={maxLength}
      style={style}
    />
  );
}

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
  const EDIT_TOOL_ICONS = [
    {
      key: "memo",
      Icon: MemoIcon,
      onPress: () => {
        /* TODO */
      },
    },
    {
      key: "alarm",
      Icon: AlarmIcon,
      onPress: () => {
        /* TODO */
      },
    },
    {
      key: "repeat",
      Icon: RepeatIcon,
      onPress: () => {
        /* TODO */
      },
    },
    {
      key: "start",
      Icon: StartDateIcon,
      onPress: () => {
        /* TODO */
      },
    },
    {
      key: "select",
      Icon: SelectDateIcon,
      onPress: () => {
        /* TODO */
      },
    },
  ];

  const inputRef = useRef(null);

  // ✅ edit일 때 높이 조금 더
  const snapPoints = useMemo(() => {
    return mode === "edit" ? ["20%"] : ["15%"];
  }, [mode]);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState(initialCategoryId);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const [selectedToolKey, setSelectedToolKey] = useState(null);

  const onSelectTool = useCallback((key) => {
    setSelectedToolKey(key); // ✅ 라디오: 누르면 그 아이콘만 선택
  }, []);

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
    onSubmit?.(draftCategoryId);
  }, [onSubmit, draftCategoryId]);

  const handleDismiss = useCallback(() => {
    setIsCategoryOpen(false);
    setDraftCategoryId(initialCategoryId);
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

  // ✅ (수정 모드) 아이콘 5개는 로컬 svg로 교체 예정
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
                {/* ✅ 선택된 아이콘만 주황색 */}
                <Icon
                  width={24}
                  height={24}
                  color={isSelected ? "#FF5B22" : "#8A8989"}
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
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      onAnimate={handleSheetAnimate}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{backgroundColor: "#FAFAFA"}}
      handleIndicatorStyle={{backgroundColor: "#D0D0D0", width: "38.4%"}}
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
              <View style={styles.inputWrapper}>
                <TodoBottomSheetTextInput
                  inputRef={inputRef}
                  value={value}
                  onChangeText={onChangeText}
                  onSubmitEditing={handleSubmitInternal}
                  onEnabledChange={setIsSubmitEnabled}
                  maxLength={20}
                  style={styles.input}
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
            // ===== 수정 모드: input 아래 toolsRow + submit =====
            <View>
              <View style={styles.inputWrapperEdit}>
                <TodoBottomSheetTextInput
                  inputRef={inputRef}
                  value={value}
                  onChangeText={onChangeText}
                  onSubmitEditing={handleSubmitInternal}
                  onEnabledChange={setIsSubmitEnabled}
                  maxLength={20}
                  style={styles.inputEdit}
                  placeholder="두근두근, 무엇을 튀겨볼까요?"
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

              {renderEditTools()}
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
    paddingBottom: 16,
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
    borderColor: "#EAEAEA",
  },
  inputEdit: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: "#333333",
    paddingRight: 26,
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
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  toolIconPlaceholder: {
    fontSize: 14,
    color: "#9B9B9B",
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
});
