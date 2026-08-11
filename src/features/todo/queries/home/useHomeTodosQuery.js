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

  useEffect(() => {
    let alive = true;
    let clearTimer = null;
    let readTimers = [];

    // 저장소 pending 이 비어있으면 즉시 clear 하지 않고 3초 지연
    // → drain 이 storage 를 clear 했는데 refetch 는 아직 안 끝났을 때, 겉으로 unflipped 로 보이는 flicker 방지
    // 실제 사용자가 pending 없는 상태(위젯 안 눌렀음)여도 3초 후엔 정상 empty 로 됨
    const applyIds = (ids) => {
      if (!alive) return;
      if (clearTimer) {
        clearTimeout(clearTimer);
        clearTimer = null;
      }
      const arr = ids ?? [];
      if (arr.length > 0) {
        setPending(arr);
        setPendingCache(arr);
      } else {
        clearTimer = setTimeout(() => {
          if (!alive) return;
          setPending([]);
          setPendingCache([]);
        }, 3000);
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
      readTimers.forEach(clearTimeout);
      readTimers = [];
      readOnce();
      // iOS UserDefaults 크로스프로세스 sync 지연 커버
      readTimers.push(setTimeout(readOnce, 200));
      readTimers.push(setTimeout(readOnce, 800));
    };

    scheduleReads();

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") scheduleReads();
    });

    return () => {
      alive = false;
      if (clearTimer) clearTimeout(clearTimer);
      readTimers.forEach(clearTimeout);
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
