import notifee, {EventType} from "@notifee/react-native";
import {logNotificationClick} from "../lib/logNotificationClick";

export function registerNotifeeBackgroundEvent() {
  return notifee.onBackgroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      // await logNotificationClick(data, "background");
    }
  });
}
