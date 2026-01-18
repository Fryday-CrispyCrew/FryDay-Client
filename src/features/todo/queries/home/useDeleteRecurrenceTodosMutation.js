// src/features/todo/queries/home/useDeleteRecurrenceTodosMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {homeApi} from "./homeApi";
import {homeKeys} from "./homeKeys";

export function useDeleteRecurrenceTodosMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: homeApi.deleteRecurrenceTodos,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: homeKeys.todos()});
      queryClient.invalidateQueries({queryKey: homeKeys.characterStatus()});
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error) => {
      console.log("error: ", error.response.data);
    },
    ...options,
  });
}
