// Banner.jsx
import React, { useState, useEffect } from "react";
import { Platform, NativeModules } from "react-native";
import Constants from "expo-constants";

export default function Banner() {
  const [nonPersonalized, setNonPersonalized] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setNonPersonalized(false);
      return;
    }

    const {
      requestTrackingPermissionsAsync,
      TrackingStatus,
    } = require("expo-tracking-transparency");

    requestTrackingPermissionsAsync().then(({ status }) => {
      setNonPersonalized(status !== TrackingStatus.AUTHORIZED);
    });
  }, []);

  // Expo Go
  if (Constants.appOwnership === "expo") return null;
  // dev client/기존 빌드앱 방어
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

  const isProd = !__DEV__;
  const unitId = isProd ? prodUnitId : TestIds.BANNER;

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: nonPersonalized }}
    />
  );
}
