import analytics from "@react-native-firebase/analytics";

/**
 * 알림 클릭 이벤트를 Firebase Analytics에 기록합니다.
 * @param {object} data - 알림의 data payload
 * @param {"foreground"|"background"|"cold_start"} trigger - 클릭 진입 경로
 */
export async function logNotificationClick(data, trigger) {
  try {
    await analytics().logEvent("notification_click", {
      trigger,
      todo_id: data?.todoId ?? null,
      notification_id: data?.notificationId ?? null,
    });
  } catch (e) {
    // console.error("[Analytics] notification_click 실패:", e);
  }
}
