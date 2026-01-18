// src/features/todo/queries/sheet/useCreateTodoMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "./sheetApi";

export function useCreateTodoMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.createTodo,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ["home"]});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
