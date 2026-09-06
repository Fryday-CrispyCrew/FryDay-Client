import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GroupHomeHeader from "../components/GroupHomeHeader";
import VerticalButton from "../../../shared/components/VerticalButton";
import ChevronRight from "../../../shared/assets/svg/chevrons/ChevronRight";
import Dotted from "../../calendar/assets/svg/Dotted.svg";
import GroupHomeEmptyList from "../components/GroupHomeEmptyList";
import GroupHomeList from "../components/GroupHomeList";
import colors from "../../../shared/styles/colors";

export default function GroupHomeScreen() {
  // TODO: 서버 API 연동 - useGroupsQuery 등으로 대체
  const groups = [
    { id: 1, name: "그룹이름그룹이름그룹", current: 5, max: 10 },
    { id: 2, name: "그룹이름그룹이름그룹", current: 5, max: 10 },
    { id: 3, name: "그룹이름그룹이름그룹", current: 5, max: 10 },
    { id: 4, name: "그룹이름그룹이름그룹", current: 5, max: 10 },
    { id: 5, name: "그룹이름그룹이름그룹", current: 5, max: 10 },
  ];

  const hasGroups = groups.length > 0;

  const handleCreateGroup = () => {
    // TODO: 그룹 생성 화면으로 이동
  };

  const handleJoinGroup = () => {
    // TODO: 그룹 참여 화면으로 이동
  };

  const handlePressGroup = (group) => {
    // TODO: 그룹 상세로 이동
  };

  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      <GroupHomeHeader title="그룹" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 12 }}>
          <View style={{ flex: 1 }}>
            <VerticalButton
              variant="primary"
              text="그룹 만들기"
              onPress={handleCreateGroup}
              style={{ width: "100%" }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <VerticalButton
              variant="secondary"
              text="그룹 참여하기"
              icon={<ChevronRight size={20} color={colors.wt} strokeWidth={3} />}
              onPress={handleJoinGroup}
              style={{ width: "100%" }}
            />
          </View>
        </View>

        <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
          <Dotted width="100%" height={1} preserveAspectRatio="none" />
        </View>

        {hasGroups ? (
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <GroupHomeList groups={groups} onPressGroup={handlePressGroup} />
          </View>
        ) : (
          <View style={{ marginTop: 40 }}>
            <GroupHomeEmptyList />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
