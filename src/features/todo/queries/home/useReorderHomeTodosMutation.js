// src/features/todo/queries/home/useReorderHomeTodosMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {homeApi} from "./homeApi";
import {homeKeys} from "./homeKeys";

export function useReorderHomeTodosMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: homeApi.reorderTodos,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: homeKeys.todos()});
      queryClient.invalidateQueries({queryKey: homeKeys.characterStatus()});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
