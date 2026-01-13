// src/features/todo/queries/category/useCategoriesQuery.js
import {useQuery} from "@tanstack/react-query";
import {categoryKeys} from "./categoryKeys";
import {categoryApi} from "./categoryApi";

export function useCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoryApi.getCategories,
    select: (res) => res?.data ?? [], // 화면에서는 카테고리 배열만 바로 쓰기
    ...options,
  });
}
