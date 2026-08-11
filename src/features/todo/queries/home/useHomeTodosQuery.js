import {useEffect, useMemo, useState} from "react";
import {AppState} from "react-native";
import {useQuery} from "@tanstack/react-query";
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

  const [pending, setPending] = useState(() => readPendingSync());

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const sync = peekPendingToggleIdsSync();
      if (sync !== null) {
        if (alive) setPending(sync);
        return;
      }
      const ids = await peekPendingToggleIds();
      if (alive) {
        setPending(ids);
        setPendingCache(ids);
      }
    };

    refresh();
    // iOS 콜드 스타트 시 UserDefaults 크로스프로세스 sync 지연 커버용 재시도
    const timers = [
      setTimeout(refresh, 100),
      setTimeout(refresh, 300),
      setTimeout(refresh, 800),
      setTimeout(refresh, 2000),
    ];

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") refresh();
    });
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      sub.remove();
    };
  }, []);

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
