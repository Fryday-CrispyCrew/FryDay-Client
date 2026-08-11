import { useEffect, useMemo } from "react";
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
import { setPendingCache } from "./pendingCache";

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

  useEffect(() => {
    syncLoginToWidget(true);
    syncServerErrorToWidget(false);
  }, []);

  useEffect(() => {
    syncServerErrorToWidget(isServerError);
  }, [isServerError]);

  // 위젯 storage sync: RN cache 변경마다 서버 raw 데이터 를 위젯 스토리지에 write
  // 위젯은 스토리지 데이터 + 자체 pending overlay 로 렌더
  useEffect(() => {
    const doSync = () => {
      const rawCategoriesData = queryClient.getQueryData(categoryKeys.list());
      const rawCategories = extractArray(rawCategoriesData);
      if (!rawCategories || rawCategories.length === 0) return;

      const payload = {};
      let hasAny = false;
      dates.forEach((date) => {
        const rawTodos = queryClient.getQueryData(
          homeKeys.todosList({ date, categoryId: null }),
        );
        const todos = extractArray(rawTodos);
        if (todos) {
          const normalized = todos.map(normalizeTodo);
          const sorted = sortByHomeOrder(normalized, rawCategories);
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
      const isHomeTodos = key[0] === "home" && key[1] === "todos";
      const isCategories = key[0] === "categories";
      if (isHomeTodos || isCategories) doSync();
    });

    doSync();

    return unsub;
  }, [queryClient, dates]);

  // 앱 진입 시: pending 을 JS 캐시에 저장 + select 강제 재실행 + drain + refetch
  // useHomeTodosQuery 의 select 가 pending overlay 를 매 렌더마다 적용 → 반영 즉시
  useEffect(() => {
    const forceSelectRerun = () => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: homeKeys.todos() })
        .forEach((q) => {
          const data = q.state.data;
          if (data) queryClient.setQueryData(q.queryKey, { ...data });
        });
    };

    const handleAppState = async (nextState) => {
      if (nextState !== "active") return;

      const pendingIds = await peekPendingToggleIds();
      setPendingCache(pendingIds);
      // pending 변경 즉시 홈 재렌더 (select 재실행)
      forceSelectRerun();

      // 최신 서버 상태 강제 fetch
      queryClient.refetchQueries({ queryKey: homeKeys.todos() });

      await drainPendingToggles(async (todoId) => {
        await homeApi.toggleCompletion({ todoId });
      });

      const pendingAfter = await peekPendingToggleIds();
      setPendingCache(pendingAfter);
      forceSelectRerun();

      queryClient.refetchQueries({ queryKey: homeKeys.todos() });
      queryClient.invalidateQueries({ queryKey: homeKeys.characterStatus() });
    };

    const sub = AppState.addEventListener("change", handleAppState);
    handleAppState("active");
    return () => sub.remove();
  }, [queryClient]);
}
