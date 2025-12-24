// src/screens/Home/HomeScreen.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
  InteractionManager,
  Pressable,
  Keyboard,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AppText from "../../../../shared/components/AppText";
import TodayIcon from "../../assets/svg/Today.svg";
import CategoryIcon from "../../assets/svg/Category.svg";

import TodoCard from "../../components/TodoCard";

import TodoEditorSheet from "../../components/TodoEditorSheet";

const {width} = Dimensions.get("window");

// 카테고리 탭 목록
// const TAB_CATEGORIES = [
//   {categoryId: 0, label: "전체보기"}, // 0은 "전체" 용
//   {categoryId: 1, label: "운동하기"},
//   {categoryId: 2, label: "공부하기"},
//   {categoryId: 3, label: "완전놀기"},
// ];

const TAB_CATEGORIES = [
  {categoryId: 1, label: "운동하기", color: "#FF5B22"}, // 주황
  {categoryId: 2, label: "공부하기", color: "#693838"}, // 브라운
  {categoryId: 3, label: "완전놀기", color: "#3CB492"}, // 연두
];

export default function HomeScreen({navigation}) {
  const [editingTodo, setEditingTodo] = useState(null); // { id, title } or null
  const [editingText, setEditingText] = useState("");

  // ✅ HomeScreen이 “현재 선택된 카테고리”를 소유
  // const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  const [sheetInitialCategoryId, setSheetInitialCategoryId] = useState(
    TAB_CATEGORIES?.[0]?.categoryId ?? 0
  );

  const bottomSheetRef = useRef(null);

  const sheetCategory = useMemo(() => {
    return (
      TAB_CATEGORIES.find((c) => c.categoryId === sheetInitialCategoryId) ??
      TAB_CATEGORIES[0]
    );
  }, [sheetInitialCategoryId]);

  // ✅ 전체보기(0)이면 첫 번째 카테고리(0 아닌 첫 항목)로 fallback
  // const effectiveCategory = useMemo(() => {
  //   const firstCategory =
  //     TAB_CATEGORIES.find((c) => c.categoryId !== 0) ?? TAB_CATEGORIES[0];
  //   const resolved =
  //     selectedCategoryId === 0
  //       ? firstCategory
  //       : TAB_CATEGORIES.find((c) => c.categoryId === selectedCategoryId);

  //   return resolved ?? firstCategory;
  // }, [selectedCategoryId]);

  const openEditor = useCallback((todo) => {
    const nextCategoryId =
      todo?.categoryId ?? TAB_CATEGORIES?.[0]?.categoryId ?? 0;

    setSheetInitialCategoryId(nextCategoryId);
    setEditingTodo(todo);
    setEditingText(todo?.title ?? "");
    bottomSheetRef.current?.present();
  }, []);

  const closeEditorTogether = useCallback(() => {
    Keyboard.dismiss();
    // 2) 바텀시트 dismiss
    bottomSheetRef.current?.dismiss();
    // 3) 상태 정리는 onDismiss에서 처리하는 게 깔끔
  }, []);

  // ✅ create / edit 모드
  const sheetMode = editingTodo?.id ? "edit" : "create";

  const handleSubmit = useCallback(
    (draftCategoryId) => {
      if (!editingTodo && editingText.trim().length === 0) {
        closeEditorTogether();
        return;
      }
      // TODO: add/update 처리
      // ✅ 여기서 새 투두 생성 시 effectiveCategory.categoryId를 사용하면 “시트의 카테고리”와 저장값이 일치함
      // addTodo({ title: editingText, categoryId: effectiveCategory.categoryId })
      closeEditorTogether();
    },
    [editingTodo, editingText, closeEditorTogether]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} mode={"margin"}>
      <StatusBar barStyle="dark-content" />

      {/* topBar: 날짜 + 우측 SVG 아이콘들 */}
      <View style={styles.topBar}>
        <View>
          <AppText variant="M500" className="text-gr500">
            2025년
          </AppText>
          <AppText variant="H3" className="text-bk">
            10월 28일
          </AppText>
        </View>

        <View style={styles.iconRow}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.iconButton}
            onPress={() => {}}
          >
            <TodayIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.iconButton}
            onPress={() => {}}
          >
            <CategoryIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 새우 일러스트 + 배경 */}
      <View style={styles.illustrationWrapper}>
        <View style={styles.sunburst} />
        <View style={styles.shrimp}>
          <Text style={{fontSize: 32}}>🦐</Text>
        </View>
      </View>

      <View style={styles.dashedDivider} />

      {/* ✅ TodoCard에서 인풋 누르면 openEditor 호출 */}
      <TodoCard
        navigation={navigation}
        onPressInput={openEditor}
        categories={TAB_CATEGORIES}
      />

      {/* ✅ @gorhom/bottom-sheet 기반 입력 시트 */}
      <TodoEditorSheet
        ref={bottomSheetRef}
        mode={sheetMode} // ✅ 추가
        value={editingText}
        onChangeText={setEditingText}
        onCloseTogether={closeEditorTogether}
        onDismiss={() => {
          setEditingTodo(null);
          setEditingText("");
        }}
        categoryLabel={sheetCategory?.label ?? "카테고리"}
        categories={TAB_CATEGORIES}
        initialCategoryId={sheetCategory?.categoryId ?? 0}
        onSubmit={(draftCategoryId) => {
          handleSubmit(draftCategoryId);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: "5%",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "11%",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationWrapper: {
    height: "42%",
    alignItems: "center",
    justifyContent: "center",
  },
  sunburst: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "#FFD3B5",
    opacity: 0.7,
  },
  shrimp: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FF7A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  dashedDivider: {
    // marginVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
    borderStyle: "dashed",
  },
});

// ✅ 바텀 시트 내부 스타일
const sheetStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F0F0F0",
  },
  categoryText: {
    fontSize: 13,
    color: "#B0B0B0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    // height: 44,
    // shadowColor: "#000",
    // shadowOpacity: 0.04,
    // shadowRadius: 6,
    // shadowOffset: {width: 0, height: 2},
    // elevation: 4,
  },
  input: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    // fontSize: 15,
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
  submitIcon: {
    fontSize: 18,
    color: "#888888",
  },
});
