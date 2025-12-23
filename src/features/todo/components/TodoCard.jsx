// src/screens/Home/components/TodoCard.jsx
import React, {useMemo, useState, useCallback} from "react";
import {View, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import AppText from "../../../shared/components/AppText";
import DragHandleIcon from "../assets/svg/DragHandle.svg";
import DeleteIcon from "../assets/svg/Delete.svg";
import TodoRadioOnIcon from "../assets/svg/RadioOn.svg";
import TodoRadioOffIcon from "../assets/svg/RadioOff.svg";

import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

/** ✅ 목업 투두 (규칙: 현재는 mock) */
const MOCK_TODOS = [
  {id: "1", title: "연우님 기획 차력쇼 감상", done: false, categoryId: 1},
  {id: "2", title: "기찬님의 프로젝트 관리 전략", done: false, categoryId: 1},
  {id: "3", title: "토익 공부", done: true, categoryId: 2},
  {id: "4", title: "알고리즘 공부", done: true, categoryId: 2},
];

const SWIPE_OPEN_OFFSET = -72;
const SWIPE_THRESHOLD = -36;

function TodoItem({
  item,
  isActive,
  isOpen,
  onToggleDone,
  onDelete,
  onSwipeOpen,
  onSwipeClose,
  onLongPressDrag,
}) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withTiming(isOpen ? SWIPE_OPEN_OFFSET : 0, {
      duration: 180,
    });
  }, [isOpen, translateX]);

  const panGesture = Gesture.Pan()
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
          onPress={() => onDelete(item.id)}
        >
          <DeleteIcon width={20} height={20} />
        </TouchableOpacity>
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

          <AppText variant="M500" className="text-bk" style={{flex: 1}}>
            {item.title}
          </AppText>

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
    <AppText variant="M600" style={{color, fontSize: 16, lineHeight: 16}}>
      {isOpen ? "˄" : "˅"}
    </AppText>
  );
}

export default function TodoCard({navigation, onPressInput, categories = []}) {
  const [todos, setTodos] = useState(MOCK_TODOS);
  const [swipedTodoId, setSwipedTodoId] = useState(null);

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

  const toggleTodoDone = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? {...todo, done: !todo.done} : todo))
    );
  }, []);

  const handleDeleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const handleToggleSection = useCallback((categoryId) => {
    setOpenMap((prev) => ({...prev, [categoryId]: !prev?.[categoryId]}));
  }, []);

  const handlePressAddTodo = useCallback(
    (categoryId) => {
      onPressInput?.({id: null, title: "", categoryId}); // ✅ 바텀시트 열기 + 카테고리 힌트 전달(원하면 사용)
    },
    [onPressInput]
  );

  const handleDragEnd = useCallback((categoryId, data) => {
    setTodos((prev) => {
      const others = prev.filter((t) => t.categoryId !== categoryId);
      return [...others, ...data.map((x) => ({...x, categoryId}))];
    });
  }, []);

  const renderSection = (category) => {
    const isOpen = !!openMap?.[category.categoryId];
    const sectionTodos = grouped?.[category.categoryId] ?? [];
    const color = category.color ?? "#FF5B22";

    return (
      <View key={category.categoryId} style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleToggleSection(category.categoryId)}
            style={[styles.categoryChip, {backgroundColor: color}]}
          >
            <AppText variant="M600" style={{color: "#FFFFFF"}}>
              {category.label}
            </AppText>
            <View style={{width: 6}} />
            <Chevron isOpen={isOpen} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handlePressAddTodo(category.categoryId)}
            style={styles.addTodoButton}
          >
            <AppText variant="M600" style={{color}}>
              새 투두 튀기기 +
            </AppText>
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
                  onSwipeOpen={(id) => setSwipedTodoId(id)}
                  onSwipeClose={(id) =>
                    setSwipedTodoId((prev) => (prev === id ? null : prev))
                  }
                  onLongPressDrag={drag}
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.todoSection}>{categories.map(renderSection)}</View>

      <View style={styles.dashedDivider} />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation?.navigate?.("CategCreate")}
        style={styles.newCategoryButton}
      >
        <AppText variant="M600" style={{color: "#FF5B22"}}>
          새 카테고리 +
        </AppText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    // borderWidth: 1,
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 36, // ✅ 스크롤 끝에서 버튼/여백 확보
  },
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
    paddingHorizontal: 2,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  addTodoButton: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  listArea: {
    paddingTop: 10,
    paddingHorizontal: 4,
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
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    // paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
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
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 4,
  },
  todoDeleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FF5B22",
    alignItems: "center",
    justifyContent: "center",
  },
});
