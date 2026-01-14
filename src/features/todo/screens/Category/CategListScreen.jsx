// src/features/todo/screens/Category/CategListScreen.jsx
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {View, StyleSheet, TouchableOpacity} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import DraggableFlatList from "react-native-draggable-flatlist";

import AppText from "../../../../shared/components/AppText";
import CategoryItem from "../../components/Category/CategoryItem";
import colors from "../../../../shared/styles/colors";
import CategoryHeader from "../../components/Category/CategoryHeader";
import {useCategoriesQuery} from "../../queries/category/useCategoriesQuery";
import {toast} from "../../../../shared/components/toast/CenterToast";

// const MOCK_CATEGORIES = [
//   {id: "1", label: "카테고리 이름 1", color: colors.br},
//   {id: "2", label: "카테고리 이름 2", color: colors.lg},
//   {id: "3", label: "카테고리 이름 3", color: colors.cb},
//   {id: "4", label: "카테고리 이름 4", color: colors.dp},
//   {id: "5", label: "카테고리 이름 5", color: colors.mb2},
//   {id: "6", label: "카테고리 이름 6", color: colors.vl},
// ];

export default function CategListScreen({navigation}) {
  const {
    data: serverCategories = [],
    isLoading,
    isError,
    error,
  } = useCategoriesQuery();

  useEffect(() => {
    console.log("data: ", serverCategories);
  }, [serverCategories]);

  if (isError) {
    // TanStack Query error는 보통 axios error일 가능성이 높음
    console.log("[useCategoriesQuery] error:", error);
    console.log("[useCategoriesQuery] message:", error?.message);
    console.log("[useCategoriesQuery] status:", error?.response?.status);
    console.log("[useCategoriesQuery] data:", error?.response?.data);
  }

  // ✅ API 응답(data[].name, data[].colorHex, data[].displayOrder ...) → 화면용(item.label, item.color)로 변환
  const categories = useMemo(() => {
    return [...(serverCategories ?? [])]
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((c) => ({
        id: String(c.id),
        label: c.name,
        color: c.colorHex, // 화면 표시용
        // edit 화면에 넘길 때 쓰고 싶으면 원본 필드도 같이 유지 가능
        raw: c,
      }));
  }, [serverCategories]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <CategoryHeader
        variant="list"
        onPressBack={() => navigation.goBack()}
        onPressPlus={() => {
          if (categories.length >= 6) {
            toast.show("카테고리 개수는 최대 6개까지 생성할 수 있어요", {
              position: "center",
            });
            return;
          }

          navigation.navigate("CategEdit", {mode: "create"});
        }}
      />

      {isLoading ? (
        <View style={{paddingTop: 16}}>
          <AppText variant="S400" style={{color: colors.gr500}}>
            카테고리를 불러오는 중…
          </AppText>
        </View>
      ) : isError ? (
        <View style={{paddingTop: 16}}>
          <AppText variant="S400" style={{color: colors.gr500}}>
            카테고리를 불러오지 못했어요.
          </AppText>
        </View>
      ) : (
        //List
        <View style={styles.listWrap}>
          <DraggableFlatList
            data={categories}
            keyExtractor={(item) => item.id}
            // onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({item, drag, isActive}) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("CategEdit", {
                    mode: "edit",
                    category: item.raw ?? item, // ✅ edit 화면에서 원본 응답을 쓰고 싶을 때
                  })
                }
              >
                <CategoryItem
                  item={item}
                  onLongPressDrag={drag}
                  isActive={isActive}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Footer hint */}
      <View style={styles.footer}>
        <AppText variant="S400" style={styles.footerText}>
          카테고리는 최대 6개까지 설정 가능해요
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
  },

  header: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  headerLeft: {
    // width: 18,
    // height: 18,
    alignItems: "flex-start",
    justifyContent: "center",
    // borderWidth: 1,
  },
  backText: {
    fontSize: 22,
    lineHeight: 22,
    color: "#111111",
  },
  headerTitle: {
    // borderWidth: 1,
  },
  headerRight: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  plusText: {
    fontSize: 22,
    lineHeight: 22,
    color: "#111111",
  },

  listWrap: {
    // flex: 1,
    // paddingTop: 12,
    // borderWidth: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 12,
    // borderWidth: 1,
  },
  separator: {
    height: 24, // ✅ 스샷처럼 행 간격
  },

  footer: {
    marginTop: 12,
  },
  footerText: {
    // fontSize: 11,
    // lineHeight: 11 * 1.5,
    color: colors.gr300,
  },
});
