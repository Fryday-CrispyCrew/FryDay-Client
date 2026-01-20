// src/features/todo/queries/category/useCreateCategoryMutation.js
import {useMutation} from "@tanstack/react-query";
import {queryClient} from "../../../../shared/lib/queryClient";
import {categoryKeys} from "./categoryKeys";
import {categoryApi} from "./categoryApi";

export function useCreateCategoryMutation(options = {}) {
  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: (data, variables, context) => {
      // ✅ 목록 다시 갱신
      queryClient.invalidateQueries({queryKey: categoryKeys.list()});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
