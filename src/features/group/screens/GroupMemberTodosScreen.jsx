import React, { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import AppText from "../../../shared/components/AppText";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import DottedDivider from "../components/DottedDivider";
import TodoRadioOffIcon from "../../todo/assets/svg/RadioOff.svg";
import TodoRadioOnIcon from "../../todo/assets/svg/RadioOn.svg";
import { TodoLottie } from "../../todo/assets/lottie";
import colors from "../../../shared/styles/colors";

// 홈 화면의 status → lottie key 매핑 재사용
function getLottieKeyFromStatus(status) {
  switch (status) {
    case "CASE_A": return "caseA";
    case "CASE_B": return "caseB";
    case "CASE_C": return "caseC";
    case "CASE_D": return "caseD";
    case "CASE_E1": return "caseE1";
    case "CASE_E2": return "caseE2";
    case "CASE_F": return "caseF";
    case "CASE_G": return "caseG";
    case "CASE_H": return "caseH";
    default: return null;
  }
}

/**
 * 그룹 멤버의 공개 투두 열람 화면 (read-only).
 * 그룹 상세에서 멤버 그래픽 tap → 이동.
 *
 * - Header: 그룹명 (subtitle, M500 GR500) + "{name}님의 튀김 가게" (H3 BK) + back
 * - Body: 캐릭터/그래픽 슬롯 + 말풍선 + 카테고리 섹션들 (읽기 전용)
 *
 * TODO: 서버 API - 그룹 멤버 공개 투두 조회
 */
export default function GroupMemberTodosScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const groupName = route?.params?.groupName ?? "";
  const memberName = route?.params?.memberName ?? "";
  const cheerMessage =
    route?.params?.cheerMessage ?? "얘 나 까먹었나봐...";

  // 캐릭터 status: 백엔드가 시간/투두 완료율 등을 계산해서 CASE_A~H 로 내려줌.
  // 프론트는 매핑만. mock default 는 스켈레톤 확인용이라 아무거나(A).
  // TODO: useGroupMemberCharacterQuery(memberId) → status 리턴
  const memberStatus = route?.params?.status ?? "CASE_A";
  const lottieKey = useMemo(
    () => getLottieKeyFromStatus(memberStatus),
    [memberStatus],
  );

  // TODO: 서버 응답으로 교체
  const publicSections = useMemo(
    () => [
      {
        categoryId: 1,
        label: "카테고리 이름",
        color: colors.or,
        todos: [
          { id: "t1", title: "연우님 기획 차력쇼 감상", done: false },
          { id: "t2", title: "수정님의 UX 연구 발표", done: false },
          { id: "t3", title: "영오님의 시장 조사 결과 공유", done: false },
          { id: "t4", title: "기현님의 시장 조사 결과 공유", done: false },
        ],
      },
    ],
    [],
  );

  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      {/* Header: 그룹명 subtitle + 000님의 튀김 가게 title */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ paddingRight: 8 }}
        >
          <ChevronIcon
            direction="left"
            size={18}
            color={colors.bk}
            strokeWidth={2}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <AppText variant="M500" className="text-gr500">
            {groupName}
          </AppText>
          <AppText
            variant="H3"
            className="text-bk"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginTop: 2 }}
          >
            {memberName}님의 튀김 가게
          </AppText>
        </View>
      </View>

      {/* 홈 화면과 동일: ScrollView 에 px-5, 캐릭터+dashed+카테고리 전부 스크롤 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="px-5"
      >
        {/* 캐릭터 섹션 (247h, w-72% aspect-1, 말풍선 absolute top 3%) */}
        <View
          className="w-full items-center justify-center pt-[13px]"
          style={{ height: 247 }}
        >
          <HomeStyleBubble text={cheerMessage} />

          <View
            className="relative w-[72%]"
            style={{ aspectRatio: 1, maxHeight: "100%" }}
          >
            {lottieKey && TodoLottie[lottieKey] ? (
              <LottieView
                source={TodoLottie[lottieKey]}
                autoPlay
                loop={false}
                style={{ position: "absolute", width: "100%", height: "100%" }}
              />
            ) : null}
          </View>
        </View>

        {/* 상단 가로 점선 */}
        <View className="mt-3">
          <StretchDottedH />
        </View>

        {/* 공개 카테고리 섹션들 (read-only) */}
        {publicSections.map((section) => (
          <CategorySection key={section.categoryId} section={section} />
        ))}

        {/* 하단 가로 점선 */}
        <View className="mt-2 mb-10">
          <StretchDottedH />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * 홈 화면 SpeechBubble 과 동일 스타일 (rounded 14, border gr200, bg wt,
 * 회전 사각형 tail: bottom -4, left 48.5%, rotate 45deg).
 */
function HomeStyleBubble({ text }) {
  if (!text) return null;
  return (
    <View
      className="absolute left-0 right-0 items-center"
      style={{ top: "3%", zIndex: 10 }}
      pointerEvents="none"
    >
      <View className="relative rounded-[14px] border border-gr200 bg-wt px-4 py-[8px]">
        <AppText
          variant="M500"
          className="text-center text-[12px] text-gr900"
          style={{ fontFamily: "Pretendard-Medium" }}
        >
          {text}
        </AppText>
      </View>

      <View
        className="absolute h-2 w-2 rounded-br-[2px] border-b border-r border-gr200 bg-wt"
        style={{
          bottom: -4,
          left: "48.5%",
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}

/**
 * 카테고리 헤더 (컬러 pill) + 투두 리스트.
 * 남의 투두라 disabled 체크박스만 (탭 불가).
 */
function CategorySection({ section }) {
  const [open, setOpen] = useState(true);
  const color = section?.color ?? colors.or;

  return (
    <View style={{ paddingVertical: 16 }}>
      {/* 헤더 pill */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen((v) => !v)}
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: color,
        }}
      >
        <AppText variant="M600" className="text-wt">
          {section.label}
        </AppText>
        <ChevronIcon
          direction={open ? "up" : "down"}
          size={14}
          color={colors.wt}
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      {/* 투두 리스트 (read-only) */}
      {open ? (
        <View style={{ marginTop: 12 }}>
          {section.todos.map((todo) => (
            <ReadOnlyTodoRow key={todo.id} todo={todo} color={color} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * 읽기 전용 투두 한 줄. 체크박스는 시각적 표시만 (탭 불가).
 */
function ReadOnlyTodoRow({ todo, color }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
      }}
    >
      <AppText variant="M500" className="text-bk" style={{ flex: 1, paddingRight: 12 }}>
        {todo.title}
      </AppText>
      {todo.done ? (
        <TodoRadioOnIcon width={24} height={24} color={color} />
      ) : (
        <TodoRadioOffIcon width={24} height={24} />
      )}
    </View>
  );
}

/**
 * 부모 폭 100% stretch 가로 점선.
 */
function StretchDottedH() {
  const [w, setW] = useState(0);
  return (
    <View
      style={{ width: "100%", height: 1 }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
    >
      {w > 0 ? <DottedDivider direction="horizontal" length={w} /> : null}
    </View>
  );
}
