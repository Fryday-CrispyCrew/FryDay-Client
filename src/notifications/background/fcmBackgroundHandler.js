import {displayTodoNotification} from "../displayNotification";

export async function fcmBackgroundHandler(remoteMessage) {
  const title = remoteMessage.notification?.title ?? remoteMessage.data?.title;
  const body = remoteMessage.notification?.body ?? remoteMessage.data?.body;

  await displayTodoNotification({
    title,
    body,
    data: remoteMessage.data,
  });
}
