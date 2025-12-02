// src/screens/Home/components/TodoCard.jsx
import React, {useState} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import AppText from "../../../shared/components/AppText";
import TodoRadioOnIcon from "../assets/svg/RadioOn.svg";
import TodoRadioOffIcon from "../assets/svg/RadioOff.svg";
import DragHandleIcon from "../assets/svg/DragHandle.svg";
import DeleteIcon from "../assets/svg/Delete.svg";

const {width} = Dimensions.get("window");

// 카테고리 탭 목록
const TAB_CATEGORIES = [
  {categoryId: 0, label: "전체보기"}, // 0은 "전체" 용
  {categoryId: 1, label: "운동하기"},
  {categoryId: 2, label: "공부하기"},
  {categoryId: 3, label: "완전놀기"},
];

// 목업 투두
const MOCK_TODOS = [
  {id: "1", title: "헬스하기", done: false, categoryId: 1},
  {id: "2", title: "런닝 뛰기", done: false, categoryId: 1},
  {id: "3", title: "필라테스하기", done: false, categoryId: 1},
  {id: "4", title: "토익 공부", done: true, categoryId: 2},
  {id: "5", title: "알고리즘 공부", done: true, categoryId: 2},
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
    if (isOpen) {
      translateX.value = withTiming(SWIPE_OPEN_OFFSET, {duration: 180});
    } else {
      translateX.value = withTiming(0, {duration: 180});
    }
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

      {/* 앞에서 좌우로 움직이는 투두 카드 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.todoRow,
            isActive && {backgroundColor: "#EAEAEA"},
            isOpen && {backgroundColor: "#EAEAEA", borderRadius: 12},
            animatedRowStyle,
          ]}
        >
          {/* 드래그 핸들 */}
          <TouchableOpacity
            onLongPress={onLongPressDrag}
            hitSlop={8}
            style={styles.dragHandleButton}
          >
            <DragHandleIcon width={12} />
          </TouchableOpacity>

          {/* 텍스트 */}
          <AppText variant="M500" className="text-bk" style={{flex: 1}}>
            {item.title}
          </AppText>

          {/* 완료 라디오 버튼 */}
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

// ✅ onPressInput 추가
export default function TodoCard({navigation, onPressInput}) {
  const [todos, setTodos] = useState(MOCK_TODOS);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [swipedTodoId, setSwipedTodoId] = useState(null);

  const filteredTodos =
    selectedCategoryId === 0
      ? todos
      : todos.filter((todo) => todo.categoryId === selectedCategoryId);

  const toggleTodoDone = (id) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? {...todo, done: !todo.done} : todo))
    );
  };

  const handleDragEnd = ({data}) => {
    if (selectedCategoryId === 0) {
      setTodos(data);
      return;
    }
    setTodos((prev) => {
      const others = prev.filter(
        (todo) => todo.categoryId !== selectedCategoryId
      );
      return [...others, ...data];
    });
  };

  const handleDeleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const renderTodo = ({item, drag, isActive}) => {
    return (
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
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.topContainer}>
        {/* 탭 영역 */}
        <View style={styles.tabRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabScrollContent}
          >
            {TAB_CATEGORIES.map((tab) => {
              const isActive = tab.categoryId === selectedCategoryId;
              return (
                <TouchableOpacity
                  key={tab.categoryId}
                  style={[styles.tab, isActive && styles.tabActive]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategoryId(tab.categoryId)}
                >
                  <AppText
                    variant="M600"
                    className={isActive ? "text-wt" : "text-gr300"}
                  >
                    {tab.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 오른쪽: ＋ 새 카테고리 버튼 */}
          <TouchableOpacity
            style={styles.tabNew}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("CategoryCreate")}
          >
            <AppText variant="M600" className="text-gr300">
              ＋ 새 카테고리
            </AppText>
          </TouchableOpacity>
        </View>

        {/* 투두 리스트 */}
        <View style={styles.flatListContainer}>
          <DraggableFlatList
            data={filteredTodos}
            keyExtractor={(item) => item.id}
            renderItem={renderTodo}
            onDragEnd={handleDragEnd}
            style={{flexGrow: 1}}
            ItemSeparatorComponent={() => <View style={{height: 6}} />}
          />
        </View>
      </View>

      {/* ✅ 인풋: 지금은 눌렀을 때 편집 시트만 열도록 변경 */}
      <View style={styles.inputWrapper}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (onPressInput) {
              // 새 투두 추가용이라면 id는 null로 넘겨도 됨
              onPressInput({id: null, title: ""});
            }
          }}
        >
          <TextInput
            placeholder="두근두근, 무엇을 튀겨볼까요?"
            placeholderTextColor="#B0B0B0"
            className="text-gr500"
            style={styles.textInput}
            underlineColorAndroid="transparent"
            editable={false} // ✅ 카드 안에서는 직접 입력 못 하게
          />
          <View className="bg-gr200" style={styles.inputLine} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* 카드 */
  card: {
    justifyContent: "space-between",
    height: "44%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 15,
    shadowColor: "rgba(20, 19, 18, 0.2)",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  topContainer: {
    flex: 1,
    justifyContent: "space-between",
    gap: "5%",
  },
  /* 탭 */
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    height: "18.3%",
    gap: 8,
  },
  tabScroll: {
    width: "70%",
  },
  tabScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F5F5F5",
  },
  tabActive: {
    backgroundColor: "#FF5B22",
  },
  tabNew: {
    paddingHorizontal: 3,
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderColor: "#F0F0F0",
  },
  flatListContainer: {
    flex: 1,
    overflow: "hidden",
  },

  /* 투두 */
  todoRowWrapper: {
    height: 36,
    justifyContent: "center",
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  dragHandleButton: {
    paddingHorizontal: 4,
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

  /* 입력 */
  inputWrapper: {
    height: "18.9%",
    justifyContent: "center",
  },
  textInput: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  inputLine: {
    position: "relative",
    width: "100%",
    height: 1,
  },
});
