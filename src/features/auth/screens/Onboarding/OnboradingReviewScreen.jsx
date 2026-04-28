import React, { useCallback, useMemo, useState } from "react";
import { Image, Platform, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import BorderButton from "../../../../shared/components/BorderButton";
import CloseIcon from "../../../../shared/assets/svg/Clear.svg";
import colors from "../../../../shared/styles/colors";

const PAGES = [
  { id: "1", image: require("../../assets/png/tutorial-1.png") },
  { id: "2", image: require("../../assets/png/tutorial-2.png") },
  { id: "3", image: require("../../assets/png/tutorial-3.png") },
];

export default function OnboardingReviewScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [idx, setIdx] = useState(0);

  const page = PAGES[idx];
  const isFirst = idx === 0;
  const isLast = idx === PAGES.length - 1;

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
          return;
        }

        if (!isLast) onNext();
      });
  }, [width, isFirst, isLast, onPrev, onNext]);

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
          return;
        }

        if (!isFirst) onPrev();
      });
  }, [isFirst, isLast, onNext, onPrev]);

  const gesture = useMemo(() => Gesture.Race(swipe, tap), [swipe, tap]);

  return (
    <SafeAreaView
      edges={Platform.OS === "android" ? ["bottom"] : []}
      className="flex-1 bg-wt"
    >
      <GestureDetector gesture={gesture}>
        <View style={{ flex: 1, backgroundColor: "#4E4D4C" }}>
          <Image
            source={page.image}
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
            resizeMethod="resize"
            fadeDuration={0}
          />

          <View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 76 : 60,
              right: 20,
            }}
          >
            <BorderButton
              textVariant="L600"
              text={isLast ? "시작하기" : "그만보기"}
              textColor={colors.wt}
              borderColor={colors.wt}
              onPress={onClose}
            />
          </View>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}