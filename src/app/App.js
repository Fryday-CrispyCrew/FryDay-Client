import React from "react";
import * as SplashScreen from "expo-splash-screen";
import "react-native-gesture-handler";
import { Text, TextInput, Platform } from "react-native";
import "../../global.css";
import AppProviders from "./AppProviders";
import RootNavigator from "./navigation/RootNavigator";

// 전 플랫폼 전역 폰트 스케일 차단
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

// 스플래시가 자동으로 사라지지 않게 설정
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
    return (
        <AppProviders>
            <RootNavigator />
        </AppProviders>
    );
}
