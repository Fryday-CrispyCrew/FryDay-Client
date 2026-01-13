// src/features/todo/queries/category/useDeleteCategoryMutation.js
import {useMutation} from "@tanstack/react-query";
import {queryClient} from "../../../../shared/lib/queryClient";
import {categoryKeys} from "./categoryKeys";
import {categoryApi} from "./categoryApi";

export function useDeleteCategoryMutation(options = {}) {
  return useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: categoryKeys.list()});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
