import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";

export default function GroupQueryState({ query }) {
  if (query.isPending) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!query.isError) return null;
  const missing = query.error?.response?.status === 404;
  return (
    <View style={{ padding: 24, alignItems: "center", gap: 16 }}>
      <AppText variant="M500">{missing ? "참여 중인 그룹을 찾을 수 없어요" : "정보를 불러오지 못했어요"}</AppText>
      <TouchableOpacity onPress={() => query.refetch()}>
        <AppText variant="M600">다시 시도하기</AppText>
      </TouchableOpacity>
    </View>
  );
}
