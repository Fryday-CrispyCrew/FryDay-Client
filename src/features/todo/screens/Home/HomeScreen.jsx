// src/screens/Home/HomeScreen.jsx
import React, {useCallback, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AppText from "../../../../shared/components/AppText";
import TodayIcon from "../../assets/svg/Today.svg";
import CategoryIcon from "../../assets/svg/Category.svg";

import TodoCard from "../../components/TodoCard";

// ✅ bottom sheet 관련 import
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

const {width} = Dimensions.get("window");

export default function HomeScreen({navigation}) {
  const [editingTodo, setEditingTodo] = useState(null); // { id, title } or null
  const [editingText, setEditingText] = useState("");

  const bottomSheetRef = useRef(null);
  const inputRef = useRef(null); // ✅ 시트 안 TextInput ref

  // 얼마나 올라올지(높이) – %로 주면 화면에 따라 적당히 반응형
  const snapPoints = useMemo(() => ["20%"], []);

  const openEditor = useCallback((todo) => {
    setEditingTodo(todo);
    setEditingText(todo?.title ?? "");
    bottomSheetRef.current?.present();
  }, []);

  const closeEditor = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setEditingTodo(null);
    setEditingText("");
  }, []);

  const handleSubmit = useCallback(() => {
    if (!editingTodo && editingText.trim().length === 0) {
      closeEditor();
      return;
    }

    // TODO: 여기서 실제 todos 상태 업데이트 / 추가
    // ex) addTodo(editingText) or updateTodo(editingTodo.id, editingText);

    closeEditor();
  }, [editingTodo, editingText, closeEditor]);

  // 회색 배경 오버레이
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0} // 첫 스냅포인트에서 등장
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  // ✅ 시트가 열렸을 때 TextInput에 포커스 → 키보드 자동 표시
  const handleSheetChange = useCallback((index) => {
    if (index >= 0) {
      // 약간의 딜레이를 주면 안드로이드에서 더 안정적
      setTimeout(
        () => {
          inputRef.current?.focus();
        },
        Platform.OS === "android" ? 50 : 0
      );
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} mode={"margin"}>
      <StatusBar barStyle="dark-content" />

      {/* topBar: 날짜 + 우측 SVG 아이콘들 */}
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
            onPress={() => {}}
          >
            <TodayIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.iconButton}
            onPress={() => {}}
          >
            <CategoryIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 새우 일러스트 + 배경 */}
      <View style={styles.illustrationWrapper}>
        <View style={styles.sunburst} />
        <View style={styles.shrimp}>
          <Text style={{fontSize: 32}}>🦐</Text>
        </View>
      </View>

      {/* ✅ TodoCard에서 인풋 누르면 openEditor 호출 */}
      <TodoCard navigation={navigation} onPressInput={openEditor} />

      {/* ✅ @gorhom/bottom-sheet 기반 입력 시트 */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive" // 키보드와 같이 올라가게
        keyboardBlurBehavior="restore"
        backgroundStyle={{backgroundColor: "#F7F7F7"}}
        handleIndicatorStyle={{backgroundColor: "#D0D0D0", width: "38.4%"}}
        onChange={handleSheetChange} // ✅ 시트 상태 변경 감지
      >
        <BottomSheetView>
          {/* 안쪽 내용: 스샷처럼 상단 핸들 + 카테고리 + 인풋 */}
          <View style={sheetStyles.container}>
            {/* 상단 핸들은 라이브러리가 자동으로 만들어줘서 추가 UI는 생략 가능 */}

            {/* 카테고리 칩 */}
            <View style={sheetStyles.categoryRow}>
              <View style={sheetStyles.categoryChip}>
                <Text style={sheetStyles.categoryText}>카테고리</Text>
              </View>
            </View>

            {/* 인풋 + 전송 버튼 */}
            <View style={sheetStyles.inputRow}>
              <View style={sheetStyles.inputWrapper}>
                {/* ✅ BottomSheetTextInput을 쓰면 키보드 대응이 더 매끄러움 */}
                <BottomSheetTextInput
                  ref={inputRef} // ✅ ref 연결
                  value={editingText}
                  onChangeText={setEditingText}
                  placeholder="두근두근, 무엇을 튀겨볼까요?"
                  placeholderTextColor="#C6C6C6"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  style={sheetStyles.input}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSubmit}
                style={sheetStyles.submitButton}
              >
                {/* 오른쪽 동그라미 버튼 – 나중에 아이콘 교체 가능 */}
                <Text style={sheetStyles.submitIcon}>➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

// Provider로 감싸기 (앱 전체에서 이미 감싸고 있다면 이 컴포넌트는 필요 X)
// export default function HomeScreen(props) {
//   return (
//     <BottomSheetModalProvider>
//       <HomeScreenInner {...props} />
//     </BottomSheetModalProvider>
//   );
// }

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
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
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
