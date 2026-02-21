// Banner.jsx
import React, {useState, useEffect} from "react";
import {Platform, NativeModules} from "react-native";
import Constants from "expo-constants";

export default function Banner() {
  const [nonPersonalized, setNonPersonalized] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setNonPersonalized(false);
      return;
    }
    const {getTrackingPermissionsAsync, TrackingStatus} = require("expo-tracking-transparency");
    getTrackingPermissionsAsync().then(({status}) => {
      setNonPersonalized(status !== TrackingStatus.AUTHORIZED);
    });
  }, []);

  // Expo Go
  if (Constants.appOwnership === "expo") return null;
  // dev client/기존 빌드앱 방어
  if (!NativeModules?.RNGoogleMobileAdsModule) return null;

  let BannerAd, BannerAdSize, TestIds;
  try {
    ({BannerAd, BannerAdSize, TestIds} = require("react-native-google-mobile-ads"));
  } catch {
    return null;
  }

  return (
    <BannerAd
      unitId={TestIds.BANNER}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{requestNonPersonalizedAdsOnly: nonPersonalized}}
    />
  );
}
