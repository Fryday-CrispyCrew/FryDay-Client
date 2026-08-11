// src/features/todo/queries/home/useHomeTodosQuery.js
import {useQuery} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";
import {peekPendingToggleIdsSync} from "../../../../shared/widget/syncWidget";
import {getPendingCache} from "../../../../shared/widget/pendingCache";

function applyPendingOverlay(todos) {
  if (!Array.isArray(todos) || todos.length === 0) return todos;
  const syncPending = peekPendingToggleIdsSync();
  const pendingIds = syncPending !== null ? syncPending : getPendingCache();
  console.log("[overlay] pending:", pendingIds, "todo ids:", todos.map(t => t.id));
  if (pendingIds.length === 0) return todos;
  const pendingSet = new Set(pendingIds.map(String));
  return todos.map((t) =>
    pendingSet.has(String(t.id))
      ? {
          ...t,
          status: t.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
        }
      : t,
  );
}

export function useHomeTodosQuery({date, categoryId}, options = {}) {
  return useQuery({
    queryKey: homeKeys.todosList({date, categoryId}),
    queryFn: () => homeApi.getTodos({date, categoryId}),
    enabled: !!date,
    select: (res) => applyPendingOverlay(res?.data ?? []),
    ...options,
  });
}
