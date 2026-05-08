import React from "react";
import { View, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "../components/AppText";

export default function ServerMaintenanceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 items-center justify-center px-5">
        <Image
          source={require("../assets/png/Error.png")}
          style={{
            width: 260,
            height: 260,
            marginBottom: 24,
          }}
          resizeMode="contain"
        />

        <AppText variant="M500" className="text-center text-gr500">
          서버 점검 중이에요.{"\n"}
          바삭한 모습으로 다시 만나요!
        </AppText>
      </View>
    </SafeAreaView>
  );
}