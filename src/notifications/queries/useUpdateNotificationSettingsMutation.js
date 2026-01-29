// src/notifications/queries/useUpdateNotificationSettingsMutation.js
import {useMutation} from "@tanstack/react-query";
import api from "../../shared/lib/api"; // ✅ 너희 프로젝트의 axios 인스턴스 경로에 맞게 수정

/**
 * PATCH /api/users/me/notification-settings
 * body: { pushNotificationEnabled: boolean }
 *
 * - false: 모든 푸시 알림 미발송(개별 투두 알림/자동 스케줄러 알림 포함)
 */
export function useUpdateNotificationSettingsMutation(options = {}) {
  return useMutation({
    mutationFn: async ({pushNotificationEnabled}) => {
      if (typeof pushNotificationEnabled !== "boolean") {
        throw new Error("pushNotificationEnabled must be a boolean");
      }

      const res = await api.patch("/api/users/me/notification-settings", {
        pushNotificationEnabled,
      });

      // response: { message: "알림 설정이 성공적으로 변경되었습니다." }
      return res?.data;
    },
    ...options,
  });
}
