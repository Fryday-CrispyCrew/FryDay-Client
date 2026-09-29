import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";

import GroupDetailHeader from "../components/GroupDetailHeader";
import GroupQueryState from "../components/GroupQueryState";
import GroupSelfCard from "../components/GroupSelfCard";
import GroupStoreImage from "../components/GroupStoreImage";
import { splitGroupMembers } from "../lib/groupIdentity";
import { useGroupQuery, useGroupCurrentUserIdQuery } from "../queries/groupQueries";
import { groupApi } from "../api/groupApi";
import { toGroupMember, interactionPresentation } from "../lib/groupPresentation";
import GroupMemberGrid from "../components/GroupMemberGrid";
import { toast, toastTextStyle } from "../../../shared/components/toast/CenterToast";

// 이름 최대 폭 (한글/영문 폭 차이 대응 - px 기준 truncate)
const NAME_MAX_WIDTH = 72;

/**
 * 특정 그룹에 진입했을 때 보여지는 "그룹 홈".
 * (그룹 목록의 GroupHome 과 이름 겹침 방지 위해 Detail 로 명명)
 */
export default function GroupDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const groupId = route.params?.groupId;
  const query = useGroupQuery(groupId);
  const group = query.data;
  const groupName = group?.name ?? "";
  const date = group?.date ? dayjs(group.date).format("YYYY년 M월 D일") : "";
  const { data: currentUserId } = useGroupCurrentUserIdQuery();
  const { self: selfMember, others } = splitGroupMembers(group?.members, currentUserId);
  const self = selfMember ? toGroupMember(selfMember) : null;
  const members = others.map(toGroupMember);
  const [cooldowns, setCooldowns] = React.useState({});
  const pending = React.useRef(new Set());
  const timers = React.useRef([]);
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);
  const disabledMap = {};
  members.forEach((member) => {
    disabledMap[member.id] = currentUserId == null || !member.reactionType || !!cooldowns[`${groupId}:${member.id}:${member.interaction}`];
  });
  const handleBack = () => navigation.goBack();
  const handleMenu = () => navigation.navigate("GroupSetting", { groupId });
  const handleReaction = async (member) => {
    const key = `${groupId}:${member.id}:${member.interaction}`;
    if (String(member.id) === currentUserId) return;
    if (disabledMap[member.id] || pending.current.has(key)) return;
    pending.current.add(key);
    setCooldowns((previous) => ({ ...previous, [key]: true }));
    let cooldown = false;
    try {
      await groupApi.interact({ groupId, targetUserId: member.id, type: member.interaction });
      cooldown = true;
      if (!mounted.current) return;
      toast.show(
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[toastTextStyle, { maxWidth: NAME_MAX_WIDTH }]} numberOfLines={1} ellipsizeMode="tail">{member.name}</Text>
          <Text style={toastTextStyle}>{interactionPresentation[member.interaction].message}</Text>
        </View>,
        { position: "center" },
      );
    } catch (error) {
      if (!mounted.current) return;
      const status = error.response?.status;
      cooldown = status === 429;
      if (status === 409 || status === 404) void query.refetch();
      const message = status === 409 ? "영업 상태가 바뀌었어요. 새로고침 후 다시 보내주세요"
        : status === 429 ? "같은 응원은 30초 후에 보낼 수 있어요"
        : status === 400 ? "자신에게는 응원을 보낼 수 없어요"
        : status === 404 ? "그룹 또는 그룹원을 찾을 수 없어요"
        : "응원을 보내지 못했어요. 다시 시도해주세요";
      toast.show(message, { position: "center" });
    } finally {
      pending.current.delete(key);
      if (mounted.current) {
        const clear = () => setCooldowns((previous) => {
          const next = { ...previous };
          delete next[key];
          return next;
        });
        if (cooldown) timers.current.push(setTimeout(clear, 30_000));
        else clear();
      }
    }
  };
  const handlePressMemberGraphic = (member) => {
    navigation.navigate("GroupMemberTodos", {
      groupId,
      memberId: member.id,
      groupName,
      memberName: member.name,
    });
  };

  if (query.isPending || query.isError) return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      <GroupDetailHeader date="" groupName="그룹" memberCount={0} onBackPress={handleBack} />
      <GroupQueryState query={query} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      <GroupDetailHeader
        date={date}
        groupName={groupName}
        memberCount={group.memberCount}
        onBackPress={handleBack}
        onMenuPress={handleMenu}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {self && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <GroupSelfCard
              name={self.name}
              current={self.current}
              max={self.max}
              cheerCount={group.myReceivedInteractionCount}
              illustration={<GroupStoreImage status={self.status} />}
            />
          </View>
        )}
        {/* 본인을 제외한 멤버 그리드 */}
        <View style={{ paddingHorizontal: 20 }}>
          <GroupMemberGrid
            members={members}
            disabledMap={disabledMap}
            onPressReaction={handleReaction}
            onPressGraphic={handlePressMemberGraphic}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
