import {useEffect, useMemo, useRef, useState} from "react";
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
  const lastPendingStrRef = useRef(JSON.stringify(readPendingSync() ?? []));

  useEffect(() => {
    let alive = true;

    const applyIfChanged = (ids) => {
      const str = JSON.stringify(ids ?? []);
      if (str === lastPendingStrRef.current) return;
      lastPendingStrRef.current = str;
      setPending(ids ?? []);
      setPendingCache(ids ?? []);
    };

    const readOnce = async () => {
      const sync = peekPendingToggleIdsSync();
      if (sync !== null) {
        applyIfChanged(sync);
        return sync;
      }
      const ids = await peekPendingToggleIds();
      if (alive) applyIfChanged(ids);
      return ids;
    };

    // 초기 read + iOS UserDefaults 크로스프로세스 sync 지연 커버 짧은 재시도
    // 재시도는 최초 non-empty 잡히면 중단 → drain 중 flicker 방지
    (async () => {
      const first = await readOnce();
      if (first && first.length > 0) return;
      // 콜드 스타트 iOS UserDefaults sync 대기
      for (const delay of [200, 600]) {
        await new Promise((r) => setTimeout(r, delay));
        if (!alive) return;
        const ids = await readOnce();
        if (ids && ids.length > 0) return;
      }
    })();

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") readOnce();
    });

    return () => {
      alive = false;
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
