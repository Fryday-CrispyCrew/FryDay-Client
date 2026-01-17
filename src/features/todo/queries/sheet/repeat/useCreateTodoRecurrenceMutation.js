// src/features/todo/queries/sheet/repeat/useCreateTodoRecurrenceMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";
import {sheetKeys} from "../sheetKeys";

export function useCreateTodoRecurrenceMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.createRecurrence,
    onSuccess: (data, variables, context) => {
      const {todoId} = variables ?? {};
      if (todoId)
        queryClient.invalidateQueries({queryKey: sheetKeys.todoDetail(todoId)});
      queryClient.invalidateQueries({queryKey: ["home"]});
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error) => {
      console.log("error: ", error);
    },
    ...options,
  });
}
