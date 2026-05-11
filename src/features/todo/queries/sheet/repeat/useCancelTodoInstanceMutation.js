import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sheetApi } from "../sheetApi";
import { sheetKeys } from "../sheetKeys";
import { homeKeys } from "../../home/homeKeys";

export function useCancelTodoInstanceMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.cancelTodoInstance,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: sheetKeys.all });
      queryClient.invalidateQueries({ queryKey: homeKeys.all });

      queryClient.removeQueries({
        queryKey: sheetKeys.todoDetail(variables.instanceId),
      });

      options?.onSuccess?.(data, variables, context);
    },

    ...options,
  });
}