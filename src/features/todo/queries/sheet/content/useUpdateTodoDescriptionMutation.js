// src/features/todo/queries/sheet/useUpdateTodoDescriptionMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";
import {sheetKeys} from "../sheetKeys";

export function useUpdateTodoDescriptionMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.updateDescription,
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
