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

/**
 * ✅ BottomSheetModal 내부 UI만 분리한 컴포넌트
 * - 같은 파일 안에서만 사용 (외부 export X)
 * - state/handler는 TodoEditorSheet에서 내려줌 (presentational + small callbacks)
 */
function TodoEditorSheetContent({
  value,
  onChangeText,
  onSubmitInternal,
  categories,
  categoryLabel,
  isCategoryOpen,
  setIsCategoryOpen,
  draftCategoryId,
  otherCategories,
  onPickCategory,
  onClearText,
  inputRef,
}) {
  const [localText, setLocalText] = useState(value);
  useEffect(() => {
    if (localText !== value) setLocalText(value);
  }, [value]);

  const onChangeLocalText = (text) => {
    setLocalText(text);
    onChangeText(text);
  };

  // useEffect(() => {
  //   console.log("localText changed in editor sheet:", localText);
  // }, [localText]);
  // useEffect(() => {
  //   console.log("value changed in editor sheet:", value);
  // }, [value]);

  return (
    <BottomSheetView>
      <View style={styles.container}>
        {/* ✅ 카테고리 한 줄: [선택칩] [chevron] [나머지 카테고리들(열렸을 때만)] */}
        <View style={styles.categoryInlineRow}>
          <View style={styles.categoryChipSelected}>
            <Text style={styles.categorySelectedText}>
              {categories.find((c) => c.categoryId === draftCategoryId)
                ?.label ?? categoryLabel}
            </Text>
          </View>

          {/* ✅ 리스트가 닫혀 있을 때만 '>' 보이게 */}
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
                  onPress={() => onPickCategory(c.categoryId)}
                  style={styles.categoryChip}
                >
                  <Text style={styles.categoryText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 입력창 + 전송 버튼 */}
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <BottomSheetTextInput
              ref={inputRef}
              value={localText}
              onChangeText={onChangeLocalText}
              placeholder="두근두근, 무엇을 튀겨볼까요?"
              placeholderTextColor="#C6C6C6"
              returnKeyType="done"
              onSubmitEditing={onSubmitInternal}
              maxLength={20}
              style={styles.input}
            />

            {/* ✅ 입력값 있을 때만 X 버튼 노출 */}
            {!!value?.length && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClearText}
                style={styles.clearButton}
                hitSlop={8}
              >
                <Text style={styles.clearIcon}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onSubmitInternal}
            style={styles.submitButton}
          >
            <Text style={styles.submitIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetView>
  );
}

const TodoEditorSheet = React.forwardRef(function TodoEditorSheet(
  {
    value,
    onChangeText,
    onSubmit,
    onCloseTogether,
    onDismiss,
    categoryLabel = "카테고리",
    categories = [], // [{ categoryId, label }]
    initialCategoryId = 0, // ✅ Home에서 전달받는 초기값
  },
  ref
) {
  const inputRef = useRef(null);
  const snapPoints = useMemo(() => ["20%"], []);

  // ✅ chevron 눌렀을 때 펼침 상태
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // ✅ 바텀시트 내부 임시 선택
  const [draftCategoryId, setDraftCategoryId] = useState(initialCategoryId);

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

  // ✅ initialCategoryId가 바뀌거나(홈 필터 변경) 시트가 다시 열릴 때 초기화
  useEffect(() => {
    setDraftCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  const handlePickCategory = useCallback((categoryId) => {
    setDraftCategoryId(categoryId); // ✅ Home에 영향 없음
    setIsCategoryOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, []);

  const handleSubmitInternal = useCallback(() => {
    onSubmit?.(draftCategoryId); // ✅ 제출할 때만 Home으로 전달
  }, [onSubmit, draftCategoryId]);

  const handleDismiss = useCallback(() => {
    setIsCategoryOpen(false);
    setDraftCategoryId(initialCategoryId);
    onDismiss?.();
  }, [onDismiss, initialCategoryId]);

  // ✅ 리스트는 "현재 draft 선택" 제외하고 보여주기
  const otherCategories = useMemo(() => {
    return categories
      .filter((c) => c.categoryId !== 0)
      .filter((c) => c.categoryId !== draftCategoryId);
  }, [categories, draftCategoryId]);

  const handleClearText = useCallback(() => {
    onChangeText?.("");
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, [onChangeText]);

  // const handleChangeText = useCallback(
  //   (text) => {
  //     onChangeText?.(text);
  //   },
  //   [onChangeText]
  // );

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
      backgroundStyle={{backgroundColor: "#F7F7F7"}}
      handleIndicatorStyle={{backgroundColor: "#D0D0D0", width: "38.4%"}}
    >
      <TodoEditorSheetContent
        value={value}
        onChangeText={onChangeText}
        onSubmitInternal={handleSubmitInternal}
        categories={categories}
        categoryLabel={categoryLabel}
        isCategoryOpen={isCategoryOpen}
        setIsCategoryOpen={setIsCategoryOpen}
        draftCategoryId={draftCategoryId}
        otherCategories={otherCategories}
        onPickCategory={handlePickCategory}
        onClearText={handleClearText}
        inputRef={inputRef}
      />
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

  // ✅ 한 줄 배치
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

  // ✅ chevron 버튼
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

  // ✅ 오른쪽에 붙는 리스트 영역
  categoryInlineScroll: {
    flex: 1,
  },
  categoryInlineList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 6,
  },

  // ✅ 나머지 카테고리 칩(회색)
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
  categoryChipActive: {backgroundColor: "#FF5B22"},
  categoryTextActive: {color: "#FFFFFF"},

  // 입력
  inputRow: {flexDirection: "row", alignItems: "center"},
  inputWrapper: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    position: "relative",
  },
  input: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: "#333333",
    paddingRight: 26,
  },

  // ✅ X(클리어) 버튼
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
  submitButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E4E4E4",
    alignItems: "center",
    justifyContent: "center",
  },
  submitIcon: {fontSize: 18, color: "#888888"},
});
