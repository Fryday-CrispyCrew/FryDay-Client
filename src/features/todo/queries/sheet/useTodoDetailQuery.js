// src/features/todo/queries/sheet/useTodoDetailQuery.js
import {useQuery} from "@tanstack/react-query";
import {sheetKeys} from "./sheetKeys";
import {sheetApi} from "./sheetApi";

export function useTodoDetailQuery({todoId}, options = {}) {
  return useQuery({
    queryKey: sheetKeys.todoDetail(todoId),
    queryFn: () => sheetApi.getTodoDetail({todoId}),
    enabled: !!todoId,
    select: (res) => res?.data ?? null,
    ...options,
  });
}
