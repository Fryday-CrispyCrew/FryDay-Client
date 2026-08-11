import {useEffect, useMemo, useRef, useState} from "react";
import {AppState} from "react-native";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";
import {
  peekPendingToggleIdsSync,
  peekPendingToggleIds,
} from "../../../../shared/widget/syncWidget";
import {getPendingCache, setPendingCache} from "../../../../shared/widget/pendingCache";

function readPendingSync() {
  const sync = peekPendingToggleIdsSync();
  if (sync !== null) return sync;
  return getPendingCache();
}

export function useHomeTodosQuery({date, categoryId}, options = {}) {
  const query = useQuery({
    queryKey: homeKeys.todosList({date, categoryId}),
    queryFn: () => homeApi.getTodos({date, categoryId}),
    enabled: !!date,
    select: (res) => res?.data ?? [],
    ...options,
  });

  const queryClient = useQueryClient();
  const queryKey = homeKeys.todosList({date, categoryId});

  const [pending, setPending] = useState(() => readPendingSync());
  const lastNonEmptyAtRef = useRef(Date.now());
  const clearAttemptTimerRef = useRef(null);

  useEffect(() => {
    let alive = true;

    const tryClearIfServerCaughtUp = () => {
      if (!alive) return;
      const state = queryClient.getQueryState(queryKey);
      const dataUpdatedAt = state?.dataUpdatedAt ?? 0;
      // 서버 데이터가 pending 감지 이후에 refetch 되었으면 safe to clear
      if (dataUpdatedAt > lastNonEmptyAtRef.current) {
        setPending([]);
        setPendingCache([]);
        return;
      }
      // 아직 refetch 안 됐으면 다시 체크
      clearAttemptTimerRef.current = setTimeout(tryClearIfServerCaughtUp, 300);
    };

    const applyIds = (ids) => {
      if (!alive) return;
      const arr = ids ?? [];
      if (clearAttemptTimerRef.current) {
        clearTimeout(clearAttemptTimerRef.current);
        clearAttemptTimerRef.current = null;
      }
      if (arr.length > 0) {
        lastNonEmptyAtRef.current = Date.now();
        setPending(arr);
        setPendingCache(arr);
      } else {
        // Empty 감지 → 서버 refetch 될 때까지 대기
        tryClearIfServerCaughtUp();
      }
    };

    const readOnce = async () => {
      const sync = peekPendingToggleIdsSync();
      if (sync !== null) {
        applyIds(sync);
        return;
      }
      const ids = await peekPendingToggleIds();
      applyIds(ids ?? []);
    };

    const scheduleReads = () => {
      readOnce();
      // iOS UserDefaults 크로스프로세스 sync 지연 커버
      setTimeout(readOnce, 200);
      setTimeout(readOnce, 800);
    };

    scheduleReads();

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") scheduleReads();
    });

    return () => {
      alive = false;
      if (clearAttemptTimerRef.current) clearTimeout(clearAttemptTimerRef.current);
      sub.remove();
    };
  }, [queryClient, JSON.stringify(queryKey)]);

  const dataWithOverlay = useMemo(() => {
    const arr = Array.isArray(query.data) ? query.data : [];
    if (!pending || pending.length === 0) return arr;
    const pendingSet = new Set(pending.map(String));
    return arr.map((t) =>
      pendingSet.has(String(t.id))
        ? {
            ...t,
            status: t.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
          }
        : t,
    );
  }, [query.data, pending]);

  return {...query, data: dataWithOverlay};
}
