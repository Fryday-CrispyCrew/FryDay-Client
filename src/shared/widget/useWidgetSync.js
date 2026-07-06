import { useEffect, useMemo } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useHomeTodosQuery } from "../../features/todo/queries/home/useHomeTodosQuery";
import { useCategoriesQuery } from "../../features/todo/queries/category/useCategoriesQuery";
import { homeApi } from "../../features/todo/queries/home/homeApi";
import { homeKeys } from "../../features/todo/queries/home/homeKeys";
import { syncTodosToWidget, drainPendingToggles } from "./syncWidget";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useWidgetSync() {
  const date = todayISO();
  const { data: todos } = useHomeTodosQuery({ date });
  const { data: rawCategories } = useCategoriesQuery();
  const queryClient = useQueryClient();

  const sortedByHomeOrder = useMemo(() => {
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
  }, [todos, rawCategories]);

  useEffect(() => {
    if (sortedByHomeOrder.length > 0 || Array.isArray(todos)) {
      syncTodosToWidget(sortedByHomeOrder);
    }
  }, [sortedByHomeOrder, todos]);

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
