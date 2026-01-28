// src/features/todo/screens/Home/HomeScreen.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  InteractionManager,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {SafeAreaView} from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import {TodoLottie} from "../../assets/lottie"; // HomeScreen 기준 상대경로 유지
import AppText from "../../../../shared/components/AppText";
import TodayIcon from "../../assets/svg/Today.svg";
import CategoryIcon from "../../assets/svg/Category.svg";
import ShadowGRIcon from "../../assets/svg/shadow/shadowGR.svg";
import ShadowORIcon from "../../assets/svg/shadow/shadowOR.svg";

import TodoCard from "../../components/TodoCard";
import TodoEditorSheet from "../../components/TodoEditorSheet/TodoEditorSheet";
import {useTodoEditorController} from "../../hooks/useTodoEditorController";

import {useHomeTodosQuery} from "../../queries/home/useHomeTodosQuery";
import {useCategoriesQuery} from "../../queries/category/useCategoriesQuery";
import {useTodoCharacterStatusQuery} from "../../queries/home/useTodoCharacterStatusQuery";

import {useCreateTodoMutation} from "../../queries/sheet/useCreateTodoMutation";
import {useMoveTodoTomorrowMutation} from "../../queries/home/useMoveTodoTomorrowMutation";
import {useMoveTodoTodayMutation} from "../../queries/home/useMoveTodoTodayMutation";
import {useDeleteTodoMutation} from "../../queries/home/useDeleteTodoMutation";
import {useToggleTodoCompletionMutation} from "../../queries/home/useToggleTodoCompletionMutation";
import {useReorderHomeTodosMutation} from "../../queries/home/useReorderHomeTodosMutation";
import {useDeleteRecurrenceTodosMutation} from "../../queries/home/useDeleteRecurrenceTodosMutation";

import {useModalStore} from "../../../../shared/stores/modal/modalStore";
import colors from "../../../../shared/styles/colors";
import TodoBoardSection from "../../components/TodoBoardSection";
import FCMInitializer from "../../../../notifications/components/FCMInitializer";

const {width, height} = Dimensions.get("window");

// ✅ 오늘 날짜(로컬 기준) YYYY-MM-DD
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
      return "caseE1"; // ✅ 너의 파일명 규칙
    case "CASE_E2":
      return "caseE2"; // ✅ 너의 파일명 규칙
    case "CASE_F":
      return "caseF";
    case "CASE_G":
      return "caseG";
    default:
      // return "caseA"; // fallback
      return null;
  }
}

// function CheerBubble({text}) {
//   if (!text) return null;

//   return (
//     <View style={bubbleStyles.wrap} pointerEvents="none">
//       <View style={bubbleStyles.box}>
//         <AppText variant="M500" className="text-bk" style={bubbleStyles.text}>
//           {text}
//         </AppText>
//       </View>
//       <View style={bubbleStyles.tail} />
//     </View>
//   );
// }

function SpeechBubble({text}) {
  if (!text) return null;

  return (
    <View style={bubbleStyles.wrap} pointerEvents="none">
      <View style={bubbleStyles.bubble}>
        <AppText variant="M500" style={bubbleStyles.text}>
          {text}
        </AppText>

        {/* 꼬리 */}
        {/* <View style={bubbleStyles.tail} /> */}
      </View>
      <View style={bubbleStyles.tail} />
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
    "우와아... 따뜻하고 뿌듯한 하루야…",
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

export default function HomeScreen({navigation}) {
  const {open, close} = useModalStore();

  const [shouldInitNotifications, setShouldInitNotifications] = useState(false);
  useEffect(() => {
    // 홈 화면이 처음 마운트될 때만 true로 바꿔서 초기화 1회 실행
    setShouldInitNotifications(true);
  }, []);

  const [bubbleText, setBubbleText] = useState("");

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const date = useMemo(() => formatYYYYMMDD(currentDate), [currentDate]);
  const header = useMemo(() => formatKoreanHeader(currentDate), [currentDate]);

  const isViewingToday = useMemo(() => {
    return date === formatYYYYMMDD(new Date());
  }, [date]);

  // ✅ 카테고리 조회 (서버)
  const {data: rawCategories = []} = useCategoriesQuery();

  // ✅ TodoCard가 기대하는 형태로 매핑 + displayOrder 정렬
  const categories = useMemo(() => {
    const arr = Array.isArray(rawCategories) ? rawCategories : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((c) => ({
        categoryId: c.id,
        label: c.name,
        color: c.colorHex, // 화면 표시용 hex
      }));
  }, [rawCategories]);

  // ✅ 홈 투두 조회 (categoryId 생략 = 전체)
  const {data: rawTodos = [], isSuccess: isHomeTodosSuccess} =
    useHomeTodosQuery({
      date,
      categoryId: undefined,
    });

  useEffect(() => {
    console.log("Categories: ", rawCategories);
  }, [rawCategories]);

  useEffect(() => {
    console.log("Home todos: ", rawTodos);
  }, [rawTodos]);

  const SWIPE_THRESHOLD = 50;
  const onSwipeChangeDate = useCallback(
    (dx) => {
      // ✅ 요청대로: 우로 스와이프(음수) = 전날, 좌로 스와이프(양수) = 다음날
      if (dx >= SWIPE_THRESHOLD) {
        setCurrentDate((prev) => addDays(prev, -1));
      } else if (dx <= -SWIPE_THRESHOLD) {
        setCurrentDate((prev) => addDays(prev, +1));
      }
    },
    [setCurrentDate],
  );

  const panGesture = useMemo(() => {
    return (
      Gesture.Pan()
        .runOnJS(true) // ✅ 추가
        // ✅ 가로 스와이프 잡기
        .activeOffsetX([-12, 12])
        .failOffsetY([-10, 10])
        .onEnd((e) => {
          onSwipeChangeDate(e.translationX);
        })
    );
  }, [onSwipeChangeDate]);

  const {
    data: characterStatus, // { status, imageCode, description }
    dataUpdatedAt: characterUpdatedAt,
    isLoading: isCharacterLoading, // ✅ 추가
    isFetching: isCharacterFetching, // (선택)
  } = useTodoCharacterStatusQuery({date}, {enabled: isHomeTodosSuccess});

  useEffect(() => {
    console.log("characterStatus: ", characterStatus);
  }, [characterStatus]);

  const isCharacterBusy = isCharacterLoading || isCharacterFetching;

  const lottieKey = useMemo(() => {
    return getLottieKeyFromStatus(characterStatus?.status);
  }, [characterStatus?.status]);

  const isShadowGR = useMemo(() => {
    return (
      characterStatus?.status === "CASE_A" ||
      characterStatus?.status === "CASE_F"
    );
  }, [characterStatus?.status]);

  useEffect(() => {
    const status = characterStatus?.status;
    const pool = BUBBLE_MENTS[status] ?? null;

    // ✅ 쿼리가 호출(갱신)될 때마다 새로운 랜덤 멘트로 갱신
    setBubbleText(pickRandom(pool, ""));
  }, [characterStatus?.status, characterUpdatedAt]);

  const shouldRenderBack = lottieKey === "caseE1" || lottieKey === "caseE2";

  // ✅ TodoCard가 쓰는 형태로 변환 + displayOrder 정렬
  const todos = useMemo(() => {
    const arr = Array.isArray(rawTodos) ? rawTodos : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((t) => ({
        id: String(t.id), // DraggableFlatList keyExtractor용 string
        title: t.description ?? "",
        done: t.status === "COMPLETED",
        categoryId: t.categoryId,
        displayOrder: t.displayOrder,
        date: t.date,
        recurrenceId: t.recurrenceId,
        occurrenceDate: t.occurrenceDate,
      }));
  }, [rawTodos]);

  // ✅ 투두 생성 mutation 연결
  const {mutateAsync: createTodoMutateAsync} = useCreateTodoMutation();
  // ✅ "내일하기" mutation 연결
  const {mutateAsync: moveTodoTomorrowMutateAsync} =
    useMoveTodoTomorrowMutation();
  // ✅ "오늘하기" mutation 연결
  const {mutateAsync: moveTodoTodayMutateAsync} = useMoveTodoTodayMutation();
  const {mutateAsync: deleteTodoMutateAsync} = useDeleteTodoMutation();
  const {mutateAsync: deleteRecurrenceTodosMutateAsync} =
    useDeleteRecurrenceTodosMutation();
  const {mutateAsync: toggleCompletionMutateAsync} =
    useToggleTodoCompletionMutation();
  const {mutateAsync: reorderTodosMutateAsync} = useReorderHomeTodosMutation();

  // ✅ 추가: 현재 편집 중인 todoId
  const [selectedTodoId, setSelectedTodoId] = useState(null);

  const editor = useTodoEditorController({
    categories, // ✅ 서버 카테고리로 교체
    onSubmitTodo: async ({todo, text, categoryId}) => {
      // ✅ create 모드
      if (!todo?.id) {
        // 바텀시트 투두 생성 API: description, categoryId로 생성
        await createTodoMutateAsync({
          description: text,
          categoryId,
          date, // ✅ 홈에서 보고 있는 날짜로 생성 (YYYY-MM-DD)
        });
        return;
      }

      // ✅ edit 모드(추후 update mutation 연결 자리)
      // await updateTodoMutateAsync({ todoId: todo.id, ... })
    },
  });

  const isRecurringTodo = (todo) => {
    const rid = todo?.recurrenceId;
    return rid !== null && rid !== undefined && Number(rid) !== 0;
  };

  const handleRequestDeleteTodo = useCallback(
    async (todo) => {
      const todoId = Number(todo?.id);
      if (!todoId) return;

      // ✅ 반복 투두면: 모달
      if (isRecurringTodo(todo)) {
        const recurrenceId = Number(todo.recurrenceId);

        open({
          title: "반복 일정 삭제",
          showClose: true,
          closeOnBackdrop: true,

          // 스샷처럼 둘 다 “아웃라인 버튼” 느낌이면 variant를 outline로 통일
          primary: {
            label: "이번 투두만 삭제할래요",
            variant: "outline",
            closeAfterPress: false,
            onPress: async () => {
              await deleteTodoMutateAsync({todoId});
              close();
            },
          },
          secondary: {
            label: "모든 반복 투두를 삭제할래요",
            variant: "outline",
            closeAfterPress: false,
            onPress: async () => {
              await deleteRecurrenceTodosMutateAsync({recurrenceId});
              close();
            },
          },
        });

        return;
      }

      // ✅ 반복 투두 아니면: 바로 삭제
      await deleteTodoMutateAsync({todoId});
    },
    [open, close, deleteTodoMutateAsync, deleteRecurrenceTodosMutateAsync],
  );

  // ✅ TodoCard에서 투두 눌렀을 때 호출될 핸들러로 감싸기
  const handlePressTodoInput = useCallback(
    (payload) => {
      // payload는 TodoCard에서 넘기는 { ...todo, mode: "edit" } or {id:null,...}
      const id = payload?.id ? Number(payload.id) : null;

      setSelectedTodoId(id); // ✅ edit면 todoId 세팅, create면 null
      editor.openEditor?.(payload);
    },
    [editor],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      {shouldInitNotifications && <FCMInitializer />}
      {/* topBar: 날짜 + 우측 SVG 아이콘들 */}
      <View style={styles.topBar}>
        <View>
          <AppText variant="M500" className="text-gr500">
            {header.yearText}
          </AppText>
          <AppText variant="H3" className="text-bk">
            {header.dateText}
          </AppText>
        </View>

        <View style={styles.iconRow}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.iconButton}
            onPress={() => setCurrentDate(new Date())}
          >
            <TodayIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("Category", {
                screen: "CategList",
              })
            }
          >
            <CategoryIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
      {/* ✅ (고정) illustrationWrapper: 여기서는 스크롤 안 됨 */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.illustrationWrapper}>
          <SpeechBubble text={bubbleText} />
          <Pressable
            style={styles.lottieWrapper}
            onPress={() => {
              const status = characterStatus?.status;
              const pool = BUBBLE_MENTS[status] ?? null;

              setBubbleText((prev) =>
                pickRandomDifferent(pool, prev, "대충 응원하는 문구"),
              );
            }}
          >
            {isCharacterBusy ? (
              // <View style={styles.spinnerWrapper}>
              //   <ActivityIndicator size="large" color={colors.gr500} />
              // </View>
              <></>
            ) : (
              <>
                {shouldRenderBack && (
                  <LottieView
                    source={
                      lottieKey === "caseE1"
                        ? TodoLottie.caseE1Back
                        : TodoLottie.caseE2Back
                    }
                    autoPlay
                    loop={false}
                    style={styles.lottie}
                  />
                )}

                {/* ✅ 메인 캐릭터 */}
                <LottieView
                  source={TodoLottie[lottieKey]}
                  autoPlay
                  loop={false}
                  style={styles.lottie}
                />
              </>
            )}
          </Pressable>
          <View style={styles.shadowWrapper}>
            {isShadowGR ? (
              <ShadowGRIcon height="100%" width="100%" />
            ) : (
              <ShadowORIcon height="100%" width="100%" />
            )}
          </View>
        </View>
      </GestureDetector>
      {/* ✅ (고정) 구분선 */}
      <View style={styles.dashedDivider} />

      <View style={{flex: 1}}>
        <TodoBoardSection
          navigation={navigation}
          date={date}
          isViewingToday={isViewingToday}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "11%",
  },
  todoScroll: {
    flex: 1, // ✅ 남은 영역을 TodoCard 스크롤이 차지
  },
  todoScrollContent: {
    paddingBottom: 36, // ✅ 맨 아래 여백(탭바/홈바 겹침 방지)
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationWrapper: {
    height: height * 0.377,
    alignItems: "center",
    justifyContent: "center",
  },
  lottieWrapper: {
    position: "relative",
    width: "60%",
    aspectRatio: 1,
    marginTop: "8%",
  },
  spinnerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  lottie: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  shadowWrapper: {
    width: "60%",
    // height: "100%",
    aspectRatio: 15,
    // borderWidth: 1,
  },
  dashedDivider: {
    // marginVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.gr200,
    borderStyle: "dashed",
  },
});

// ✅ 바텀 시트 내부 스타일
const sheetStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F0F0F0",
  },
  categoryText: {
    fontSize: 13,
    color: "#B0B0B0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    // height: 44,
    // shadowColor: "#000",
    // shadowOpacity: 0.04,
    // shadowRadius: 6,
    // shadowOffset: {width: 0, height: 2},
    // elevation: 4,
  },
  input: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    // fontSize: 15,
    color: "#333333",
  },
  submitButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E4E4E4",
    alignItems: "center",
    justifyContent: "center",
  },
  submitIcon: {
    fontSize: 18,
    color: "#888888",
  },
});

const bubbleStyles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: "5%", // 🔥 튀김 위에 얹고 싶으면 여기 조절
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  bubble: {
    position: "relative",
    backgroundColor: colors.wt,
    borderWidth: 1,
    borderColor: colors.gr200,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,

    // ✅ 텍스트 길면 자동으로 넓어지다가, maxWidth에서 줄바꿈
    // maxWidth: "100%",
  },
  text: {
    textAlign: "center",
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.gr900,
    // borderWidth: 1,
  },
  tail: {
    position: "absolute",
    bottom: -6,
    left: "48.2%",
    // marginLeft: 20,
    // right: "0%",
    width: 12,
    height: 12,
    backgroundColor: colors.wt,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gr200,
    transform: [{rotate: "45deg"}],
  },
});
