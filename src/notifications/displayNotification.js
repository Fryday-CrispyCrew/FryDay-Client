// src/notifications/displayNotification.js
import notifee, {AndroidImportance} from "@notifee/react-native";

export async function displayTodoNotification({title, body, data}) {
  await notifee.displayNotification({
    title: title ?? "Fryday",
    body: body ?? "",
    data: data ?? {},

    android: {
      channelId: "todo",
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: "default",
      },
      // (선택) 작은 아이콘 지정 (안 하면 기본 아이콘 이슈가 날 수 있음)
      // smallIcon: "ic_notification",
    },

    ios: {
      // (선택) iOS foreground에서도 배너 보이게는 권한/설정에 따라 다름
      // sound: "default",
    },
  });
}
