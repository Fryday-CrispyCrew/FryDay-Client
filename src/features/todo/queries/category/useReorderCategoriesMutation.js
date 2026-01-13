// src/features/todo/queries/category/useReorderCategoriesMutation.js
import {useMutation} from "@tanstack/react-query";
import {queryClient} from "../../../../shared/lib/queryClient";
import {categoryKeys} from "./categoryKeys";
import {categoryApi} from "./categoryApi";

export function useReorderCategoriesMutation(options = {}) {
  return useMutation({
    mutationFn: categoryApi.reorderCategories,
    onSuccess: (data, variables, context) => {
      // ✅ 서버 정렬 반영된 목록을 다시 받기
      queryClient.invalidateQueries({queryKey: categoryKeys.list()});
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
