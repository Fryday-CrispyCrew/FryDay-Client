import { NativeEventEmitter, NativeModules, Platform } from "react-native";

// 위젯에서 파일 변경이 일어나면 (Darwin notification / FileObserver) 콜백 즉시 호출.
// 폴링 재시도 없이 이벤트 기반으로 drain 트리거 가능.
export function subscribeWidgetPendingChanged(callback) {
  if (Platform.OS === "ios") {
    try {
      const ExtStorage = global?.expo?.modules?.ExtensionStorage;
      if (!ExtStorage) return () => {};
      const sub = ExtStorage.addListener?.("onAppGroupFileChanged", callback);
      // Expo Modules 는 EventSubscription 반환. 없으면 fallback 으로 no-op remove.
      return () => {
        try {
          sub?.remove?.();
        } catch {}
      };
    } catch {
      return () => {};
    }
  }

  if (Platform.OS === "android") {
    try {
      const AndroidWidget = NativeModules.FrydayWidget;
      if (!AndroidWidget) return () => {};
      const emitter = new NativeEventEmitter(AndroidWidget);
      const sub = emitter.addListener("onWidgetPendingChanged", callback);
      return () => {
        try {
          sub.remove();
        } catch {}
      };
    } catch {
      return () => {};
    }
  }

  return () => {};
}
