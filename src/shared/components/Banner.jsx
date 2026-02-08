// Banner.jsx
import React from "react";
import Constants from "expo-constants";
import { NativeModules } from "react-native";

export default function Banner() {
    // Expo Go
    if (Constants.appOwnership === "expo") return null;
    // dev client/기존 빌드앱 방어
    if (!NativeModules?.RNGoogleMobileAdsModule) return null;

    let BannerAd, BannerAdSize, TestIds;
    try {
        ({ BannerAd, BannerAdSize, TestIds } = require("react-native-google-mobile-ads"));
    } catch {
        return null;
    }

    return (
        <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
    );
}
