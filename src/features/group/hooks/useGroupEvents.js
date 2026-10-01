import { useEffect } from "react";
import { AppState } from "react-native";
import { groupApi } from "../api/groupApi";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../shared/lib/api";
import { getAccessToken } from "../../../shared/lib/storage/tokenStorage";
import { groupKeys } from "../queries/groupKeys";
import { getSeoulDate, openGroupEventStream } from "../lib/groupEventStream";

export default function useGroupEvents(groupId) {
  const client = useQueryClient();
  useEffect(() => {
    if (!groupId) return;
    let stopStream;
    let refreshTimer;
    let active = AppState.currentState !== "background" && AppState.currentState !== "inactive";
    let lastDate = getSeoulDate();

    const refresh = (refreshTodos = true) => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        // 투두 화면에서도 그룹의 상태/날짜를 갱신한다.
        // fetchQuery는 진행 중인 동일 요청을 공유하며 비활성 observer에도 결과를 전달한다.
        void client.fetchQuery({
          queryKey: groupKeys.detail(groupId),
          queryFn: () => groupApi.getGroup(groupId),
          staleTime: 0,
          retry: false,
        }).catch(() => {});
        if (refreshTodos) void client.invalidateQueries({
          queryKey: ["groups", String(groupId), "memberTodos"],
        }, { cancelRefetch: false });
      }, 100);
    };
    const checkDate = () => {
      if (!active) return;
      const today = getSeoulDate();
      const serverDate = client.getQueryData(groupKeys.detail(groupId))?.date;
      if (lastDate !== today || (serverDate && serverDate !== today)) refresh();
      lastDate = today;
    };
    let hasConnected = false;
    const start = () => {
      stopStream?.();
      stopStream = openGroupEventStream({
        url: api.getUri({ url: `/api/groups/${groupId}/events` }),
        getToken: getAccessToken,
        // 스트림 오류에는 본문이 없으므로 일반 API를 통해 기존 인증 갱신 경로를 사용한다.
        recoverAuth: () => api.get("/api/groups", { meta: { skipErrorToast: true } }),
        onEvent: ({ type }) => {
          if (type === "connected") {
            refresh(hasConnected);
            hasConnected = true;
          } else if (type === "group-progress") refresh();
        },
        onUnavailable: () => refresh(),
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
      // 그룹을 다시 방문할 때는 연결이 없던 동안의 변경을 새로 조회한다.
      void client.invalidateQueries({
        queryKey: ["groups", String(groupId), "memberTodos"],
        refetchType: "none",
      });
    };
  }, [client, groupId]);
}
