import { useCallback } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../shared/lib/api";
import { getAccessToken } from "../../../shared/lib/storage/tokenStorage";
import { groupKeys } from "../queries/groupKeys";
import { getSeoulDate, openGroupEventStream } from "../lib/groupEventStream";

export default function useGroupEvents(groupId) {
  const client = useQueryClient();
  useFocusEffect(useCallback(() => {
    if (!groupId) return;
    let stopStream;
    let refreshTimer;
    let active = AppState.currentState !== "background" && AppState.currentState !== "inactive";
    let lastDate = getSeoulDate();

    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        // 투두 화면에서도 그룹의 상태/날짜를 갱신한다.
        void client.invalidateQueries({
          queryKey: groupKeys.detail(groupId), exact: true, refetchType: "all",
        });
        void client.invalidateQueries({
          queryKey: ["groups", String(groupId), "memberTodos"],
        });
      }, 100);
    };
    const checkDate = () => {
      if (!active) return;
      const today = getSeoulDate();
      const serverDate = client.getQueryData(groupKeys.detail(groupId))?.date;
      if (lastDate !== today || (serverDate && serverDate !== today)) refresh();
      lastDate = today;
    };
    const start = () => {
      stopStream?.();
      checkDate();
      refresh();
      stopStream = openGroupEventStream({
        url: api.getUri({ url: `/api/groups/${groupId}/events` }),
        getToken: getAccessToken,
        // 스트림 오류에는 본문이 없으므로 일반 API를 통해 기존 인증 갱신 경로를 사용한다.
        recoverAuth: () => api.get("/api/groups", { meta: { skipErrorToast: true } }),
        onEvent: ({ type }) => {
          if (type === "connected" || type === "group-progress") refresh();
        },
        onUnavailable: refresh,
      });
    };
    if (active) start();
    const dateTimer = setInterval(checkDate, 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      const nextActive = state === "active";
      if (active === nextActive) return;
      active = nextActive;
      if (active) start();
      else {
        stopStream?.();
        stopStream = null;
        clearTimeout(refreshTimer);
      }
    });
    return () => {
      stopStream?.();
      clearTimeout(refreshTimer);
      clearInterval(dateTimer);
      subscription.remove();
    };
  }, [client, groupId]));
}
