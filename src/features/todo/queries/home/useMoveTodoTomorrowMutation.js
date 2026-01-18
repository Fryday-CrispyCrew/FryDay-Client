// src/features/todo/queries/home/useMoveTodoTomorrowMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {homeApi} from "./homeApi";
import {homeKeys} from "./homeKeys";

export function useMoveTodoTomorrowMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: homeApi.moveTomorrow,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: homeKeys.todos()});
      queryClient.invalidateQueries({queryKey: homeKeys.characterStatus()});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
