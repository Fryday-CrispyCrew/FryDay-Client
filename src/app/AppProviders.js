// src/app/AppProviders.js
import React, {useEffect} from "react";
import {AppState} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import {NavigationContainer} from "@react-navigation/native";
import {
  QueryClientProvider,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";
import {queryClient} from "../shared/lib/queryClient";
import {useFonts} from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function AppProviders({children}) {
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("../shared/assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("../shared/assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../shared/assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../shared/assets/fonts/Pretendard-Bold.otf"),
  });

  useEffect(() => {
    // 네트워크 상태 변화 감지
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      onlineManager.setOnline(Boolean(state.isConnected));
    });

    // 앱 포커스 상태 감지 (백그라운드 → 포그라운드)
    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });

    return () => {
      unsubscribeNet && unsubscribeNet();
      subscription && subscription.remove();
    };
  }, []);

  // ✅ 폰트가 다 로딩되면 네이티브 스플래시 숨기기
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* ⭐ 제일 바깥 */}
      <SafeAreaProvider>
        {/* ⭐ SafeArea 컨텍스트 */}
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>{children}</NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
