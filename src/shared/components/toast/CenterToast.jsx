// src/shared/components/toast/CenterToast.jsx
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Animated, StyleSheet, Text, View} from "react-native";

/**
 * CenterToast
 * - 화면 중앙에 잠깐 뜨는 토스트
 * - pointerEvents="none" 으로 터치 방해 X
 */
export function CenterToast({visible, message, style}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 6,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  if (!message) return null;

  return (
    <View pointerEvents="none" style={[styles.overlay, style]}>
      <Animated.View
        style={[styles.bubble, {opacity, transform: [{translateY}]}]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

/**
 * useCenterToast
 * - showToast(message, duration)
 */
export function useCenterToast() {
  const [toast, setToast] = useState({visible: false, message: ""});
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast((prev) => ({...prev, visible: false}));
  }, []);

  const showToast = useCallback((message, duration = 1700) => {
    if (!message) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({visible: true, message});

    timerRef.current = setTimeout(() => {
      setToast((prev) => ({...prev, visible: false}));
      timerRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {toast, showToast, hideToast};
}

export default CenterToast;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  text: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: "#FFFFFF",
  },
});
