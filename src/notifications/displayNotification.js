// src/notifications/displayNotification.js
import notifee, {AndroidImportance} from "@notifee/react-native";
import colors from "../shared/styles/colors";

export async function displayTodoNotification({title, body, data}) {
  await notifee.displayNotification({
    title: title ?? "Fryday",
    body: body ?? "body text",
    data: data ?? {},

    android: {
      channelId: "todo",
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: "default",
      },
      smallIcon: "ic_notification",
      color: colors.or,
    },

    ios: {
      // (선택) iOS foreground에서도 배너 보이게는 권한/설정에 따라 다름
      // sound: "default",
    },
  });
}
