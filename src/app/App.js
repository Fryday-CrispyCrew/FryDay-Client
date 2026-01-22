// src/app/App.js
import React, {useEffect} from "react";
import * as SplashScreen from "expo-splash-screen";
import "react-native-gesture-handler";
import "../../global.css";
import AppProviders from "./AppProviders";
import RootNavigator from "./navigation/RootNavigator";

// 스플래시가 자동으로 사라지지 않게 설정
SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 호출된 경우 등의 에러는 무시해도 됨
});

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
