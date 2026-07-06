import { useEffect, useMemo } from "react";
import { AppState } from "react-native";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { useCategoriesQuery } from "../../features/todo/queries/category/useCategoriesQuery";
import { homeApi } from "../../features/todo/queries/home/homeApi";
import { homeKeys } from "../../features/todo/queries/home/homeKeys";
import { syncTodosToWidget, drainPendingToggles } from "./syncWidget";

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

function sortByHomeOrder(todos, rawCategories) {
  if (!Array.isArray(todos) || !Array.isArray(rawCategories)) return [];

  const orderMap = new Map();
  const colorMap = new Map();
  rawCategories.forEach((c) => {
    orderMap.set(Number(c.id), c.displayOrder ?? 0);
    colorMap.set(Number(c.id), c.colorHex);
  });

  const positionMap = new Map();
  todos.forEach((t, i) => positionMap.set(t.id, i));

  return todos
    .map((t) => ({
      ...t,
      categoryColor: colorMap.get(Number(t.categoryId)) ?? null,
    }))
    .sort((a, b) => {
      const oa = orderMap.get(Number(a.categoryId)) ?? 999;
      const ob = orderMap.get(Number(b.categoryId)) ?? 999;
      if (oa !== ob) return oa - ob;
      return (positionMap.get(a.id) ?? 0) - (positionMap.get(b.id) ?? 0);
    });
}

export function useWidgetSync() {
  const dates = useMemo(
    () => Array.from({ length: SYNC_DAYS }, (_, i) => toISO(dateOffset(i))),
    [],
  );

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: homeKeys.todosList({ date, categoryId: null }),
      queryFn: () => homeApi.getTodos({ date }),
      select: (res) => res?.data ?? [],
      enabled: !!date,
    })),
  });

  const { data: rawCategories } = useCategoriesQuery();
  const queryClient = useQueryClient();

  const todosByDateKey = results.map((r) => r.data).join("|");

  const payload = useMemo(() => {
    const acc = {};
    dates.forEach((date, i) => {
      acc[date] = sortByHomeOrder(results[i].data, rawCategories);
    });
    return acc;
  }, [dates, todosByDateKey, rawCategories]);

  useEffect(() => {
    syncTodosToWidget(payload);
  }, [payload]);

  useEffect(() => {
    const handleAppState = async (nextState) => {
      if (nextState !== "active") return;
      await drainPendingToggles(async (todoId) => {
        await homeApi.toggleCompletion({ todoId });
      });
      queryClient.invalidateQueries({ queryKey: homeKeys.todos() });
    };

    const sub = AppState.addEventListener("change", handleAppState);
    handleAppState("active");
    return () => sub.remove();
  }, [queryClient]);
}
