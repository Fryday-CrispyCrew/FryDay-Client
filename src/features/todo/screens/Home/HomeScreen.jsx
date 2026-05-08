import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StatusBar,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";

import { TodoLottie } from "../../assets/lottie";
import AppText from "../../../../shared/components/AppText";
import TodayIcon from "../../assets/svg/Today.svg";
import CategoryIcon from "../../assets/svg/Category.svg";
import ErrorImage from "../../../../shared/assets/png/Error.png";
import CharacterSkeleton from "../../components/CharacterSkeleton";
import TodoBoardSection from "../../components/TodoBoardSection";
import FCMInitializer from "../../../../notifications/components/FCMInitializer";

import { useTodoEditorController } from "../../hooks/useTodoEditorController";
import { useHomeTodosQuery } from "../../queries/home/useHomeTodosQuery";
import { useCategoriesQuery } from "../../queries/category/useCategoriesQuery";
import { useTodoCharacterStatusQuery } from "../../queries/home/useTodoCharacterStatusQuery";

import { useCreateTodoMutation } from "../../queries/sheet/useCreateTodoMutation";
import { useMoveTodoTomorrowMutation } from "../../queries/home/useMoveTodoTomorrowMutation";
import { useMoveTodoTodayMutation } from "../../queries/home/useMoveTodoTodayMutation";
import { useDeleteTodoMutation } from "../../queries/home/useDeleteTodoMutation";
import { useToggleTodoCompletionMutation } from "../../queries/home/useToggleTodoCompletionMutation";
import { useReorderHomeTodosMutation } from "../../queries/home/useReorderHomeTodosMutation";
import { useDeleteRecurrenceTodosMutation } from "../../queries/home/useDeleteRecurrenceTodosMutation";

import { useModalStore } from "../../../../shared/stores/modal/modalStore";
import colors from "../../../../shared/styles/colors";
import Dotted from "../../../calendar/assets/svg/Dotted.svg";
import BorderButton from "../../../../shared/components/BorderButton";
import BackIcon from "../../../../shared/assets/svg/Back.svg"
import { useServerStatusStore } from "../../../../shared/stores/serverStatusStore";
import ServerMaintenanceScreen from "../../../../shared/screens/ServerMaintenanceScreen";

function formatYYYYMMDD(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateObj, delta) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + delta);
  return d;
}

function formatKoreanHeader(dateObj) {
  return {
    yearText: `${dateObj.getFullYear()}년`,
    dateText: `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`,
  };
}

function getLottieKeyFromStatus(status) {
  switch (status) {
    case "CASE_A":
      return "caseA";
    case "CASE_B":
      return "caseB";
    case "CASE_C":
      return "caseC";
    case "CASE_D":
      return "caseD";
    case "CASE_E1":
      return "caseE1";
    case "CASE_E2":
      return "caseE2";
    case "CASE_F":
      return "caseF";
    case "CASE_G":
      return "caseG";
    case "CASE_H":
      return "caseH";
    default:
      return null;
  }
}

function SpeechBubble({ text }) {
  if (!text) return null;

  return (
    <View
      className="absolute left-0 right-0 items-center"
      style={{ top: "3%", zIndex: 10 }}
      pointerEvents="none"
    >
      <View className="relative rounded-[14px] border border-gr200 bg-wt px-4 py-[10px]">
        <AppText
          variant="M500"
          className="text-center text-[12px] leading-[18px] text-gr900"
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

const BUBBLE_MENTS = {
  CASE_A: [
    "우우.. 튀겨보면 알겠지",
    "오늘은 뭘 튀겨볼까?",
    "한번 사는 인생, 바삭하게 살자구…",
    "탱글한 생새우 상태도 좋지만…",
    "튀김옷 입을 준비 완료!",
  ],
  CASE_B: [
    "아직은 심심한걸…",
    "튀김기가 졸고 있는 것 같아!",
    "온도를 조금 더 올려보는 건 어때?",
    "아직 조금 미지근해!",
    "예열 기다리는 중…",
  ],
  CASE_C: [
    "바삭하게 가보자고!",
    "지금 튀기면 딱 맛있을 거 같지 않아?",
    "오늘은 네가 새우튀김 요리사~",
    "미지근한 하루에 새우튀김의 등장이라…",
    "오늘도 바삭한 하루 보내!",
  ],
  CASE_D: [
    "바삭바삭 튀겨지는 중~",
    "완벽한 기름 온도야!",
    "오늘 튀김옷 상태 장난 아닌데?",
    "딴짓하면 타버린다?",
    "오늘 재료가 아주 신선한데?",
  ],
  CASE_E1: [
    "아직 튀김 남아있어… 알지?",
    "더 늦으면 나 타버릴지도 몰라…",
    "해가 지고 있어...",
    "내 바삭함을 지켜줘!",
    "잠들기 전까지 다 튀길 수 있지?!",
  ],
  CASE_E2: [
    "아니야… 아직 안 늦었어…",
    "나 잊은 건 아니지?",
    "오늘이 지나면 맛이 없어진다구…",
    "우리 바삭하게 마무리하기로 했잖아…",
    "내 마음까지 타들어 가는 걸?",
  ],
  CASE_F: [
    "내일은 꼭 바삭하게 만들어줘…",
    "아뜨뜨… 나 타버렸다…",
    "그래도 내일의 너를 믿을게",
    "괜찮아, 이런 날도 있는 거지…",
    "음… 다시 한번 튀겨보는 건 어때?",
  ],
  CASE_G: [
    "완벽해! 내가 꿈꾸던 바삭함이야!",
    "너 오늘 하루 **완전 튀겼어**",
    "빵가루 털고 푹 쉬자! 오늘도 수고 많았어!",
    "최고야! 내일도 맛있는 하루 부탁해!",
    "우와아… 따뜻하고 뿌듯한 하루야…",
  ],
  CASE_H: [
    "날… 잊은 건 아니지?",
    "바삭해진다는건 어떤 느낌일까?",
    "나도 바삭해지고 싶다…",
    "내일은 바삭해질 수 있을까?",
    "내일은 날 잊지 말아줘…!",
  ],
};

function pickRandom(list, fallback = "") {
  if (!Array.isArray(list) || list.length === 0) return fallback;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

function pickRandomDifferent(list, prev, fallback = "") {
  if (!Array.isArray(list) || list.length === 0) return fallback;
  if (list.length === 1) return list[0];

  let next = prev;
  let guard = 0;
  while (next === prev && guard < 10) {
    next = list[Math.floor(Math.random() * list.length)];
    guard += 1;
  }
  return next ?? fallback;
}

export default function HomeScreen({ navigation, route }) {
  const { open, close } = useModalStore();

  const [shouldInitNotifications, setShouldInitNotifications] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [parentScrollEnabled, setParentScrollEnabled] = useState(true);
  const isServerError = useServerStatusStore((s) => s.isServerError);

  useEffect(() => {
    // useServerStatusStore.getState().openServerError(); 점검 화면 테스트
    setShouldInitNotifications(true);
  }, []);

  const date = useMemo(() => formatYYYYMMDD(currentDate), [currentDate]);
  const header = useMemo(() => formatKoreanHeader(currentDate), [currentDate]);

  const isViewingToday = useMemo(() => {
    return date === formatYYYYMMDD(new Date());
  }, [date]);

  const {
    data: rawCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategoriesQuery();

  const categories = useMemo(() => {
    const arr = Array.isArray(rawCategories) ? rawCategories : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((c) => ({
        categoryId: c.id,
        label: c.name,
      }));
  }, [rawCategories]);

  const {
    data: rawTodos = [],
    isFetched: isHomeTodosFetched,
    isLoading: isTodosLoading,
    isError: isTodosError,
  } = useHomeTodosQuery({
    date,
    categoryId: undefined,
  });

  const SWIPE_THRESHOLD = 50;

  const onSwipeChangeDate = useCallback((dx) => {
    if (dx >= SWIPE_THRESHOLD) {
      setCurrentDate((prev) => addDays(prev, -1));
    } else if (dx <= -SWIPE_THRESHOLD) {
      setCurrentDate((prev) => addDays(prev, 1));
    }
  }, []);

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-12, 12])
      .failOffsetY([-10, 10])
      .onEnd((e) => {
        onSwipeChangeDate(e.translationX);
      });
  }, [onSwipeChangeDate]);

  const {
    data: characterStatus,
    dataUpdatedAt: characterUpdatedAt,
    isLoading: isCharacterLoading,
    isError: isCharacterError,
  } = useTodoCharacterStatusQuery({ date }, { enabled: isHomeTodosFetched });

  const isBoardLoading = isCategoriesLoading || isTodosLoading;
  const isCharacterBusy = isCharacterLoading || isBoardLoading;

  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isCharacterBusy) {
      setShowSkeleton(false);
      return;
    }
    const timer = setTimeout(() => setShowSkeleton(true), 3000);
    return () => clearTimeout(timer);
  }, [isCharacterBusy]);

  const lottieKey = useMemo(() => {
    return getLottieKeyFromStatus(characterStatus?.status);
  }, [characterStatus?.status]);

  useEffect(() => {
    const status = characterStatus?.status;
    const pool = BUBBLE_MENTS[status] ?? null;
    setBubbleText(pickRandom(pool, ""));
  }, [characterStatus?.status, characterUpdatedAt]);

  const todos = useMemo(() => {
    const arr = Array.isArray(rawTodos) ? rawTodos : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((t) => ({
        id: String(t.id),
        title: t.description ?? "",
        done: t.status === "COMPLETED",
        categoryId: t.categoryId,
        displayOrder: t.displayOrder,
        date: t.date,
        recurrenceId: t.recurrenceId,
        occurrenceDate: t.occurrenceDate,
        memo: t.memo ?? "",
      }));
  }, [rawTodos]);

  const { mutateAsync: createTodoMutateAsync } = useCreateTodoMutation();
  const { mutateAsync: moveTodoTomorrowMutateAsync } =
    useMoveTodoTomorrowMutation();
  const { mutateAsync: moveTodoTodayMutateAsync } = useMoveTodoTodayMutation();
  const { mutateAsync: deleteTodoMutateAsync } = useDeleteTodoMutation();
  const { mutateAsync: deleteRecurrenceTodosMutateAsync } =
    useDeleteRecurrenceTodosMutation();
  const { mutateAsync: toggleCompletionMutateAsync } =
    useToggleTodoCompletionMutation();
  const { mutateAsync: reorderTodosMutateAsync } =
    useReorderHomeTodosMutation();

  const editor = useTodoEditorController({
    categories,
    onSubmitTodo: async ({ todo, text, categoryId }) => {
      if (!todo?.id) {
        await createTodoMutateAsync({
          description: text,
          categoryId,
          date,
        });
        return;
      }
    },
  });

  const appliedInitialDateRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const dateStr = route?.params?.initialDate;

      if (dateStr && appliedInitialDateRef.current !== dateStr) {
        const [y, m, d] = String(dateStr).split("-").map(Number);
        if (y && m && d) {
          appliedInitialDateRef.current = dateStr;
          setCurrentDate(new Date(y, m - 1, d));
        }
      }
    }, [route?.params?.initialDate]),
  );

  const isApiError = isCategoriesError || isTodosError || isCharacterError;

  const boardHeader = useMemo(() => {
    return (
      <>
        <GestureDetector gesture={panGesture}>
          <View
            className="w-full items-center justify-center pt-[13px]"
            style={{ height: 247 }}
          >
            <SpeechBubble text={bubbleText} />

            <Pressable
              className="relative w-[72%]"
              style={{ aspectRatio: 1, maxHeight: "100%" }}
              onPress={() => {
                const status = characterStatus?.status;
                const pool = BUBBLE_MENTS[status] ?? null;

                setBubbleText((prev) =>
                  pickRandomDifferent(pool, prev, "대충 응원하는 문구"),
                );
              }}
            >
              {isCharacterBusy && showSkeleton ? (
                <CharacterSkeleton />
              ) : (
                <LottieView
                  source={TodoLottie[lottieKey]}
                  autoPlay
                  loop={false}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </Pressable>
          </View>
        </GestureDetector>

        <View className="mx-5 mt-3">
          <Dotted width="100%" height={1} />
        </View>
      </>
    );
  }, [
    panGesture,
    bubbleText,
    characterStatus?.status,
    isCharacterBusy,
    showSkeleton,
    lottieKey,
  ]);

  if (isApiError || isServerError) {
    return <ServerMaintenanceScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      {shouldInitNotifications && <FCMInitializer />}

      <View
        className="w-full flex-row items-center justify-between"
        style={{ paddingVertical: 16, paddingHorizontal: 20 }}
      >
        <View>
          <AppText variant="M500" className="text-gr500">
            {header.yearText}
          </AppText>
          <AppText variant="H3" className="text-bk">
            {header.dateText}
          </AppText>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {!isViewingToday && (
            <BorderButton
              text="오늘로"
              icon={<BackIcon width={14} height={14} />}
              onPress={() => setCurrentDate(new Date())}
            />
          )}

          {/*<TouchableOpacity*/}
          {/*  activeOpacity={0.5}*/}
          {/*  style={{*/}
          {/*    width: 32,*/}
          {/*    height: 32,*/}
          {/*    justifyContent: "center",*/}
          {/*    alignItems: "center",*/}
          {/*  }}*/}
          {/*  onPress={() =>*/}
          {/*    navigation.navigate("Category", {*/}
          {/*      screen: "CategList",*/}
          {/*    })*/}
          {/*  }*/}
          {/*>*/}
          {/*  <CategoryIcon width={24} height={24} />*/}
          {/*</TouchableOpacity>*/}
        </View>
      </View>

      <ScrollView
        scrollEnabled={parentScrollEnabled}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="px-5"
      >
        <TodoBoardSection
          navigation={navigation}
          date={date}
          isViewingToday={isViewingToday}
          todos={todos}
          setParentScrollEnabled={setParentScrollEnabled}
          ListHeaderComponent={boardHeader}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
