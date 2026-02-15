import {displayTodoNotification} from "../displayNotification";

export async function fcmBackgroundHandler(remoteMessage) {
  // notification 페이로드가 있으면 Firebase가 이미 자동 표시하므로 건너뜀
  console.log("remoteMessage.notification: ", remoteMessage.notification);
  if (remoteMessage.notification) return;

  const title = remoteMessage.data?.title;
  const body = remoteMessage.data?.body;
  console.log("remoteMessage.data?.title: ", title);
  await displayTodoNotification({
    title,
    body,
    data: remoteMessage.data,
  });
}
