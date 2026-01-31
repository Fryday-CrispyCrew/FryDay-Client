// src/notifications/FCMInitializer.jsx
import React, {useEffect} from "react";

import {initNotifeeChannel} from "../notificationInit";
import {
  ensureFcmPermissionAndGetToken,
  subscribeTokenRefresh,
} from "../fcmToken";
import {registerForegroundMessageListener} from "../listeners";
import {useRegisterFcmTokenMutation} from "../queries/useRegisterFcmTokenMutation";
import {getDeviceId} from "../lib/getDeviceId";
import {useUpdateNotificationSettingsMutation} from "../queries/useUpdateNotificationSettingsMutation";

let didInit = false;

export default function FCMInitializer() {
  const registerFcmTokenMutation = useRegisterFcmTokenMutation();
  const updateNotificationSettingsMutation =
    useUpdateNotificationSettingsMutation(); // ✅ 추가

  useEffect(() => {
    if (didInit) return;
    didInit = true;

    let unsubscribeOnMessage;
    let unsubscribeTokenRefresh;

    (async () => {
      await initNotifeeChannel();

      const deviceId = await getDeviceId(); // ✅ expo-application 기반
      const {enabled, token} = await ensureFcmPermissionAndGetToken();

      // ✅ 권한 결과를 서버 설정에 반영
      updateNotificationSettingsMutation.mutate({
        pushNotificationEnabled: enabled,
      });

      console.log("FCM permission enabled:", enabled);
      console.log("FCMtoken:", token, "deviceId:", deviceId);

      if (token && deviceId) {
        registerFcmTokenMutation.mutate({fcmToken: token, deviceId});
      }

      unsubscribeTokenRefresh = subscribeTokenRefresh(async (newToken) => {
        if (newToken && deviceId) {
          registerFcmTokenMutation.mutate({fcmToken: newToken, deviceId});
        }
      });

      unsubscribeOnMessage = registerForegroundMessageListener();
    })();

    return () => {
      unsubscribeOnMessage?.();
      unsubscribeTokenRefresh?.();
    };
  }, []);

  return null;
}
