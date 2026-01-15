// src/features/todo/queries/sheet/useUpdateTodoMemoMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";
import {sheetKeys} from "../sheetKeys";

export function useUpdateTodoMemoMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.updateMemo,
    onSuccess: (data, variables, context) => {
      const {todoId} = variables ?? {};
      if (todoId)
        queryClient.invalidateQueries({queryKey: sheetKeys.todoDetail(todoId)});
      queryClient.invalidateQueries({queryKey: ["home"]});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
