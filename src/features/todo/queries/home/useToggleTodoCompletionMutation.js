// src/features/todo/queries/home/useToggleTodoCompletionMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {homeApi} from "./homeApi";
import {calendarKeys} from "../../../calendar/queries/calendarKey";
import {homeKeys} from "./homeKeys";

export function useToggleTodoCompletionMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: homeApi.toggleCompletion,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: homeKeys.todos()});
      queryClient.invalidateQueries({queryKey: homeKeys.characterStatus()});
      queryClient.invalidateQueries({queryKey: calendarKeys.dailyResults()});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
