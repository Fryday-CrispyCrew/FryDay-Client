import notifee, {EventType} from "@notifee/react-native";

export function registerNotifeeBackgroundEvent() {
  return notifee.onBackgroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS) {
      // ✅ 여기서는 네비게이션 직접 호출이 어려움
      // → 딥링크/저장 후 앱 시작 시 처리 패턴
      // 예: detail.notification?.data 에 route 정보를 넣고 저장해두기
      // await savePendingNotificationRoute(detail.notification?.data);
    }
  });
}