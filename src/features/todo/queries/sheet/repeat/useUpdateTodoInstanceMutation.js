import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sheetApi } from "../sheetApi";
import { sheetKeys } from "../sheetKeys";
import { homeKeys } from "../../home/homeKeys";

export function useUpdateTodoInstanceMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.updateTodoInstance,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: sheetKeys.all });
      queryClient.invalidateQueries({ queryKey: homeKeys.all });
      options?.onSuccess?.(data, variables, context);
    },

    onError: (e) => {
      console.log("update instance error", e?.response?.data || e);
    },

    ...options,
  });
}