// src/features/todo/queries/home/useHomeTodosQuery.js
import {useQuery} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";

export function useHomeTodosQuery({date, categoryId}, options = {}) {
  return useQuery({
    queryKey: homeKeys.todosList({date, categoryId}),
    // queryFn: () => new Promise(() => {}),
    // TODO: 디버깅용 강제 에러 — 테스트 후 제거할 것
    // queryFn: () => { throw new Error("[DEBUG] 홈 투두 API 강제 에러"); },
    queryFn: () => homeApi.getTodos({date, categoryId}),
    enabled: !!date, // date는 필수
    select: (res) => res?.data ?? [],
    ...options,
  });
}
