// src/features/todo/components/TodoCard.jsx
import React, {useMemo, useState, useCallback, useEffect} from "react";
import {View, StyleSheet, TouchableOpacity} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import AppText from "../../../shared/components/AppText";
import DragHandleIcon from "../assets/svg/DragHandle.svg";
import DeleteIcon from "../assets/svg/Delete.svg";
import StartDateIcon from "../assets/svg/StartDate.svg";
import TomorrowIcon from "../assets/svg/Tomorrow.svg";
import TodoRadioOnIcon from "../assets/svg/RadioOn.svg";
import TodoRadioOffIcon from "../assets/svg/RadioOff.svg";

import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import PlusIcon from "../assets/svg/Plus.svg";
import colors from "../../../shared/styles/colors";

/** ✅ 목업 투두 (규칙: 현재는 mock) */
// const MOCK_TODOS = [
//   {id: "1", title: "연우님 기획 차력쇼 감상", done: false, categoryId: 1},
//   {id: "2", title: "기찬님의 프로젝트 관리 전략", done: false, categoryId: 1},
//   {id: "3", title: "토익 공부", done: true, categoryId: 2},
//   {id: "4", title: "알고리즘 공부", done: true, categoryId: 2},
// ];

const ACTION_BTN_W = 48; // 버튼 하나 너비(원하는 값으로)
const ACTION_GAP = 6; // 버튼 간격
const ACTIONS_TOTAL_W = ACTION_BTN_W * 2 + ACTION_GAP;
const SWIPE_OPEN_OFFSET = -ACTIONS_TOTAL_W;
const SWIPE_THRESHOLD = -(ACTIONS_TOTAL_W * 0.5);

function TodoItem({
  item,
  isActive,
  isOpen,
  onToggleDone,
  onDelete,
  onSwipeOpen,
  onSwipeClose,
  onLongPressDrag,
  onPressItem, // ✅ 추가
  onDoToday,
  onDoTomorrow,
  isViewingToday,
}) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withTiming(isOpen ? SWIPE_OPEN_OFFSET : 0, {
      duration: 180,
    });
  }, [isOpen, translateX]);

  const panGesture = Gesture.Pan()
    // ✅ 가로로 확실히 움직일 때만 스와이프를 "활성화"
    .activeOffsetX([-8, 8])
    // ✅ 세로로 조금만 움직여도 스와이프는 "실패" → ScrollView가 스크롤 우선
    .failOffsetY([-4, 4])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      let next = startX.value + event.translationX;
      if (next > 0) next = 0;
      if (next < SWIPE_OPEN_OFFSET) next = SWIPE_OPEN_OFFSET;
      translateX.value = next;
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(SWIPE_OPEN_OFFSET, {duration: 180});
        runOnJS(onSwipeOpen)(item.id);
      } else {
        translateX.value = withTiming(0, {duration: 180});
        runOnJS(onSwipeClose)(item.id);
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <View style={styles.todoRowWrapper}>
      {/* 뒤에 깔린 삭제 버튼 */}
      <View style={styles.todoRightActionContainer}>
        <TouchableOpacity
          style={styles.todoDeleteButton}
          activeOpacity={0.7}
          onPress={() => onDelete(item)}
        >
          <DeleteIcon width={20} height={20} />
        </TouchableOpacity>

        {isViewingToday ? (
          <TouchableOpacity
            style={styles.todoTodayButton} // ✅ 스타일 그대로 재사용
            activeOpacity={0.7}
            onPress={() => onDoTomorrow?.(item.id)}
          >
            <TomorrowIcon width={20} height={20} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.todoTodayButton}
            activeOpacity={0.7}
            onPress={() => onDoToday?.(item.id)}
          >
            <StartDateIcon width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* 앞에서 좌우로 움직이는 투두 row */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.todoRow,
            isActive && {backgroundColor: "#F2F2F2"},
            isOpen && {backgroundColor: "#F2F2F2"},
            animatedRowStyle,
          ]}
        >
          <TouchableOpacity
            onLongPress={onLongPressDrag}
            hitSlop={8}
            style={styles.dragHandleButton}
          >
            <DragHandleIcon width={12} />
          </TouchableOpacity>

          {/* ✅ 텍스트 눌러서 수정 바텀시트 열기 */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={{flex: 1}}
            onPress={() => onPressItem?.(item)}
          >
            <AppText variant="M500" className="text-bk">
              {item.title}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.todoRadioHitArea}
            activeOpacity={0.6}
            onPress={() => onToggleDone(item.id)}
          >
            {item.done ? (
              <TodoRadioOnIcon width={24} height={24} />
            ) : (
              <TodoRadioOffIcon width={24} height={24} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function Chevron({isOpen, color}) {
  return (
    // <AppText variant="M600" style={{color, fontSize: 16, lineHeight: 16}}>
    //   {isOpen ? "˄" : "˅"}
    // </AppText>
    <ChevronIcon
      direction={isOpen ? "up" : "down"}
      size={14}
      color={color}
      strokeWidth={2}
    />
  );
}

export default function TodoCard({
  navigation,
  onPressInput,
  categories = [],
  onDoToday,
  onDoTomorrow,
  onDeleteTodo,
  onToggleTodoCompletion, // ✅ 추가
  onReorderTodos, // ✅ 추가
  isViewingToday = false,
  todos: todosProp = [], // ✅ 추가 (HomeScreen에서 내려줌)
}) {
  const [todos, setTodos] = useState(todosProp);
  const [swipedTodoId, setSwipedTodoId] = useState(null);

  // ✅ 서버/쿼리 결과가 바뀌면 화면도 동기화
  useEffect(() => {
    setTodos(Array.isArray(todosProp) ? todosProp : []);
  }, [todosProp]);

  const closeAnySwipe = useCallback(() => {
    setSwipedTodoId(null);
  }, []);

  const handleDoTomorrow = useCallback(
    async (id) => {
      try {
        await onDoTomorrow?.(id);
      } finally {
        closeAnySwipe(); // ✅ 동작 완료 후 스와이프 닫기
      }
    },
    [onDoTomorrow, closeAnySwipe],
  );

  const handleDoToday = useCallback(
    async (id) => {
      try {
        await onDoToday?.(id);
      } finally {
        closeAnySwipe(); // ✅ 동작 완료 후 스와이프 닫기
      }
    },
    [onDoToday, closeAnySwipe],
  );

  // ✅ 기본: 첫 카테고리만 펼쳐진 상태로 시작
  const [openMap, setOpenMap] = useState(() => {
    const first = categories?.[0]?.categoryId;
    return first ? {[first]: true} : {};
  });

  const grouped = useMemo(() => {
    const by = {};
    for (const c of categories) by[c.categoryId] = [];
    for (const t of todos) {
      if (!by[t.categoryId]) by[t.categoryId] = [];
      by[t.categoryId].push(t);
    }
    return by;
  }, [todos, categories]);

  const toggleTodoDone = useCallback(
    async (id) => {
      // ✅ 1) optimistic 업데이트
      let prevDone = false;
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id !== id) return todo;
          prevDone = !!todo.done;
          return {...todo, done: !todo.done};
        }),
      );

      try {
        // ✅ 2) 서버 토글 (POST /api/todos/{todoId}/completion)
        await onToggleTodoCompletion?.(id);
      } catch (e) {
        // ✅ 3) 실패 시 롤백
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id ? {...todo, done: prevDone} : todo,
          ),
        );
        console.log("toggle completion failed:", e);
      }
    },
    [onToggleTodoCompletion],
  );

  const handleDeleteTodo = useCallback(
    async (todo) => {
      try {
        await onDeleteTodo?.(todo); // ✅ HomeScreen에서 반복 여부 판단 + 모달/삭제 처리
      } finally {
        closeAnySwipe(); // ✅ 삭제 후 스와이프 닫기
      }
    },
    [onDeleteTodo, closeAnySwipe],
  );

  const handleToggleSection = useCallback((categoryId) => {
    setOpenMap((prev) => ({...prev, [categoryId]: !prev?.[categoryId]}));
  }, []);

  const handlePressAddTodo = useCallback(
    (categoryId) => {
      onPressInput?.({id: null, title: "", categoryId, mode: "create"}); // ✅ 바텀시트 열기 + 카테고리 힌트 전달(원하면 사용)
    },
    [onPressInput],
  );

  const handleDragEnd = useCallback(
    async (categoryId, data) => {
      // ✅ 1) 로컬 상태 먼저 반영(optimistic)
      setTodos((prev) => {
        const others = prev.filter((t) => t.categoryId !== categoryId);
        return [...others, ...data.map((x) => ({...x, categoryId}))];
      });

      // ✅ 2) 서버에 순서 저장 (해당 날짜 전체 ids 순서)
      // 서버 스펙: { ids: [3,1,2] } (Number 배열) :contentReference[oaicite:5]{index=5}
      // ⚠️ "날짜 전체"의 순서를 저장하는 API라서,
      // category 섹션 하나만의 data가 아니라 "현재 화면 전체 todos"를 기준으로 ids를 만들어야 안전함.

      // 로컬 반영된 최신 배열을 즉시 얻기 어렵기 때문에,
      // "data(해당 카테고리)"   "기타 todos"로 새 전체 배열을 구성해서 ids를 만들자.
      const nextAll = (() => {
        // 현재 todos 상태를 기반으로 계산해야 하므로, data로 섹션만 교체한 결과를 만들기
        const current = Array.isArray(todos) ? todos : [];
        const others = current.filter((t) => t.categoryId !== categoryId);
        const updatedSection = data.map((x) => ({...x, categoryId}));
        // ✅ 기존 구현이 others 뒤에 섹션을 붙였는데, 이러면 카테고리별 섞일 수 있음.
        // "전체 order"를 서버에 저장하려면, 원래 화면에 보이는 순서 정책을 정해야 함.
        // 현재 화면은 category별로 분리되어 보이므로,
        // ✅ 서버 ids는 "카테고리 순서대로, 각 카테고리 내부 순서대로"로 만드는 게 일반적.
        // 따라서 categories 순서를 기준으로 그룹을 다시 합친다.
        const by = {};
        for (const t of [...others, ...updatedSection]) {
          if (!by[t.categoryId]) by[t.categoryId] = [];
          by[t.categoryId].push(t);
        }
        const merged = [];
        for (const c of categories) {
          const list = by[c.categoryId] ?? [];
          merged.push(...list);
        }
        return merged;
      })();

      const ids = nextAll
        .map((t) => Number(t.id))
        .filter((n) => Number.isFinite(n));

      try {
        await onReorderTodos?.({ids});
      } catch (e) {
        console.log("reorder todos failed:", e);
        // 실패 시 invalidate로 서버 데이터 다시 끌어오게 두는 전략이면 여기서 롤백 생략 가능
      }
    },
    [onReorderTodos, todos, categories],
  );

  const renderSection = (category) => {
    const isOpen = !!openMap?.[category.categoryId];
    const sectionTodos = grouped?.[category.categoryId] ?? [];
    const color = category.color ?? colors.or;

    return (
      <View key={category.categoryId} style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleToggleSection(category.categoryId)}
            style={[styles.categoryChip, {backgroundColor: color}]}
          >
            <AppText variant="M600" style={{color: colors.wt}}>
              {category.label}
            </AppText>
            <View style={{width: 4}} />
            <Chevron isOpen={isOpen} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handlePressAddTodo(category.categoryId)}
            style={styles.addTodoButton}
          >
            <View style={styles.addTodoContent}>
              <AppText variant="M600" style={{color}}>
                새 투두 튀기기
              </AppText>
              <PlusIcon width={14} height={14} color={color} />
            </View>
          </TouchableOpacity>
        </View>

        {isOpen && (
          <View style={styles.listArea}>
            <DraggableFlatList
              data={sectionTodos}
              keyExtractor={(item) => item.id}
              onDragEnd={({data}) => handleDragEnd(category.categoryId, data)}
              ItemSeparatorComponent={() => <View style={{height: 8}} />}
              renderItem={({item, drag, isActive}) => (
                <TodoItem
                  item={item}
                  isActive={isActive}
                  isOpen={swipedTodoId === item.id}
                  onToggleDone={toggleTodoDone}
                  onDelete={handleDeleteTodo}
                  onDoToday={handleDoToday}
                  onDoTomorrow={handleDoTomorrow}
                  isViewingToday={isViewingToday}
                  onSwipeOpen={(id) => setSwipedTodoId(id)}
                  onSwipeClose={(id) =>
                    setSwipedTodoId((prev) => (prev === id ? null : prev))
                  }
                  onLongPressDrag={drag}
                  onPressItem={(todo) =>
                    onPressInput?.({...todo, mode: "edit"})
                  } // ✅ 추가
                />
              )}
              scrollEnabled={false} // ✅ 섹션 안에서 스크롤 안 하고, Home 전체 스크롤로(원하면 부모에 ScrollView)
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.todoSection}>{categories.map(renderSection)}</View>

      <View style={styles.dashedDivider} />

      {categories.length < 6 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("Category", {
              screen: "CategEdit",
            })
          }
          style={styles.newCategoryButton}
        >
          <AppText variant="M600" style={{color: "#FF5B22"}}>
            새 카테고리 +
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    // borderWidth: 1,
  },
  // contentContainer: {
  //   paddingBottom: 36, // ✅ 스크롤 끝에서 버튼/여백 확보
  // },
  todoSection: {
    gap: 24,
    // borderWidth: 1,
  },
  section: {
    // paddingTop: 14,
    // borderWidth: 1,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingHorizontal: 2,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  addTodoButton: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  addTodoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // 텍스트와   아이콘 간격
  },

  listArea: {
    marginTop: 10,
    // paddingHorizontal: 4,
    // borderWidth: 1,
  },

  dashedDivider: {
    // marginTop: 14,
    marginVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
    borderStyle: "dashed",
  },

  newCategoryButton: {
    // marginTop: 22,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FF5B22",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  /** TodoItem styles */
  todoRowWrapper: {
    height: 36,
    justifyContent: "center",
    // borderWidth: 1,
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    // paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.wt,
    // borderWidth: 1,
  },
  dragHandleButton: {
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  todoRadioHitArea: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  todoRightActionContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    // paddingRight: 6,
  },
  todoDeleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    // width: 56,
    // height: 44,
    // borderRadius: 14,
    backgroundColor: "#FF5B22",
    alignItems: "center",
    justifyContent: "center",
  },
  todoTodayButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FF5B22",
    alignItems: "center",
    justifyContent: "center",
  },
});
