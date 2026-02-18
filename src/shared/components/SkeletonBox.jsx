// src/shared/components/SkeletonBox.jsx
import React, {useEffect} from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const BASE_COLOR = "#EAEAEA"; // gr200

export default function SkeletonBox({width, height, borderRadius = 8, style}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: BASE_COLOR,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
