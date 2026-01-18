// src/features/todo/queries/sheet/alarm/useDeleteTodoAlarmMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";
import {sheetKeys} from "../sheetKeys";

export function useDeleteTodoAlarmMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.deleteAlarm,
    onSuccess: (data, variables, context) => {
      const {todoId} = variables ?? {};
      if (todoId)
        queryClient.invalidateQueries({queryKey: sheetKeys.todoDetail(todoId)});
      queryClient.invalidateQueries({queryKey: ["home"]});
      options?.onSuccess?.(data, variables, context);
      console.log("alarm delete success: ", data);
    },
    onError: (error) => {
      console.log("alarm delete error: ", error);
    },
    ...options,
  });
}
