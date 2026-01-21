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

export default function FCMInitializer() {
  const registerFcmTokenMutation = useRegisterFcmTokenMutation();

  useEffect(() => {
    let unsubscribeOnMessage;
    let unsubscribeTokenRefresh;

    (async () => {
      await initNotifeeChannel();

      const deviceId = await getDeviceId(); // ✅ expo-application 기반
      const token = await ensureFcmPermissionAndGetToken();

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
