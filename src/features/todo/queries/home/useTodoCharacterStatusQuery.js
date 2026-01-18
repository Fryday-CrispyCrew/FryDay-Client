// src/features/todo/queries/home/useTodoCharacterStatusQuery.js
import {useQuery} from "@tanstack/react-query";
import {homeKeys} from "./homeKeys";
import {homeApi} from "./homeApi";

export function useTodoCharacterStatusQuery({date}, options = {}) {
  return useQuery({
    queryKey: homeKeys.characterStatusByDate(date ?? null),
    queryFn: () => homeApi.getCharacterStatus({date}),
    select: (res) => res?.data ?? null,
    ...options,
  });
}
