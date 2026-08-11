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
    const activeTimers = [];

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

    // iOS UserDefaults 크로스프로세스 sync 지연 커버 (콜드 스타트 + 웜 리쥼 공통)
    const refreshWithRetries = () => {
      refresh();
      activeTimers.push(setTimeout(refresh, 100));
      activeTimers.push(setTimeout(refresh, 300));
      activeTimers.push(setTimeout(refresh, 800));
      activeTimers.push(setTimeout(refresh, 2000));
    };

    refreshWithRetries();

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") refreshWithRetries();
    });
    return () => {
      alive = false;
      activeTimers.forEach(clearTimeout);
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
