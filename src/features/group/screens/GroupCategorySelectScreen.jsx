import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import CategoryCheckItem from "../components/CategoryCheckItem";
import colors from "../../../shared/styles/colors";
import { useCategoriesQuery } from "../../todo/queries/category/useCategoriesQuery";

/**
 * 공개 카테고리 선택 화면.
 * - todo 의 useCategoriesQuery 그대로 사용
 * - 체크박스 색상 = category.color
 * - 하나도 선택 안 하면 비공개 (하단 안내)
 * - 디폴트: 전체 다 선택된 상태 (route.params.selectedIds 없을 때)
 *
 * TODO: 서버 API - 그룹별 공개 카테고리 저장/조회
 */
export default function GroupCategorySelectScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { data: categories = [] } = useCategoriesQuery();

  // 이전 화면(설정)에서 넘겨준 초기 선택 상태 (없으면 null → 카테고리 로드 시 전체 선택)
  const initialSelected = route?.params?.selectedIds ?? null;
  const [selectedIds, setSelectedIds] = useState(initialSelected ?? []);

  // 카테고리 load 완료 & initialSelected 미지정 시 전체 선택 세팅
  const initedRef = useRef(false);
  useEffect(() => {
    if (initedRef.current) return;
    if (initialSelected !== null) {
      initedRef.current = true;
      return;
    }
    if (categories.length > 0) {
      setSelectedIds(categories.map((c) => c.id));
      initedRef.current = true;
    }
  }, [categories, initialSelected]);

  const toggleCategory = (categoryId, next) => {
    setSelectedIds((prev) => {
      const isIn = prev.includes(categoryId);
      if (next && !isIn) return [...prev, categoryId];
      if (!next && isIn) return prev.filter((id) => id !== categoryId);
      return prev;
    });
  };

  // 뒤로 나갈 때 현재 선택 상태를 부모(설정 화면)로 전달
  const handleBack = () => {
    const onChange = route?.params?.onChange;
    onChange?.(selectedIds);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="bg-gr flex-1" edges={["top"]}>
      <PageHeader
        title="공개 카테고리 선택"
        showBackButton
        onBackPress={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
          {categories.length === 0 ? (
            <AppText variant="M500" className="text-gr500" style={{ marginTop: 24, textAlign: "center" }}>
              등록된 카테고리가 없어요
            </AppText>
          ) : (
            categories.map((cat) => (
              <CategoryCheckItem
                key={cat.id}
                category={cat}
                checked={selectedIds.includes(cat.id)}
                onToggle={(next) => toggleCategory(cat.id, next)}
              />
            ))
          )}

          {/* 하단 안내 - S400 GR300 */}
          <AppText
            variant="S400"
            style={{ marginTop: 16, color: colors.gr300 }}
          >
            그룹 속 친구들은 내가 공개한 카테고리만 볼 수 있어요
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
