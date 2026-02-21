// Banner.jsx
import React from "react";
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

export default function Banner() {
  // Expo Go
  if (Constants.appOwnership === "expo") return null;
  // 구빌드/미설치 방어
  if (!NativeModules?.RNGoogleMobileAdsModule) return null;

  let BannerAd, BannerAdSize, TestIds;
  try {
    ({
      BannerAd,
      BannerAdSize,
      TestIds,
    } = require("react-native-google-mobile-ads"));
  } catch {
    return null;
  }

  const PROD_UNIT_ID_IOS = "ca-app-pub-8539790662098155/2075746683";
  const PROD_UNIT_ID_ANDROID = "ca-app-pub-8539790662098155/8449583340";

  const prodUnitId =
    Platform.OS === "ios" ? PROD_UNIT_ID_IOS : PROD_UNIT_ID_ANDROID;

  // 개발 중엔 테스트 광고, 배포(프로덕션)에서만 운영 광고
  const isProd = !__DEV__;
  const unitId = isProd ? prodUnitId : TestIds.BANNER;

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}
