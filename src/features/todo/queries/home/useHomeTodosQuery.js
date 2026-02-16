// src/features/todo/queries/home/useHomeTodosQuery.js
import {useQuery} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";

export function useHomeTodosQuery({date, categoryId}, options = {}) {
  return useQuery({
    queryKey: homeKeys.todosList({date, categoryId}),
    queryFn: () => new Promise(() => {}), // ⚠️ 디버그: 로딩 상태 유지
    // queryFn: () => homeApi.getTodos({date, categoryId}),
    enabled: !!date, // date는 필수
    select: (res) => res?.data ?? [],
    ...options,
  });
}
