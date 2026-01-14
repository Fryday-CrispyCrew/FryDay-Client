import React, {useMemo, useEffect} from "react";
import {View, Image, TouchableOpacity, useWindowDimensions} from "react-native";
import AppText from "../../../../shared/components/AppText";
import {SafeAreaView} from "react-native-safe-area-context";

import {kakaoGetAccessToken} from "../../lib/kakao";
import {naverGetAccessToken} from "../../lib/naver";
import {loginWithAccessToken} from "../../api/socialLogin";
import KakaoLogins from "@react-native-seoul/kakao-login";

const LOGGED_IN_KEY = "hasLoggedIn";
const STEP_KEY = "onboardingStep";

export default function LoginScreen({navigation}) {
  const {width, height} = useWindowDimensions();
  const iconSize = useMemo(
    () => Math.max(48, Math.min(56, width * 0.14)),
    [width]
  );

  // const login = async () => {
  //     const hasLoggedIn = await AsyncStorage.getItem(LOGGED_IN_KEY);
  //
  //     // 기존 유저
  //     if (hasLoggedIn === "true") {
  //         navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  //         return;
  //     }
  //
  //     // 최초 진입자
  //     await AsyncStorage.setItem(LOGGED_IN_KEY, "true");
  //     await AsyncStorage.setItem(STEP_KEY, "NEEDS_NICKNAME");
  //     navigation.reset({ index: 0, routes: [{ name: "Naming" }] });
  // };
  const onPressKakao = async () => {
    try {
      const token = await kakaoGetAccessToken();
      await loginWithAccessToken("KAKAO", token, navigation);
    } catch (e) {
      console.log("ERR status", e?.response?.status);
      console.log("ERR data", e?.response?.data);
      console.log("ERR headers", e?.response?.headers);
      console.log("ERR message", e?.message);
    }
  };

  const onPressNaver = async () => {
    try {
      const token = await naverGetAccessToken();
      console.log("NAVER token =", token);
      await loginWithAccessToken("NAVER", token, navigation);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-or">
      <Image
        source={require("../../assets/png/login-bg.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          alignSelf: "center",
        }}
        resizeMode="contain"
      />

      <View className="flex-1 px-5">
        <View
          className="flex-[6] items-center justify-center"
          style={{transform: [{translateY: height * 0.07}]}}
        >
          <Image
            source={require("../../assets/png/login-logo.png")}
            style={{width: "100%", maxWidth: 420, aspectRatio: 410 / 350}}
            resizeMode="contain"
          />
        </View>

        <View
          className="flex-[4] justify-start"
          style={{paddingTop: Math.max(8, height * 0.02)}}
        >
          <View
            className="flex-row items-center justify-center mb-6 self-center"
            style={{width: Math.min(240, width * 0.62)}}
          >
            <View className="flex-1 h-[1px] bg-wt/25" />
            <AppText variant="M500" className="text-wt/75 mx-4">
              간편하게 시작하기
            </AppText>
            <View className="flex-1 h-[1px] bg-wt/25" />
          </View>

          <View
            className="flex-row justify-center"
            style={{columnGap: Math.min(32, width * 0.07), marginBottom: 18}}
          >
            {[
              {
                label: "카카오",
                img: require("../../assets/png/login-kakao.png"),
                onPress: onPressKakao,
              },
              {
                label: "네이버",
                img: require("../../assets/png/login-naver.png"),
                onPress: onPressNaver,
              },
              {
                label: "Apple",
                img: require("../../assets/png/login-apple.png"),
                onPress: () => {},
              },
            ].map((it) => (
              <View key={it.label} className="items-center">
                <TouchableOpacity activeOpacity={0.8} onPress={it.onPress}>
                  <Image
                    source={it.img}
                    style={{width: iconSize, height: iconSize}}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <AppText variant="M500" className="text-wt mt-2">
                  {it.label}
                </AppText>
              </View>
            ))}
          </View>

          <AppText
            variant="S400"
            className="text-wt/75 text-center mt-4"
            style={{paddingHorizontal: 8}}
          >
            가입 시 프라이데이의{" "}
            <AppText
              variant="S400"
              style={{
                textDecorationLine: "underline",
                textDecorationColor: "rgba(250,250,250,0.75)",
              }}
            >
              이용 약관
            </AppText>
            과{" "}
            <AppText
              variant="S400"
              style={{
                textDecorationLine: "underline",
                textDecorationColor: "rgba(250,250,250,0.75)",
              }}
            >
              개인정보 이용
            </AppText>
            에 동의하게 돼요
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}
