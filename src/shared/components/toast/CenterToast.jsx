// src/shared/components/toast/CenterToast.jsx
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Animated, StyleSheet, Text, View} from "react-native";
import colors from "../../styles/colors";

/**
 * ✅ 전역 toast API
 * - 어디서든 toast.show("문구") 호출 가능
 */
let _show = null;

export const toast = {
  show: (message, options = {}) => {
    _show?.(message, options);
  },
};

export function CenterToast({visible, message, position = "center", style}) {
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

  const getPositionStyle = (position) => {
    switch (position) {
      case "top":
        return {justifyContent: "flex-start", paddingTop: 80};
      case "bottom":
        return {justifyContent: "flex-end", paddingBottom: 80};
      case "center":
      default:
        return {justifyContent: "center"};
    }
  };

  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.overlay, getPositionStyle(position), style]}
    >
      <Animated.View
        style={[styles.bubble, {opacity, transform: [{translateY}]}]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

function useCenterToastInternal() {
  const [toastState, setToastState] = useState({
    visible: false,
    message: "",
    position: "center", // "top" | "center" | "bottom"
  });
  const timerRef = useRef(null);

  const showToast = useCallback((message, options = {}) => {
    const {duration = 1700, position = "center"} = options;
    if (!message) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setToastState({visible: true, message, position});

    timerRef.current = setTimeout(() => {
      setToastState((prev) => ({...prev, visible: false}));
      timerRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {toastState, showToast};
}

/**
 * ✅ 앱 최상단에 1번만 렌더하는 Host
 * - 여기서 _show를 주입해서 전역 toast.show()가 동작하도록 함
 */
export function CenterToastHost() {
  const {toastState, showToast} = useCenterToastInternal();

  useEffect(() => {
    _show = showToast;
    return () => {
      // 언마운트 시 안전하게 해제
      if (_show === showToast) _show = null;
    };
  }, [showToast]);

  return (
    <CenterToast
      visible={toastState.visible}
      message={toastState.message}
      position={toastState.position}
    />
  );
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
    backgroundColor: colors.bk,
  },
  text: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.wt,
  },
});
