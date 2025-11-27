// src/screens/Home/HomeScreen.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  StatusBar,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AppText from "../../../../shared/components/AppText";

const {width} = Dimensions.get("window");

const MOCK_TODOS = [
  {id: "1", title: "연우님 기획 차력쇼 감상", done: false},
  {id: "2", title: "연우님 기획 차력쇼 감상", done: false},
  {id: "3", title: "연우님 기획 차력쇼 감상", done: true, isEditing: true},
  {id: "4", title: "연우님 기획 차력쇼 감상", done: true},
];

export default function HomeScreen() {
  const renderTodo = ({item}) => {
    const isEditing = item.isEditing;

    return (
      <View style={[styles.todoRow, isEditing && styles.todoRowEditing]}>
        {/* 드래그 핸들 */}
        <View style={styles.dragHandle}>
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
        </View>

        {/* 텍스트 */}
        <Text style={styles.todoText}>{item.title}</Text>

        {/* 체크 or 편집 모드 */}
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.checkFilled}>
              <Text style={styles.checkText}>✓</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.checkBox, item.done && styles.checkFilled]}
          >
            {item.done && <Text style={styles.checkText}>✓</Text>}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} mode={"margin"}>
      <StatusBar barStyle="dark-content" />
      {/* 상단 날짜만 유지 */}
      <View style={styles.dateContainer}>
        <AppText
          variant="L400"
          className="text-gr500"
          // className="font-pretendard"
          // style={{color: "green"}}
        >
          2025년
        </AppText>
        <AppText variant="L600">10월 28일</AppText>
        {/* <Text style={styles.yearText}>2025년</Text> */}
        {/* <Text style={styles.dateText}>10월 28일</Text> */}
      </View>

      {/* 새우 일러스트 + 배경 */}
      <View style={styles.illustrationWrapper}>
        <View style={styles.sunburst} />
        <View style={styles.shrimp}>
          <Text style={{fontSize: 32}}>🦐</Text>
        </View>
      </View>

      {/* To-do 카드 영역 */}
      <View style={styles.card}>
        {/* 카테고리 탭 */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabActiveText}>전체보기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>카테고리</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>카테고리</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabNew}>
            <Text style={styles.tabNewText}>＋ 새 카테고리</Text>
          </TouchableOpacity>
        </View>

        {/* 할 일 리스트 */}
        <FlatList
          data={MOCK_TODOS}
          keyExtractor={(item) => item.id}
          renderItem={renderTodo}
          style={{flexGrow: 0}}
          ItemSeparatorComponent={() => <View style={{height: 8}} />}
        />

        {/* 입력창 */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="두근두근, 무엇을 튀겨볼까요?"
            placeholderTextColor="#B0B0B0"
            style={styles.textInput}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF7F2",
    paddingHorizontal: "5%",
  },
  /* 날짜 영역 */
  dateContainer: {
    height: "11%",
    justifyContent: "center",
    // paddingHorizontal: 24,
    // borderWidth:1,
  },
  yearText: {
    fontSize: 12,
    color: "#9B9B9B",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
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
    borderWidth: 1,
    height: "44%",
    // marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: "6%",
    paddingVertical: "4%",
    paddingTop: 12,
    paddingBottom: 24,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },

  /* 탭 */
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#FF6A00",
  },
  tabText: {
    fontSize: 14,
    color: "#C4C4C4",
    fontWeight: "600",
  },
  tabActiveText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  tabNew: {
    marginLeft: "auto",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F7F7F7",
  },
  tabNewText: {
    fontSize: 14,
    color: "#D0D0D0",
    fontWeight: "600",
  },

  /* To-do 리스트 */
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 16,
  },
  todoRowEditing: {
    backgroundColor: "#F4F4F4",
  },
  dragHandle: {
    width: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  dragDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#B6B6B6",
    marginVertical: 1,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    fontFamily: "Pretendard-Bold",
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  checkFilled: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderColor: "#FF6A00",
  },
  checkText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  deleteIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },

  /* 입력 */
  inputWrapper: {
    marginTop: 16,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    fontSize: 15,
  },
});
