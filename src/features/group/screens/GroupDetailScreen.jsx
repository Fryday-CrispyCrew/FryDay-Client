import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";

import GroupDetailHeader from "../components/GroupDetailHeader";
import GroupSelfCard from "../components/GroupSelfCard";
import GroupMemberGrid from "../components/GroupMemberGrid";
import DottedDivider from "../components/DottedDivider";
import { toast, toastTextStyle } from "../../../shared/components/toast/CenterToast";

// 반응 타입별 토스트 접미사 (이름 뒤에 붙는 문구)
const REACTION_TOAST_SUFFIX = {
  bell: "님의 가게 문을 두드렸어요!",
  order: "님의 가게에 주문을 넣었어요!",
  more: "님에게 튀김을 더 달라고 졸랐어요!",
  deil: "님에게 별점 5점을 남겼어요!",
};

// 이름 최대 폭 (한글/영문 폭 차이 대응 - px 기준 truncate)
const NAME_MAX_WIDTH = 72;

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

  // 홈에서 넘겨준 params (없으면 mock default)
  const isLeader = !!route?.params?.isLeader;

  // 그룹장 그룹은 truncate 확인용 mock 이름 세팅
  // - 1번: 한글 최대 10자
  // - 2번: 영문 최대 10자
  const firstMemberName = isLeader ? "하하하하하하하하하하" : "수정";
  const secondMemberName = isLeader ? "AAABBBCCCD" : "수정";

  const members = [
    { id: 1, name: firstMemberName, current: 5, max: 12, reactionType: "bell" },
    { id: 2, name: secondMemberName, current: 5, max: 12, reactionType: "order" },
    { id: 3, name: "수정", current: 5, max: 12, reactionType: "more" },
    { id: 4, name: "수정", current: 5, max: 12, reactionType: "deil" },
  ];
  const currentMembers = route?.params?.current ?? members.length + 1;
  const maxMembers = route?.params?.max ?? 10;

  // 반응 버튼 30초 disable — 눌린 memberId 집합
  const [disabledIds, setDisabledIds] = React.useState(() => new Set());
  const disabledMap = React.useMemo(() => {
    const m = {};
    for (const id of disabledIds) m[id] = true;
    return m;
  }, [disabledIds]);

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
    if (disabledMap[member.id]) return; // 30초 쿨다운 중 - 무시

    const suffix =
      REACTION_TOAST_SUFFIX[member.reactionType] ?? REACTION_TOAST_SUFFIX.bell;
    // 이름은 72px 넘으면 ellipsis (한 줄 유지). 뒤 접미사는 그대로.
    toast.show(
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={[toastTextStyle, { maxWidth: NAME_MAX_WIDTH }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {member.name}
        </Text>
        <Text style={toastTextStyle}>{suffix}</Text>
      </View>,
      { position: "center" },
    );

    // 30초간 해당 멤버 반응 버튼 비활성화
    setDisabledIds((prev) => {
      const next = new Set(prev);
      next.add(member.id);
      return next;
    });
    setTimeout(() => {
      setDisabledIds((prev) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }, 30_000);

    // TODO: 서버 API - 응원/알림 전송
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
            disabledMap={disabledMap}
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
