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

export default function AppProviders({children}) {
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

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );
}
