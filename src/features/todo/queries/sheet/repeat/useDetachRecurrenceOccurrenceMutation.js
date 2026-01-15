// src/features/todo/queries/sheet/useDetachRecurrenceOccurrenceMutation.js
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";

export function useDetachRecurrenceOccurrenceMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.detachRecurrenceOccurrence,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ["home"]});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
