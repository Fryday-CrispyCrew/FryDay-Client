import { useEffect, useMemo, useRef } from "react";
import { AppState } from "react-native";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { useCategoriesQuery } from "../../features/todo/queries/category/useCategoriesQuery";
import { categoryKeys } from "../../features/todo/queries/category/categoryKeys";
import { homeApi } from "../../features/todo/queries/home/homeApi";
import { homeKeys } from "../../features/todo/queries/home/homeKeys";
import { useServerStatusStore } from "../stores/serverStatusStore";
import {
  syncTodosToWidget,
  syncLoginToWidget,
  syncServerErrorToWidget,
  drainPendingToggles,
  peekPendingToggleIds,
} from "./syncWidget";

const SYNC_DAYS = 7;

function toISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function extractArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return null;
}

function normalizeTodo(t) {
  return {
    id: String(t.id),
    title: t.description ?? t.title ?? "",
    done: t.status === "COMPLETED",
    categoryId: t.categoryId,
    displayOrder: t.displayOrder,
    categoryColor: t.categoryColor ?? null,
  };
}

function sortByHomeOrder(todos, rawCategories) {
  if (!Array.isArray(todos) || !Array.isArray(rawCategories)) return [];

  const categoryOrderMap = new Map();
  const colorMap = new Map();
  rawCategories
    .slice()
    .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
    .forEach((c, i) => {
      categoryOrderMap.set(Number(c.id), i);
      colorMap.set(Number(c.id), c.colorHex);
    });

  return todos
    .map((t) => ({
      ...t,
      categoryColor: colorMap.get(Number(t.categoryId)) ?? null,
    }))
    .sort((a, b) => {
      const ca = categoryOrderMap.get(Number(a.categoryId)) ?? 999;
      const cb = categoryOrderMap.get(Number(b.categoryId)) ?? 999;
      if (ca !== cb) return ca - cb;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
}

export function useWidgetSync() {
  const dates = useMemo(
    () => Array.from({ length: SYNC_DAYS }, (_, i) => toISO(dateOffset(i))),
    [],
  );

  useQueries({
    queries: dates.map((date) => ({
      queryKey: homeKeys.todosList({ date, categoryId: null }),
      queryFn: () => homeApi.getTodos({ date }),
      select: (res) => res?.data ?? [],
      enabled: !!date,
    })),
  });

  useCategoriesQuery();

  const queryClient = useQueryClient();
  const isServerError = useServerStatusStore((s) => s.isServerError);

  const pendingSetRef = useRef(new Set());
  const inProgressWritesRef = useRef(new Set());

  useEffect(() => {
    syncLoginToWidget(true);
    syncServerErrorToWidget(false);
  }, []);

  useEffect(() => {
    syncServerErrorToWidget(isServerError);
  }, [isServerError]);

  useEffect(() => {
    const refreshPendingSet = async () => {
      const ids = await peekPendingToggleIds();
      pendingSetRef.current = new Set(ids.map(String));
    };

    const applyOptimisticFlipToQuery = (queryKey) => {
      const pendingSet = pendingSetRef.current;
      if (pendingSet.size === 0) return;

      const cached = queryClient.getQueryData(queryKey);
      const arr = extractArray(cached);
      if (!arr || arr.length === 0) return;

      const needsFlip = arr.some((t) => pendingSet.has(String(t.id)));
      if (!needsFlip) return;

      const flipped = arr.map((t) =>
        pendingSet.has(String(t.id))
          ? {
              ...t,
              status: t.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
            }
          : t,
      );
      const next = Array.isArray(cached)
        ? flipped
        : { ...cached, data: flipped };

      const keyStr = JSON.stringify(queryKey);
      inProgressWritesRef.current.add(keyStr);
      queryClient.setQueryData(queryKey, next);
      Promise.resolve().then(() =>
        inProgressWritesRef.current.delete(keyStr),
      );
    };

    const applyOptimisticFlipAll = () => {
      const queries = queryClient
        .getQueryCache()
        .findAll({ queryKey: homeKeys.todos() });
      for (const query of queries) {
        applyOptimisticFlipToQuery(query.queryKey);
      }
    };

    const doSync = () => {
      const rawCategoriesData = queryClient.getQueryData(categoryKeys.list());
      const rawCategories = extractArray(rawCategoriesData);
      if (!rawCategories || rawCategories.length === 0) return;

      const pendingSet = pendingSetRef.current;

      const payload = {};
      let hasAny = false;
      dates.forEach((date) => {
        const rawTodos = queryClient.getQueryData(
          homeKeys.todosList({ date, categoryId: null }),
        );
        const todos = extractArray(rawTodos);
        if (todos) {
          const normalized = todos.map(normalizeTodo);
          const serverState = normalized.map((t) =>
            pendingSet.has(String(t.id)) ? { ...t, done: !t.done } : t,
          );
          const sorted = sortByHomeOrder(serverState, rawCategories);
          payload[date] = sorted;
          hasAny = true;
        }
      });

      if (hasAny) syncTodosToWidget(payload);
    };

    const unsub = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type !== "updated" && event?.type !== "added") return;
      const key = event.query?.queryKey;
      if (!Array.isArray(key)) return;

      const keyStr = JSON.stringify(key);
      if (inProgressWritesRef.current.has(keyStr)) return;

      const isHomeTodos = key[0] === "home" && key[1] === "todos";
      const isCategories = key[0] === "categories";

      if (isHomeTodos) applyOptimisticFlipToQuery(key);
      if (isHomeTodos || isCategories) doSync();
    });

    const handleAppState = async (nextState) => {
      if (nextState !== "active") return;

      await refreshPendingSet();
      applyOptimisticFlipAll();

      await drainPendingToggles(async (todoId) => {
        await homeApi.toggleCompletion({ todoId });
      });

      await refreshPendingSet();

      queryClient.invalidateQueries({ queryKey: homeKeys.todos() });
      queryClient.invalidateQueries({ queryKey: homeKeys.characterStatus() });
    };

    const sub = AppState.addEventListener("change", handleAppState);
    handleAppState("active");

    return () => {
      unsub();
      sub.remove();
    };
  }, [queryClient, dates]);
}
