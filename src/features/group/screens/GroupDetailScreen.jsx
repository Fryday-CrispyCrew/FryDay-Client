import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";

import GroupDetailHeader from "../components/GroupDetailHeader";
import GroupSelfCard from "../components/GroupSelfCard";
import GroupMemberGrid from "../components/GroupMemberGrid";
import DottedDivider from "../components/DottedDivider";

/**
 * 특정 그룹에 진입했을 때 보여지는 "그룹 홈".
 * (그룹 목록의 GroupHome 과 이름 겹침 방지 위해 Detail 로 명명)
 *
 * 그래픽(집/캐릭터) 슬롯은 비워둠 - 나중에 이미지 붙일 자리.
 */
export default function GroupDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // TODO: 서버 API 연동
  const groupName = route?.params?.groupName ?? "바삭한사람들그룹명";

  // 날짜: route 파라미터 우선, 없으면 오늘 (YYYY년 M월 D일 - dayjs 표준 포맷)
  const dateSource = route?.params?.date;
  const date = React.useMemo(() => {
    const d = dateSource ? dayjs(dateSource) : dayjs();
    return `${d.year()}년 ${d.month() + 1}월 ${d.date()}일`;
  }, [dateSource]);

  const self = {
    name: "수정",
    current: 5,
    max: 12,
    cheerCount: 5,
  };

  const members = [
    { id: 1, name: "수정", current: 5, max: 12, reactionType: "bell" },
    { id: 2, name: "수정", current: 5, max: 12, reactionType: "order" },
    { id: 3, name: "수정", current: 5, max: 12, reactionType: "more" },
    { id: 4, name: "수정", current: 5, max: 12, reactionType: "deil" },
  ];

  // 홈에서 넘겨준 params (없으면 mock default)
  const isLeader = !!route?.params?.isLeader;
  const currentMembers = route?.params?.current ?? members.length + 1;
  const maxMembers = route?.params?.max ?? 10;

  const handleBack = () => navigation.goBack();
  const handleMenu = () => {
    // 그룹 관리 (설정) 화면으로 이동
    navigation.navigate("GroupSetting", {
      groupName,
      isLeader,
      current: currentMembers,
      max: maxMembers,
      groupCode: "FRY123", // TODO: 서버 응답으로 교체
    });
  };
  const handleReaction = (member) => {
    // TODO: 서버 API - 응원 전송
  };
  const handlePressMemberGraphic = (member) => {
    navigation.navigate("GroupMemberTodos", {
      groupName,
      memberName: member.name,
      memberId: member.id,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      <GroupDetailHeader
        date={date}
        groupName={groupName}
        memberCount={currentMembers}
        onBackPress={handleBack}
        onMenuPress={handleMenu}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 본인 카드 */}
        <View style={{ paddingHorizontal: 20 }}>
          <GroupSelfCard
            name={self.name}
            current={self.current}
            max={self.max}
            cheerCount={self.cheerCount}
          />
        </View>

        {/* 그리드 위 가로 점선 */}
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <StretchDottedH />
        </View>

        {/* 멤버 그리드 */}
        <View style={{ paddingHorizontal: 20 }}>
          <GroupMemberGrid
            members={members}
            onPressReaction={handleReaction}
            onPressGraphic={handlePressMemberGraphic}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 로컬 stretch 가로 점선 (그리드 위 구분선용)
function StretchDottedH() {
  const [w, setW] = React.useState(0);
  return (
    <View
      style={{ width: "100%", height: 1 }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
    >
      {w > 0 ? <DottedDivider direction="horizontal" length={w} /> : null}
    </View>
  );
}
