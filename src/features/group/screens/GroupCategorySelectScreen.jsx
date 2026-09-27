import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, usePreventRemove } from "@react-navigation/native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import CategoryCheckItem from "../components/CategoryCheckItem";
import { groupApi } from "../api/groupApi";
import { groupKeys, useGroupCategoriesQuery } from "../queries/groupQueries";
import { useQueryClient } from "@tanstack/react-query";
import GroupQueryState from "../components/GroupQueryState";
import { toast } from "../../../shared/components/toast/CenterToast";
import colors from "../../../shared/styles/colors";
import { useCategoriesQuery } from "../../todo/queries/category/useCategoriesQuery";

export default function GroupCategorySelectScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const mode = route?.params?.mode ?? "setting"; // "setting" | "create" | "join"

  const client = useQueryClient();
  const personalQuery = useCategoriesQuery({ enabled: mode !== "setting" });
  const publicQuery = useGroupCategoriesQuery(mode === "setting" ? route.params?.groupId : null);
  const query = mode === "setting" ? publicQuery : personalQuery;
  const categories = useMemo(() => mode === "setting"
    ? (publicQuery.data?.categories ?? []).map((c) => ({ ...c, id: c.categoryId }))
    : personalQuery.data ?? [], [mode, publicQuery.data, personalQuery.data]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [nextNavigation, setNextNavigation] = useState(null);
  const savingRef = useRef(false);
  usePreventRemove(isSaving, () => {});
  // 저장 중에는 replace/goBack도 차단된다. 가드가 해제된 렌더 이후 이동한다.
  useEffect(() => {
    if (isSaving || !nextNavigation) return;
    setNextNavigation(null);
    if (nextNavigation.back) navigation.goBack();
    else navigation.replace(nextNavigation.name, nextNavigation.params);
  }, [isSaving, nextNavigation, navigation]);
  // 생성 성공 후 공개 설정만 실패해도 재시도 시 그룹을 중복 생성하지 않는다.
  const createdGroupRef = useRef(route.params?.createdGroup ?? null);
  const initedRef = useRef(false);
  useEffect(() => {
    if (initedRef.current || !query.isSuccess) return;
    setSelectedIds(categories.filter((c) => mode !== "setting" || c.isPublic).map((c) => c.id));
    initedRef.current = true;
  }, [categories, mode, query.isSuccess]);

  const toggleCategory = (categoryId, next) => {
    setSelectedIds((prev) => {
      const isIn = prev.includes(categoryId);
      if (next && !isIn) return [...prev, categoryId];
      if (!next && isIn) return prev.filter((id) => id !== categoryId);
      return prev;
    });
  };

  const canSave = selectedIds.length >= 1 && query.isSuccess && !isSaving && !nextNavigation;

  const buttonLabel = useMemo(() => {
    if (mode === "setting") return "변경사항 저장하기";
    return "다음으로";
  }, [mode]);

  const handleSave = async () => {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      if (mode === "create") {
        if (!createdGroupRef.current) {
          createdGroupRef.current = await groupApi.createGroup(route.params.groupName);
          navigation.setParams({ createdGroup: createdGroupRef.current });
          void client.invalidateQueries({ queryKey: groupKeys.list() });
        }
        const group = createdGroupRef.current;
        await groupApi.updatePublicCategories({ groupId: group.groupId, categoryIds: selectedIds });
        setNextNavigation({ name: "GroupCreateComplete", params: { groupId: group.groupId, groupCode: group.inviteCode, maxMemberCount: group.maxMemberCount } });
      } else if (mode === "join") {
        const group = await groupApi.joinGroup({ inviteCode: route.params.groupCode, categoryIds: selectedIds });
        setNextNavigation({ name: "GroupDetail", params: { groupId: group.groupId } });
      } else {
        await groupApi.updatePublicCategories({ groupId: route.params.groupId, categoryIds: selectedIds });
        setNextNavigation({ back: true });
      }
      void client.invalidateQueries({ queryKey: groupKeys.all });
    } catch (error) {
      if (mode === "join") {
        const status = error.response?.status;
        toast.show(status === 404 ? "존재하지 않는 그룹코드예요" : status === 409
          ? "이미 참여했거나 정원이 가득 찬 그룹이에요" : "그룹에 참여하지 못했어요. 다시 시도해주세요", { position: "center" });
      } else if (createdGroupRef.current) {
        toast.show("그룹은 생성됐지만 공개 설정을 저장하지 못했어요. 다시 저장해주세요", { position: "center" });
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
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
            {mode === "join" && route.params?.groupName ? (
              <AppText variant="M600" style={{ marginBottom: 16 }}>
                {route.params.groupName} 그룹에 공개할 카테고리를 선택해 주세요
              </AppText>
            ) : null}
            {query.isPending || query.isError ? (
              <GroupQueryState query={query} />
            ) : categories.length === 0 ? (
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
