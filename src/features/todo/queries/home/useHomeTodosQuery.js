import {useEffect, useMemo, useState} from "react";
import {AppState} from "react-native";
import {useQuery} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";
import {
  peekPendingToggleIdsSync,
  peekPendingToggleIds,
  peekPendingBeforeStatesSync,
  peekPendingBeforeStates,
} from "../../../../shared/widget/syncWidget";
import {getPendingCache, setPendingCache} from "../../../../shared/widget/pendingCache";

function readPendingSync() {
  const sync = peekPendingToggleIdsSync();
  if (sync !== null) return sync;
  return getPendingCache();
}

function readBeforeSync() {
  const sync = peekPendingBeforeStatesSync();
  if (sync !== null) return sync;
  return {};
}

// isDone(boolean) → status 로 변환
function isDoneToStatus(isDone) {
  return isDone ? "COMPLETED" : "IN_PROGRESS";
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
  const [beforeStates, setBeforeStates] = useState(() => readBeforeSync());

  useEffect(() => {
    let alive = true;

    const applyAll = (ids, before) => {
      if (!alive) return;
      const arr = ids ?? [];
      // Non-empty read 는 즉시 반영. Empty 는 overlay 로직이 beforeStates 로 자동 처리하므로 state clear 안 함
      // (state clear 하면 refetch 완료 전에 unflipped 로 flicker 될 수 있음)
      if (arr.length > 0) {
        setPending(arr);
        setPendingCache(arr);
        setBeforeStates(before ?? {});
      }
    };

    const readOnce = async () => {
      const syncIds = peekPendingToggleIdsSync();
      const syncBefore = peekPendingBeforeStatesSync();
      if (syncIds !== null) {
        applyAll(syncIds, syncBefore ?? {});
        return;
      }
      const [ids, before] = await Promise.all([
        peekPendingToggleIds(),
        peekPendingBeforeStates(),
      ]);
      applyAll(ids ?? [], before ?? {});
    };

    const scheduleReads = () => {
      readOnce();
      // 초반 재시도 (콜드 스타트 storage sync 지연 커버)
      [100, 300, 800, 2000].forEach((delay) => {
        setTimeout(readOnce, delay);
      });
    };

    scheduleReads();

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") scheduleReads();
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
    return arr.map((t) => {
      const idKey = String(t.id);
      if (!pendingSet.has(idKey)) return t;
      // 위젯이 tap 시점에 기록한 before isDone
      const beforeIsDone = beforeStates[idKey];
      if (beforeIsDone === undefined) {
        // before 없으면 안전하게 flip (레거시 대응)
        return {
          ...t,
          status: t.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
        };
      }
      const beforeStatus = isDoneToStatus(beforeIsDone);
      // 서버가 이미 flip 됨 = drain 완료 → overlay 안 함 (서버 truth 사용)
      if (t.status !== beforeStatus) return t;
      // 서버가 아직 before 상태 = drain 안 됨 → overlay 로 유저 intent (flip) 표시
      return {
        ...t,
        status: beforeStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
      };
    });
  }, [query.data, pending, beforeStates]);

  return {...query, data: dataWithOverlay};
}
