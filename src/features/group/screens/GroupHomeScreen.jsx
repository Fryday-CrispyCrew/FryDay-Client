import React from "react";
import { useGroupsQuery } from "../queries/groupQueries";
import GroupQueryState from "../components/GroupQueryState";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import GroupHomeHeader from "../components/GroupHomeHeader";
import VerticalButton from "../../../shared/components/VerticalButton";
import ChevronRight from "../../../shared/assets/svg/chevrons/ChevronRight";
import Dotted from "../../calendar/assets/svg/Dotted.svg";
import GroupHomeEmptyList from "../components/GroupHomeEmptyList";
import GroupHomeList from "../components/GroupHomeList";
import colors from "../../../shared/styles/colors";

export default function GroupHomeScreen() {
  const navigation = useNavigation();

  const query = useGroupsQuery();
  const groups = (query.data?.groups ?? []).map((group) => ({
    id: group.groupId,
    name: group.name,
    imageCode: group.imageCode,
    current: group.memberCount,
    max: group.maxMemberCount,
    isLeader: group.myRole === "OWNER",
  }));

  const hasGroups = groups.length > 0;

  const handleCreateGroup = () => {
    navigation.navigate("GroupCreate");
  };

  const handleJoinGroup = () => {
    navigation.navigate("GroupJoin");
  };

  const handlePressGroup = (group) => {
    navigation.navigate("GroupDetail", {
      groupId: group.id,
      groupName: group.name,
      isLeader: !!group.isLeader,
      current: group.current,
      max: group.max,
    });
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

        {query.isPending || query.isError ? (
          <GroupQueryState query={query} />
        ) : hasGroups ? (
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
