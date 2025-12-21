// src/screens/Home/components/TodoEditorSheet.jsx
import React, {useCallback, useMemo, useRef} from "react";
import {View, Text, StyleSheet, Pressable, Keyboard} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {InteractionManager} from "react-native";
import {TouchableOpacity} from "react-native";

const TodoEditorSheet = React.forwardRef(function TodoEditorSheet(
  {
    value,
    onChangeText,
    onSubmit,
    onCloseTogether, // dim 눌렀을 때 "키보드+시트 같이" 닫기
    onDismiss, // dismiss 이후 상태 초기화는 HomeScreen에서 처리
    categoryLabel = "카테고리",
  },
  ref
) {
  const inputRef = useRef(null);
  const snapPoints = useMemo(() => ["20%"], []);

  const focusInput = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, []);

  const handleSheetAnimate = useCallback(
    (fromIndex, toIndex) => {
      // 닫힘(-1) -> 열림(0 이상)으로 전환되는 순간
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

  const handleSubmitInternal = useCallback(() => {
    onSubmit?.();
  }, [onSubmit]);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
      onAnimate={handleSheetAnimate}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{backgroundColor: "#F7F7F7"}}
      handleIndicatorStyle={{backgroundColor: "#D0D0D0", width: "38.4%"}}
    >
      <BottomSheetView>
        <View style={styles.container}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <BottomSheetTextInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                placeholder="두근두근, 무엇을 튀겨볼까요?"
                placeholderTextColor="#C6C6C6"
                returnKeyType="done"
                onSubmitEditing={handleSubmitInternal}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSubmitInternal}
              style={styles.submitButton}
            >
              <Text style={styles.submitIcon}>➔</Text>
            </TouchableOpacity>
          </View>
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
  categoryRow: {flexDirection: "row", marginBottom: 12},
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F0F0F0",
  },
  categoryText: {fontSize: 13, color: "#B0B0B0"},
  inputRow: {flexDirection: "row", alignItems: "center"},
  inputWrapper: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  input: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: "#333333",
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
