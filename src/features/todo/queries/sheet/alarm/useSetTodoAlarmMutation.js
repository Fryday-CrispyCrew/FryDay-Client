// src/features/todo/queries/sheet/alarm/useSetTodoAlarmMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";
import {sheetKeys} from "../sheetKeys";

export function useSetTodoAlarmMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.setAlarm,
    onSuccess: (data, variables, context) => {
      const {todoId} = variables ?? {};
      if (todoId)
        queryClient.invalidateQueries({queryKey: sheetKeys.todoDetail(todoId)});
      queryClient.invalidateQueries({queryKey: ["home"]});
      options?.onSuccess?.(data, variables, context);
      console.log("set alarm success: ", data);
    },
    onError: (error) => {
      console.log("set alarm error: ", error?.response.data);
    },
    ...options,
  });
}
