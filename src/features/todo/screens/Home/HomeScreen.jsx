// src/screens/Home/HomeScreen.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AppText from "../../../../shared/components/AppText";
import TodayIcon from "../../assets/svg/Today.svg";
import CategoryIcon from "../../assets/svg/Category.svg";

import TodoCard from "../../components/TodoCard"; // ✅ 새로 추가

const {width} = Dimensions.get("window");

export default function HomeScreen({navigation}) {
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

      {/* 분리된 카드 컴포넌트 */}
      <TodoCard navigation={navigation} />
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
