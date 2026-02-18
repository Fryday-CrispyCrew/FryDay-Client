// src/features/todo/queries/home/useTodoCharacterStatusQuery.js
import {useQuery} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";

export function useTodoCharacterStatusQuery({date}, options = {}) {
  return useQuery({
    queryKey: homeKeys.characterStatusByDate(date ?? null),
    queryFn: () => homeApi.getCharacterStatus({date}),
    // queryFn: () => {
    //   throw new Error("[DEBUG] 홈 투두 API 강제 에러");
    // },
    enabled: !!date && (options.enabled ?? true), // ✅ date 필수 + 외부 enabled 반영
    select: (res) => res?.data ?? null,
    ...options,
  });
}
