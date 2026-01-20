import {useMutation, useQueryClient} from "@tanstack/react-query";
import {sheetApi} from "../sheetApi";
import {sheetKeys} from "../sheetKeys";

export function useDeleteTodoRecurrenceMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sheetApi.deleteTodoRecurrence,
    onSuccess: (data, variables, context) => {
      const {todoId} = variables ?? {};

      // ✅ 바텀시트 단건 상세 갱신 (해당 투두가 단건으로 바뀌고 recurrence가 사라짐)
      if (todoId) {
        queryClient.invalidateQueries({queryKey: sheetKeys.todoDetail(todoId)});
      }

      // ✅ 홈 리스트도 최신화 필요 (반복 투두들이 삭제되므로)
      queryClient.invalidateQueries({queryKey: ["home"]});

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.log(
        "delete todo recurrence error:",
        error?.response?.data ?? error,
      );
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}
