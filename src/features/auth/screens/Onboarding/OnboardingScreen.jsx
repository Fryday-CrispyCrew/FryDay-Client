import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Image,
  useWindowDimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { CommonActions } from "@react-navigation/native";
import analytics from "@react-native-firebase/analytics";
import BorderButton from "../../../../shared/components/BorderButton";
import CloseIcon from "../../../../shared/assets/svg/Clear.svg";
import { Platform } from "react-native";
import colors from "../../../../shared/styles/colors";

import {
  ONBOARDING_STEP,
  STEP_KEY,
} from "../../../../shared/constants/onboardingStep";
import { useCompleteOnboardingMutation } from "../../queries/onboarding/useCompleteOnboardingMutation";

const PAGES = [
  { id: "1", image: require("../../assets/png/tutorial-1.png") },
  { id: "2", image: require("../../assets/png/tutorial-2.png") },
  { id: "3", image: require("../../assets/png/tutorial-3.png") },
];

function getRootNav(navigation) {
  let nav = navigation;
  while (nav?.getParent?.()) nav = nav.getParent();
  return nav;
}

export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [idx, setIdx] = useState(0);

  const page = PAGES[idx];
  const isFirst = idx === 0;
  const isLast = idx === PAGES.length - 1;

  const { mutateAsync: completeOnboardingAsync } =
    useCompleteOnboardingMutation();

  useEffect(() => {
    AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.NEEDS_ONBOARDING);
  }, []);

  const onDone = useCallback(async () => {
    try {
      await analytics().logEvent("onboarding_complete");
      await completeOnboardingAsync();
    } catch (e) {}

    await Promise.allSettled([
      SecureStore.setItemAsync("hasOnboarded", "true"),
      AsyncStorage.setItem("hasOnboarded", "true"),
      AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.COMPLETED),
    ]);

    const root = getRootNav(navigation);
    root.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Main" }],
      }),
    );
  }, [completeOnboardingAsync, navigation]);

  const onNext = useCallback(() => {
    setIdx((prev) => Math.min(prev + 1, PAGES.length - 1));
  }, []);

  const onPrev = useCallback(() => {
    setIdx((prev) => Math.max(prev - 1, 0));
  }, []);

  const tap = useMemo(() => {
    return Gesture.Tap()
      .runOnJS(true)
      .onEnd((e) => {
        const mid = width / 2;
        if (e.x < mid) {
          if (!isFirst) onPrev();
        } else {
          if (!isLast) onNext();
        }
      });
  }, [width, isFirst, isLast, onPrev, onNext]);

  // Swipe: "가로 스와이프"만 인식하도록 필터링
  const swipe = useMemo(() => {
    return Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-20, 20])
      .failOffsetY([-15, 15])
      .onEnd((e) => {
        const dx = e.translationX;
        if (Math.abs(dx) < 30) return;
        if (dx < 0) {
          if (!isLast) onNext();
        } else {
          if (!isFirst) onPrev();
        }
      });
  }, [isFirst, isLast, onNext, onPrev]);

  const gesture = useMemo(() => Gesture.Race(swipe, tap), [swipe, tap]);

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1">
      <GestureDetector gesture={gesture}>
        <View style={{ flex: 1, backgroundColor: "#4E4D4C" }}>
          <Image
            source={page.image}
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="contain"
            resizeMethod="resize"
            fadeDuration={0}
          />

          <View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 72 : 60,
              right: 20,
            }}
          >
            <BorderButton
              text={isLast ? "시작하기" : "스킵하기"}
              textColor={colors.wt}
              borderColor={colors.wt}
              icon={
                !isLast ? (
                  <CloseIcon width={14} height={14} color={colors.wt} />
                ) : null
              }
              onPress={onDone}
            />
          </View>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}
