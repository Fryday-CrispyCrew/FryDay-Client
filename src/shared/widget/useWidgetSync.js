import { useEffect, useMemo } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useHomeTodosQuery } from "../../features/todo/queries/home/useHomeTodosQuery";
import { useCategoriesQuery } from "../../features/todo/queries/category/useCategoriesQuery";
import { homeApi } from "../../features/todo/queries/home/homeApi";
import { homeKeys } from "../../features/todo/queries/home/homeKeys";
import { syncTodosToWidget, drainPendingToggles } from "./syncWidget";

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

export function useWidgetSync() {
  const todayDate = toISO(new Date());
  const tomorrowDate = toISO(dateOffset(1));

  const { data: todosToday } = useHomeTodosQuery({ date: todayDate });
  const { data: todosTomorrow } = useHomeTodosQuery({ date: tomorrowDate });
  const { data: rawCategories } = useCategoriesQuery();
  const queryClient = useQueryClient();

  const sortByHomeOrder = (todos) => {
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
  };

  const payload = useMemo(() => {
    return {
      [todayDate]: sortByHomeOrder(todosToday),
      [tomorrowDate]: sortByHomeOrder(todosTomorrow),
    };
  }, [todosToday, todosTomorrow, rawCategories, todayDate, tomorrowDate]);

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
