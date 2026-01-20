// src/features/todo/queries/sheet/repeat/useUpdateRecurrenceRuleMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";

export function useUpdateRecurrenceRuleMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.updateRecurrenceRule,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ["home"]});
      // recurrence 수정은 보통 detail(todo)에도 반영되니, 호출부에서 todoId가 있으면 options.onSuccess로 추가 invalidate 해도 돼.
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
