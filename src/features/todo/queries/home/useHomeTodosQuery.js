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
  const [beforeStatus, setBeforeStatus] = useState(() => {
    // 초기 pending 있으면 현재 캐시 서버 상태를 before 로 기록
    const initialPending = readPendingSync();
    if (!initialPending || initialPending.length === 0) return new Map();
    const cached = queryClient.getQueryData(
      homeKeys.todosList({date, categoryId}),
    );
    const todos = cached?.data ?? [];
    const map = new Map();
    initialPending.forEach((id) => {
      const key = String(id);
      const server = todos.find((t) => String(t.id) === key);
      map.set(key, server?.status ?? "IN_PROGRESS");
    });
    return map;
  });

  const lastNonEmptyAtRef = useRef(Date.now());
  const clearTimerRef = useRef(null);

  useEffect(() => {
    let alive = true;

    const tryClearIfServerCaughtUp = () => {
      if (!alive) return;
      const state = queryClient.getQueryState(queryKey);
      const dataUpdatedAt = state?.dataUpdatedAt ?? 0;
      if (dataUpdatedAt > lastNonEmptyAtRef.current) {
        setPending([]);
        setPendingCache([]);
        setBeforeStatus(new Map());
        return;
      }
      clearTimerRef.current = setTimeout(tryClearIfServerCaughtUp, 300);
    };

    const applyIds = (ids) => {
      if (!alive) return;
      const arr = ids ?? [];
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
      if (arr.length > 0) {
        lastNonEmptyAtRef.current = Date.now();
        const currentQueryData = queryClient.getQueryData(queryKey);
        const currentTodos = currentQueryData?.data ?? [];
        setBeforeStatus((prev) => {
          const next = new Map();
          arr.forEach((id) => {
            const key = String(id);
            if (prev.has(key)) {
              // 이미 추적 중인 id 는 기존 before 유지 (server 재캡처 방지)
              next.set(key, prev.get(key));
            } else {
              // 새로 감지된 id — 현재 서버 상태 capture
              const server = currentTodos.find((t) => String(t.id) === key);
              next.set(key, server?.status ?? "IN_PROGRESS");
            }
          });
          return next;
        });
        setPending(arr);
        setPendingCache(arr);
      } else {
        // Storage empty. 즉시 clear 하면 refetch 안 됐을 때 flicker → 지연 clear
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
      setTimeout(readOnce, 200);
      setTimeout(readOnce, 800);
    };

    scheduleReads();

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") scheduleReads();
    });

    return () => {
      alive = false;
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      sub.remove();
    };
  }, [queryClient, JSON.stringify(queryKey)]);

  const dataWithOverlay = useMemo(() => {
    const arr = Array.isArray(query.data) ? query.data : [];
    if (!pending || pending.length === 0) return arr;
    const pendingSet = new Set(pending.map(String));
    return arr.map((t) => {
      const idKey = String(t.id);
      if (!pendingSet.has(idKey)) return t;
      const before = beforeStatus.get(idKey);
      // 서버 상태가 pending 감지 시점과 다름 → drain 완료 → overlay 안 함
      if (before !== undefined && t.status !== before) {
        return t;
      }
      return {
        ...t,
        status: t.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
      };
    });
  }, [query.data, pending, beforeStatus]);

  return {...query, data: dataWithOverlay};
}
