// src/screens/Home/HomeScreen.jsx
import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
// import {Swipeable} from "react-native-gesture-handler";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
// import {PanGestureHandler} from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";
import {SafeAreaView} from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  // useAnimatedGestureHandler,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import AppText from "../../../../shared/components/AppText";
import {moderateScale} from "react-native-size-matters";
import TodayIcon from "../../assets/svg/Today.svg";
import CategoryIcon from "../../assets/svg/Category.svg";
import TodoRadioOnIcon from "../../assets/svg/RadioOn.svg";
import TodoRadioOffIcon from "../../assets/svg/RadioOff.svg";
import DragHandleIcon from "../../assets/svg/DragHandle.svg";
import DeleteIcon from "../../assets/svg/Delete.svg"; // 실제 경로/파일명에 맞게 수정

const {width} = Dimensions.get("window");

// 카테고리 탭 목록 (라디오 버튼용)
const TAB_CATEGORIES = [
  {categoryId: 0, label: "전체보기"}, // 0은 "전체" 용
  {categoryId: 1, label: "운동하기"},
  {categoryId: 2, label: "공부하기"},
  {categoryId: 3, label: "완전놀기"},
];

const MOCK_TODOS = [
  {
    id: "1",
    title: "헬스하기",
    done: false,
    categoryId: 1, // 1번 카테고리
  },
  {
    id: "2",
    title: "런닝 뛰기",
    done: false,
    categoryId: 1,
  },
  {
    id: "3",
    title: "필라테스하기",
    done: false,
    categoryId: 1,
  },
  {
    id: "4",
    title: "토익 공부",
    done: true,
    categoryId: 2, // 2번 카테고리
  },
  {
    id: "5",
    title: "알고리즘 공부",
    done: true,
    categoryId: 2,
  },
  {
    id: "6",
    title: "김종혁 엉덩이 30분동안 꼬집기",
    done: true,
    categoryId: 1,
  },
];

const SWIPE_OPEN_OFFSET = -72; // 최대 왼쪽 이동 거리(px)
const SWIPE_THRESHOLD = -36; // 이 이상 밀리면 열린 상태로 고정

function TodoItem({
  item,
  isActive,
  isOpen, // swipedTodoId === item.id
  onToggleDone,
  onDelete,
  onSwipeOpen,
  onSwipeClose,
  onLongPressDrag,
}) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  // isOpen 상태 바뀔 때, 위치 애니메이션으로 동기화
  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(SWIPE_OPEN_OFFSET, {duration: 180});
    } else {
      translateX.value = withTiming(0, {duration: 180});
    }
  }, [isOpen, translateX]);

  // 🔥 Reanimated v3 + Gesture API
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      let next = startX.value + event.translationX;

      if (next > 0) next = 0; // 오른쪽으로는 못 밀게
      if (next < SWIPE_OPEN_OFFSET) next = SWIPE_OPEN_OFFSET; // 너무 많이 왼쪽 X

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

export default function HomeScreen({navigation}) {
  // 투두 목록 상태
  const [todos, setTodos] = useState(MOCK_TODOS);
  // 선택된 탭의 categoryId (0 = 전체보기)
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [swipedTodoId, setSwipedTodoId] = useState(null);
  // 🔹 현재 열린 Swipeable들의 ref를 저장하는 Map
  // const swipeableRefs = useRef(new Map());

  // 선택된 탭에 맞는 투두만 필터링
  const filteredTodos =
    selectedCategoryId === 0
      ? todos
      : todos.filter((todo) => todo.categoryId === selectedCategoryId);

  const toggleTodoDone = (id) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? {...todo, done: !todo.done} : todo))
    );
  };

  // ✅ 드래그 종료 후 순서 저장
  const handleDragEnd = ({data}) => {
    // data = 드래그 후 정렬된 "현재 화면에 보이는 리스트(filteredTodos)" 순서

    // 전체보기일 때는 todos 전체 순서 변경
    if (selectedCategoryId === 0) {
      setTodos(data);
      return;
    }

    // 특정 카테고리 선택 시: 그 카테고리에 속한 투두만 재정렬
    setTodos((prev) => {
      const others = prev.filter(
        (todo) => todo.categoryId !== selectedCategoryId
      );
      // data 안의 todo들은 모두 현재 선택된 categoryId를 가진 것들
      return [...others, ...data];
    });
  };

  const handleDeleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // const renderRightActions = (itemId) => {
  //   return (
  //     <View style={styles.todoRightActionContainer}>
  //       <TouchableOpacity
  //         style={styles.todoDeleteButton}
  //         activeOpacity={0.7}
  //         onPress={() => handleDeleteTodo(itemId)}
  //       >
  //         <DeleteIcon width={20} height={20} />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  const renderTodo = ({item, drag, isActive}) => {
    return (
      <TodoItem
        item={item}
        isActive={isActive}
        isOpen={swipedTodoId === item.id}
        onToggleDone={toggleTodoDone}
        onDelete={handleDeleteTodo}
        onSwipeOpen={(id) => setSwipedTodoId(id)} // 새 아이템 열림
        onSwipeClose={(id) =>
          setSwipedTodoId((prev) => (prev === id ? null : prev))
        } // 닫힘
        onLongPressDrag={drag}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} mode={"margin"}>
      <StatusBar barStyle="dark-content" />
      {/* ✅ topBar: 날짜 + 우측 SVG 아이콘들 */}
      <View style={styles.topBar}>
        <View>
          <AppText variant="M500" className="text-gr500">
            2025년
          </AppText>
          <AppText variant="H3" className="text-bk">
            10월 28일
          </AppText>
        </View>

        <View style={styles.iconRow}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.iconButton}
            onPress={() => {
              // TODO: 텍스트 필터 눌렀을 때 동작
            }}
          >
            {/* SVG 아이콘 사용 */}
            <TodayIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.iconButton}
            onPress={() => {
              // TODO: 태그 필터 눌렀을 때 동작
            }}
          >
            <CategoryIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* <View style={styles.dateContainer}>
        <AppText variant="M500" className="text-gr500">
          2025년
        </AppText>
        <AppText variant="H3" className="text-bk">
          10월 28일
        </AppText>
      </View> */}

      {/* 새우 일러스트 + 배경 */}
      <View style={styles.illustrationWrapper}>
        <View style={styles.sunburst} />
        <View style={styles.shrimp}>
          <Text style={{fontSize: 32}}>🦐</Text>
        </View>
      </View>

      {/* To-do 카드 영역 */}
      <View style={styles.card}>
        <View style={styles.topContainer}>
          {/* 카테고리 탭 영역 */}
          <View style={styles.tabRow}>
            {/* 왼쪽 70%: 가로 스크롤 탭들 */}
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
              onPress={() => navigation.navigate("CategoryCreate")} // 라우트 이름은 실제 사용하는 이름으로
            >
              <AppText variant="M600" className="text-gr300">
                ＋ 새 카테고리
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.flatListContainer}>
            {/* 할 일 리스트 */}
            <DraggableFlatList
              data={filteredTodos}
              keyExtractor={(item) => item.id}
              renderItem={renderTodo}
              onDragEnd={handleDragEnd} // ✅ 드래그 끝난 후 상태 저장
              style={{flexGrow: 1}}
              ItemSeparatorComponent={() => <View style={{height: 6}} />}
            />
          </View>
        </View>

        {/* 입력창 */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="두근두근, 무엇을 튀겨볼까요?"
            placeholderTextColor="#B0B0B0"
            className="text-gr500"
            style={styles.textInput}
            underlineColorAndroid="transparent" // ✅ 안드로이드 기본 밑줄 제거
          />
          <View className="bg-gr200" style={styles.inputLine}></View>
        </View>
      </View>
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
  yearText: {
    fontSize: 14,
    color: "#9B9B9B",
    marginBottom: 4,
  },
  dateText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    // fontWeight: "700",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    // width: 32,
    // height: 32,
    borderRadius: 10,
    // borderWidth: 1,
    // borderColor: "#D7D7D7",
    // backgroundColor: "#cececeff",
    alignItems: "center",
    justifyContent: "center",
  },

  /* 일러스트 */
  illustrationWrapper: {
    height: "42%",
    alignItems: "center",
    justifyContent: "center",
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

  /* 카드 */
  card: {
    // flex: 1,
    justifyContent: "space-between",
    // borderWidth: 1,
    height: "44%",
    // marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    // paddingHorizontal: "6%",
    // paddingTop: "5.5%",
    // paddingBottom: "4.1%",
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 15,
    // shadowColor: "#000",
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.05,
    // shadowRadius: 20,
    // elevation: 4,
    shadowColor: "rgba(20, 19, 18, 0.2)",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 12, // spread는 없음 (RN 미지원)
    elevation: 4, // Android 그림자 강도 조절
  },
  // box-shadow: 0 0 12px 0 rgba(20, 19, 18, 0.05);

  topContainer: {
    // height: "79.5%",
    flex: 1,
    justifyContent: "space-between",
    gap: "5%",
    // borderWidth: 1,
  },
  /* 탭 */
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    height: "18.3%",
    // marginBottom: 16,
    // overflow: "hidden",
    gap: 8,
    // borderWidth: 1,
  },
  tabScroll: {
    width: "70%", // ✅ 전체 줄의 70% 차지
  },
  tabScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // 탭 간 간격
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    // height: "100%",
    borderRadius: 999,
    backgroundColor: "#F5F5F5",
    // marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#FF5B22",
  },
  tabNew: {
    // marginLeft: "auto", // 오른쪽 끝으로 밀기
    paddingHorizontal: 3,
    paddingVertical: 8,
    // borderRadius: 999,
    backgroundColor: "transparent",
    // borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  flatListContainer: {
    // height: "70%",
    flex: 1,
    overflow: "hidden",
    // borderWidth: 1,
  },
  todoRowWrapper: {
    height: 36,
    justifyContent: "center",
  },

  /* To-do 리스트 */
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    // height: "17.1%",
    height: 36,
    // borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
    // paddingVertical: "1.8%",
    borderRadius: 16,
    // backgroundColor: "transparent",
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
    // backgroundColor: "#FF5B22",
  },
  // 투두용 라디오 버튼
  // todoRadioOuter: {
  //   width: 24,
  //   height: 24,
  //   borderRadius: 12,
  //   borderWidth: 2,
  //   borderColor: "#E0E0E0",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginLeft: 4,
  // },
  // todoRadioOuterActive: {
  //   borderColor: "#FF6A00",
  // },
  // todoRadioInner: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 6,
  //   backgroundColor: "#FF6A00",
  // },
  // todoRightActionContainer: {
  //   justifyContent: "center",
  //   alignItems: "flex-end",
  //   marginLeft: 8,
  // },
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
    // width: 40,
    // height: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // borderTopRightRadius: 16,
    // borderBottomRightRadius: 16,
    borderRadius: 12,
    backgroundColor: "#FF5B22",
    alignItems: "center",
    justifyContent: "center",
  },
  /* 입력 */
  inputWrapper: {
    // 전체 영역은 너무 크지 않게 높이 고정
    height: "18.9%",
    justifyContent: "center",

    // 밑줄 스타일
    // borderBottomWidth: 1,
    // borderBottomColor: "#E0E0E0",

    // 필요하면 살짝 아래 여백
    // paddingBottom: 4,
    // borderWidth: 1,
  },
  textInput: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    // height: "100%",

    // 박스 스타일 제거
    backgroundColor: "transparent",
    borderRadius: 0,
    // borderWidth: 1,
    // borderBottomWidth: 1,
    // borderBottomColor: "#E0E0E0",
    paddingHorizontal: 0,
  },
  inputLine: {
    position: "relative",
    width: "100%",
    height: 1,
    // backgroundColor: "#E0E0E0",
  },
});
