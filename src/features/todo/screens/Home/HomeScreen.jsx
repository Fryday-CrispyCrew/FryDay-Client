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
} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {SafeAreaView} from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import {TodoLottie} from "../../assets/lottie"; // HomeScreen 기준 상대경로 유지
import AppText from "../../../../shared/components/AppText";
import TodayIcon from "../../assets/svg/Today.svg";
import CategoryIcon from "../../assets/svg/Category.svg";

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
    case "CASE_E":
      return "caseE1"; // ✅ 너의 파일명 규칙
    case "CASE_F":
      return "caseE2"; // ✅ 너의 파일명 규칙
    case "CASE_G":
      return "caseG";
    default:
      return "caseA"; // fallback
  }
}

export default function HomeScreen({navigation}) {
  const {open, close} = useModalStore();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const date = useMemo(() => formatYYYYMMDD(currentDate), [currentDate]);
  const header = useMemo(() => formatKoreanHeader(currentDate), [currentDate]);

  const isViewingToday = useMemo(() => {
    return date === formatYYYYMMDD(new Date());
  }, [date]);

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

  const {data: characterStatus} = useTodoCharacterStatusQuery({date});

  const lottieKey = useMemo(() => {
    return getLottieKeyFromStatus(characterStatus?.status);
  }, [characterStatus?.status]);

  const shouldRenderBack = lottieKey === "caseE1" || lottieKey === "caseE2";

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
  const {data: rawTodos = []} = useHomeTodosQuery({
    date,
    categoryId: undefined,
  });

  useEffect(() => {
    console.log("Categories: ", rawCategories);
  }, [rawCategories]);

  useEffect(() => {
    console.log("Home todos: ", rawTodos);
  }, [rawTodos]);

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
    <SafeAreaView style={styles.safe} edges={["top"]} mode={"margin"}>
      <StatusBar barStyle="dark-content" />
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
          <View style={styles.lottieWrapper}>
            {/* ✅ caseE1 / caseE2일 때만 back 레이어 추가 */}
            {shouldRenderBack && (
              <LottieView
                source={
                  lottieKey === "caseE1"
                    ? TodoLottie.caseE1Back
                    : TodoLottie.caseE2Back
                }
                autoPlay
                loop
                style={styles.lottie}
              />
            )}

            {/* ✅ 메인 캐릭터 */}
            <LottieView
              source={TodoLottie[lottieKey] ?? TodoLottie.caseA}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        </View>
      </GestureDetector>

      {/* ✅ (고정) 구분선 */}
      <View style={styles.dashedDivider} />

      {/* ✅ (스크롤) TodoCard 영역만 스크롤 */}
      <ScrollView
        style={styles.todoScroll}
        contentContainerStyle={styles.todoScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TodoCard
          navigation={navigation}
          onPressInput={handlePressTodoInput}
          categories={categories}
          todos={todos}
          isViewingToday={isViewingToday}
          onDoToday={async (todoId) => {
            // ✅ "오늘하기" 눌렀을 때 확인 모달 띄우기
            return new Promise((resolve) => {
              open({
                title: "확인",
                description:
                  "투두가 오늘 날짜로 이동하며,\n기존 날짜의 투두는 삭제돼요. 오늘 하기로 설정할까요?",
                closeOnBackdrop: true,
                showClose: true,

                primary: {
                  label: "네, 설정할래요",
                  variant: "outline",
                  closeAfterPress: false, // ✅ async 끝나기 전에 ModalHost가 닫지 않게
                  onPress: async () => {
                    try {
                      await moveTodoTodayMutateAsync({todoId});
                      resolve(true);
                    } finally {
                      close(); // ✅ 처리 후 모달 닫기
                    }
                  },
                },

                secondary: {
                  label: "아니요, 그만둘래요",
                  variant: "outline",
                  closeAfterPress: true,
                  onPress: () => resolve(false),
                },

                onClose: () => resolve(false),
              });
            });
          }}
          onDoTomorrow={async (todoId) => {
            // ✅ "내일하기" 눌렀을 때 확인 모달 띄우기
            return new Promise((resolve) => {
              open({
                title: "확인",
                description:
                  "투두가 내일 날짜로 이동하며,\n기존 날짜의 투두는 삭제돼요. 내일 하기로 설정할까요?",

                // (선택) 배경 클릭 시 닫히게 할지
                closeOnBackdrop: true,
                showClose: true,

                primary: {
                  label: "네, 설정할래요",
                  // 스샷은 두 버튼 다 아웃라인 느낌이라 outline로 통일(원하면 primary로 변경)
                  variant: "outline",
                  closeAfterPress: false, // ✅ 중요: async 끝나기 전에 ModalHost가 닫지 않게
                  onPress: async () => {
                    try {
                      await moveTodoTomorrowMutateAsync({todoId});
                      resolve(true);
                    } finally {
                      close(); // ✅ 성공/실패 상관없이 모달 닫기
                    }
                  },
                },

                secondary: {
                  label: "아니요, 그만둘래요",
                  variant: "outline",
                  closeAfterPress: true, // 기본 true라 close() 자동
                  onPress: () => {
                    resolve(false);
                  },
                },

                // X 버튼/백버튼/배경 클릭으로 닫힐 때도 resolve 처리
                onClose: () => {
                  resolve(false);
                },
              });
            });
          }}
          onDeleteTodo={handleRequestDeleteTodo}
          onToggleTodoCompletion={async (todoId) => {
            // ✅ POST /api/todos/{todoId}/completion
            await toggleCompletionMutateAsync({todoId: Number(todoId)});
          }}
          onReorderTodos={async ({ids}) => {
            // ✅ date는 HomeScreen의 현재 date를 사용 (필수 쿼리)
            await reorderTodosMutateAsync({date, ids});
          }}
        />
      </ScrollView>

      {/* ✅ @gorhom/bottom-sheet 기반 입력 시트 */}
      <TodoEditorSheet
        {...editor.sheetProps}
        todoId={selectedTodoId}
        onDismiss={() => {
          setSelectedTodoId(null);
          editor.sheetProps?.onDismiss?.();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: "5%",
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
    // height: "42%",
    position: "absolute",
    width: "100%",
    height: "100%",
    // borderWidth: 1,
  },
  lottie: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  sunburst: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "#FFD3B5",
    opacity: 0.7,
  },
  shrimp: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FF7A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  dashedDivider: {
    // marginVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
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
