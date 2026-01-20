import {registerRootComponent} from "expo";
import messaging from "@react-native-firebase/messaging";
import {displayTodoNotification} from "./src/notifications/displayNotification";
import notifee, {EventType} from "@notifee/react-native";
import App from "./src/app/App";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const title = remoteMessage.notification?.title ?? remoteMessage.data?.title;
  const body = remoteMessage.notification?.body ?? remoteMessage.data?.body;

  await displayTodoNotification({
    title,
    body,
    data: remoteMessage.data,
  });
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS) {
    // 여기서는 네비게이션 직접 호출이 어려워서
    // 보통 "딥링크/저장 후 앱 시작 시 처리" 패턴을 씀
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
