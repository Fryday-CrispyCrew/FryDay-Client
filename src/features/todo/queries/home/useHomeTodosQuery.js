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
  // pending id 감지 시점의 서버 상태 기록 → drain 후 서버가 이 상태와 달라지면 overlay 안 함
  const [beforeStatus, setBeforeStatus] = useState(new Map());

  useEffect(() => {
    let alive = true;

    const applyIds = (ids) => {
      if (!alive) return;
      const arr = ids ?? [];
      if (arr.length > 0) {
        // 새 pending id 에 대해 현재 서버 상태 기록
        const currentQueryData = queryClient.getQueryData(queryKey);
        const currentTodos = currentQueryData?.data ?? [];
        setBeforeStatus((prev) => {
          const next = new Map(prev);
          arr.forEach((id) => {
            const key = String(id);
            if (!next.has(key)) {
              const server = currentTodos.find((t) => String(t.id) === key);
              if (server) {
                next.set(key, server.status);
              } else {
                next.set(key, "IN_PROGRESS");
              }
            }
          });
          // pending 에서 빠진 id 는 before 에서도 제거
          const arrSet = new Set(arr.map(String));
          for (const key of Array.from(next.keys())) {
            if (!arrSet.has(key)) next.delete(key);
          }
          return next;
        });
        setPending(arr);
        setPendingCache(arr);
      } else {
        // Empty storage → pending state 도 즉시 clear (before 도 clear)
        // Overlay 는 beforeStatus 로 서버 반영 여부 판단하니 clear 해도 double-flip 안 됨
        setPending([]);
        setPendingCache([]);
        setBeforeStatus(new Map());
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
      // 서버 상태가 pending 감지 시점과 같음 = 아직 drain 안 됨 → overlay 적용
      // 다름 = drain 완료되어 서버가 이미 flipped → overlay 안 함
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
