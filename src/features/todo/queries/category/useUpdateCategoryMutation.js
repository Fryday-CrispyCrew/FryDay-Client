// src/features/todo/queries/category/useUpdateCategoryMutation.js
import {useMutation} from "@tanstack/react-query";
import {queryClient} from "../../../../shared/lib/queryClient";
import {categoryKeys} from "./categoryKeys";
import {categoryApi} from "./categoryApi";

export function useUpdateCategoryMutation(options = {}) {
  return useMutation({
    mutationFn: categoryApi.updateCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: categoryKeys.list()});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
