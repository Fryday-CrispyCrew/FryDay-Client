// src/features/todo/queries/category/useDeleteCategoryMutation.js
import {useMutation} from "@tanstack/react-query";
import {queryClient} from "../../../../shared/lib/queryClient";
import {categoryKeys} from "./categoryKeys";
import {categoryApi} from "./categoryApi";
import {assertCategoryCanBeDeleted} from "../../../group/lib/publicCategoryDeletion";
import {groupKeys} from "../../../group/queries/groupKeys";

export function useDeleteCategoryMutation(options = {}) {
  return useMutation({
    ...options,
    mutationFn: async (variables) => {
      await assertCategoryCanBeDeleted(variables.categoryId);
      return categoryApi.deleteCategory(variables);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: categoryKeys.list()});
      queryClient.invalidateQueries({queryKey: groupKeys.all});
      options?.onSuccess?.(data, variables, context);
    },
  });
}
