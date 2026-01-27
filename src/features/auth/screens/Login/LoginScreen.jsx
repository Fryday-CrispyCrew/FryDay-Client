import React, { useMemo, useState } from "react";
import { View, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "../../../../shared/components/AppText";

import { kakaoGetAccessToken } from "../../lib/kakao";
import { naverGetAccessToken } from "../../lib/naver";
import { appleGetIdToken } from "../../lib/apple";

import { useCreateAppleLoginMutation } from "../../queries/socialLogin/useCreateAppleLoginMutation";
import { useCreateSocialLoginMutation } from "../../queries/socialLogin/useCreateSocialLoginMutation";
import { useCreateConsentMutation } from "../../queries/consent/useCreateConsentMutation";

function nextRoute(status) {
  switch (status) {
    case "NEEDS_AGREEMENT":
      return "Naming";
    case "NEEDS_NICKNAME":
      return "Naming";
    case "NEEDS_ONBOARDING":
      return "Onboarding";
    case "NEEDS_MARKETING":
      return "Marketing";
    case "COMPLETED":
      return "Main";
    default:
      return "Naming";
  }
}

export default function LoginScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const iconSize = useMemo(() => Math.max(48, Math.min(56, width * 0.14)), [width]);

  const { mutateAsync: createConsentAsync } = useCreateConsentMutation();

  const { mutateAsync: createSocialLogin } = useCreateSocialLoginMutation();
  const { mutateAsync: createAppleLogin } = useCreateAppleLoginMutation();

  const [loading, setLoading] = useState(false);

  const afterLogin = async (data) => {
    // console.log("[login] status:", data?.onboardingStatus, "nickname:", data?.nickname ?? data?.user?.nickname);
    //
    console.log("[login] raw", JSON.stringify(data, null, 2));
    let status = data?.onboardingStatus;

    if (status === "NEEDS_NICKNAME" && nickname.length >= 2) {
      status = "COMPLETED";
    }

    if (status === "NEEDS_AGREEMENT") {
      try {
        await createConsentAsync({ privacyRequired: true, skipErrorToast: true });
      } catch (e) {
        console.log("[consent] ERR", e?.response?.status, e?.response?.data, e?.message);
      }
    }
    const target = nextRoute(status);
    const rootNav = navigation.getParent("root") ?? navigation.getParent();
    rootNav?.reset({ index: 0, routes: [{ name: target }] });

  };

  const onPressKakao = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = await kakaoGetAccessToken();
      const data = await createSocialLogin(
          { provider: "KAKAO", accessToken: token, skipErrorToast: true, });
      await afterLogin(data);
    } catch (e) {
      console.log("ERR status", e?.response?.status);
      console.log("ERR data", e?.response?.data);
      console.log("ERR headers", e?.response?.headers);
      console.log("ERR message", e?.message);
    } finally {
      setLoading(false);
    }
  };

  const onPressNaver = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = await naverGetAccessToken();
      const data = await createSocialLogin(
          { provider: "NAVER", accessToken: token, skipErrorToast: true,});
      await afterLogin(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onPressApple = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const idToken = await appleGetIdToken();
      const data = await createAppleLogin({ idToken, skipErrorToast: true,});
      await afterLogin(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
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
              style={{ transform: [{ translateY: height * 0.07 }] }}
          >
            <Image
                source={require("../../assets/png/login-logo.png")}
                style={{ width: "100%", maxWidth: 420, aspectRatio: 410 / 350 }}
                resizeMode="contain"
            />
          </View>

          <View className="flex-[4] justify-start" style={{ paddingTop: Math.max(8, height * 0.02) }}>
            <View
                className="flex-row items-center justify-center mb-6 self-center"
                style={{ width: Math.min(240, width * 0.62) }}
            >
              <View className="flex-1 h-[1px] bg-wt/25" />
              <AppText variant="M500" className="text-wt/75 mx-4">
                간편하게 시작하기
              </AppText>
              <View className="flex-1 h-[1px] bg-wt/25" />
            </View>

            <View className="flex-row justify-center" style={{ columnGap: Math.min(32, width * 0.07), marginBottom: 18 }}>
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
                  onPress: onPressApple,
                },
              ].map((it) => (
                  <View key={it.label} className="items-center">
                    <TouchableOpacity activeOpacity={0.8} onPress={it.onPress} disabled={loading}>
                      <Image source={it.img} style={{ width: iconSize, height: iconSize, opacity: loading ? 0.6 : 1 }} resizeMode="contain" />
                    </TouchableOpacity>
                    <AppText variant="M500" className="text-wt mt-2">
                      {it.label}
                    </AppText>
                  </View>
              ))}
            </View>

            <AppText variant="S400" className="text-wt/75 text-center mt-4" style={{ paddingHorizontal: 8 }}>
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
