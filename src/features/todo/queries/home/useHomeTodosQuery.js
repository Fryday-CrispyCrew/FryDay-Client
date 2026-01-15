// src/features/todo/queries/home/useHomeTodosQuery.js
import {useQuery} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";

export function useHomeTodosQuery({date, categoryId}, options = {}) {
  return useQuery({
    queryKey: homeKeys.todosList({date, categoryId}),
    queryFn: () => homeApi.getTodos({date, categoryId}),
    enabled: !!date,
    // ✅ axios response든(body는 res.data), body든(res 자체) 모두 커버
    select: (res) => {
      const body = res?.data ?? res; // axios면 res.data가 body
      return body?.data ?? []; // body.data가 투두 배열
    },
    ...options,
  });
}
