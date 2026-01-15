// src/features/todo/screens/Home/HomeScreen.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
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

import TodoEditorSheet from "../../components/TodoEditorSheet/TodoEditorSheet";
import {useTodoEditorController} from "../../hooks/useTodoEditorController";

import {useHomeTodosQuery} from "../../queries/home/useHomeTodosQuery";
import {useCategoriesQuery} from "../../queries/category/useCategoriesQuery";

const {width, height} = Dimensions.get("window");

// const TAB_CATEGORIES = [
//   {categoryId: 1, label: "운동하기", color: "#FF5B22"}, // 주황
//   {categoryId: 2, label: "공부하기", color: "#693838"}, // 브라운
//   {categoryId: 3, label: "완전놀기", color: "#3CB492"}, // 연두
// ];

// const canAddCategory = TAB_CATEGORIES.length < 6;

// ✅ 오늘 날짜(로컬 기준) YYYY-MM-DD
function formatYYYYMMDD(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function HomeScreen({navigation}) {
  const date = useMemo(() => formatYYYYMMDD(new Date()), []);

  // ✅ 카테고리 조회 (서버)
  const {data: rawCategories = []} = useCategoriesQuery();

  // ✅ TodoCard가 기대하는 형태로 매핑 + displayOrder 정렬
  const categories = useMemo(() => {
    const arr = Array.isArray(rawCategories) ? rawCategories : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((c) => ({
        categoryId: c.id,
        label: c.name,
        color: c.colorHex, // 화면 표시용 hex
      }));
  }, [rawCategories]);

  // ✅ 홈 투두 조회 (categoryId 생략 = 전체)
  const {data: rawTodos = []} = useHomeTodosQuery({
    date,
    categoryId: undefined,
  });

  useEffect(() => {
    console.log("Data: ", rawTodos);
  }, [rawTodos]);

  // ✅ TodoCard가 쓰는 형태로 변환 + displayOrder 정렬
  const todos = useMemo(() => {
    const arr = Array.isArray(rawTodos) ? rawTodos : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((t) => ({
        id: String(t.id), // DraggableFlatList keyExtractor용 string
        title: t.description ?? "",
        done: t.status === "COMPLETED",
        categoryId: t.categoryId,
        displayOrder: t.displayOrder,
        date: t.date,
        recurrenceId: t.recurrenceId,
        occurrenceDate: t.occurrenceDate,
      }));
  }, [rawTodos]);

  const editor = useTodoEditorController({
    categories, // ✅ 서버 카테고리로 교체
    // 나중에 react-query mutation 연결하는 자리
    onSubmitTodo: async ({todo, text, categoryId}) => {
      // todo?.id 있으면 update, 없으면 create
      // await mutateAsync(...)
    },
  });

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
            onPress={() =>
              navigation.navigate("Category", {
                screen: "CategList",
              })
            }
          >
            <CategoryIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ illustrationWrapper + TodoCard 포함 영역 전체 스크롤 */}
      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          onPressInput={editor.openEditor}
          categories={categories} // ✅ 서버 카테고리로 교체
          todos={todos} // ✅ 서버에서 가져온 투두를 TodoCard에 연결
          onDoToday={(todoId) => {
            console.log("오늘하기:", todoId);
          }}
        />
      </ScrollView>

      {/* ✅ @gorhom/bottom-sheet 기반 입력 시트 */}
      <TodoEditorSheet {...editor.sheetProps} />
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
  bodyScroll: {
    flex: 1, // ✅ topBar 아래 남은 영역을 스크롤이 차지
  },
  bodyContent: {
    paddingBottom: 36, // ✅ 맨 아래 여백(탭바/홈바 겹침 방지용)
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
    // height: "42%",
    height: height * 0.377,
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
