import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import CategoryCheckItem from "../components/CategoryCheckItem";
import colors from "../../../shared/styles/colors";
import { useCategoriesQuery } from "../../todo/queries/category/useCategoriesQuery";

/**
 * 공개 카테고리 선택 화면.
 *
 * mode:
 * - "setting" (default): 그룹 관리에서 진입. 버튼 = "변경사항 저장하기"
 *   → onChange(selectedIds) 콜백 + goBack()
 * - "create": 그룹 만들기 플로우. 버튼 = "다음으로"
 *   → replace("GroupCreateComplete", { groupCode, publicCategoryIds })
 * - "join": 그룹 참여 플로우. 버튼 = "다음으로"
 *   → replace("GroupDetail", { 참여한 그룹 정보 + publicCategoryIds })
 *
 * 정책: 최소 1개 카테고리 선택 필수. 0개면 하단 버튼 disabled.
 * 디폴트: 전체 선택 (route.params.selectedIds 없을 때)
 *
 * TODO: 서버 API - 그룹별 공개 카테고리 저장/조회, createGroup/joinGroup 실제 호출
 */
export default function GroupCategorySelectScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const mode = route?.params?.mode ?? "setting"; // "setting" | "create" | "join"

  const { data: categories = [] } = useCategoriesQuery();

  // 초기 선택 (없으면 null → 카테고리 로드 시 전체 선택)
  const initialSelected = route?.params?.selectedIds ?? null;
  const [selectedIds, setSelectedIds] = useState(initialSelected ?? []);

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

  const canSave = selectedIds.length >= 1;

  const buttonLabel = useMemo(() => {
    if (mode === "setting") return "변경사항 저장하기";
    return "다음으로";
  }, [mode]);

  const handleSave = () => {
    if (!canSave) return;

    if (mode === "create") {
      // TODO: createGroup({ name: params.groupName, publicCategoryIds: selectedIds })
      const groupCode = "FRY123"; // mock
      navigation.replace("GroupCreateComplete", {
        groupCode,
        publicCategoryIds: selectedIds,
      });
      return;
    }

    if (mode === "join") {
      // TODO: joinGroup({ code: params.groupCode, publicCategoryIds: selectedIds })
      // 참여한 그룹의 실제 정보로 GroupDetail 진입 (mock)
      const joined = {
        groupId: route?.params?.groupId ?? 999,
        groupName: route?.params?.groupName ?? "참여한 그룹",
        isLeader: false,
        current: 5,
        max: 10,
        publicCategoryIds: selectedIds,
      };
      navigation.replace("GroupDetail", joined);
      return;
    }

    // setting mode
    const onChange = route?.params?.onChange;
    onChange?.(selectedIds);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="bg-gr flex-1" edges={["top", "bottom"]}>
      <PageHeader
        title="공개 카테고리 선택"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
            {categories.length === 0 ? (
              <AppText
                variant="M500"
                className="text-gr500"
                style={{ marginTop: 24, textAlign: "center" }}
              >
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

        {/* 하단 고정 저장/다음 버튼 (검정) */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 8, paddingTop: 8 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={!canSave}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: canSave ? colors.bk : colors.gr200,
            }}
          >
            <AppText
              variant="L600"
              className={canSave ? "text-wt" : "text-gr300"}
            >
              {buttonLabel}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
