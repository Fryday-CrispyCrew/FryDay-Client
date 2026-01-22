// src/notifications/queries/useRegisterFcmTokenMutation.ts
import {useMutation} from "@tanstack/react-query";
import {registerFcmToken} from "../api/notificationsApi";

export const useRegisterFcmTokenMutation = () => {
  return useMutation({
    mutationFn: ({fcmToken, deviceId}) =>
      registerFcmToken({fcmToken, deviceId}),
    onSuccess: (data) => {
      console.log("success", data);
    },
    onError: (err) => {
      console.log("[FCM] token register failed", err?.response?.data ?? err);
    },
    // 보통 UI에 바로 영향이 없어서 invalidate는 필수 아님
    // onSuccess: () => {}
  });
};
