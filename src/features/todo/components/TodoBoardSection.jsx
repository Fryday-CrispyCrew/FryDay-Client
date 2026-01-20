// src/features/todo/components/TodoBoardSection.jsx
import React, {useMemo, useState, useCallback} from "react";
import {ScrollView} from "react-native";
import TodoCard from "./TodoCard";
import TodoEditorSheet from "./TodoEditorSheet/TodoEditorSheet";
import {useTodoEditorController} from "../hooks/useTodoEditorController";

import {useCategoriesQuery} from "../queries/category/useCategoriesQuery";
import {useHomeTodosQuery} from "../queries/home/useHomeTodosQuery";

import {useCreateTodoMutation} from "../queries/sheet/useCreateTodoMutation";
import {useMoveTodoTomorrowMutation} from "../queries/home/useMoveTodoTomorrowMutation";
import {useMoveTodoTodayMutation} from "../queries/home/useMoveTodoTodayMutation";
import {useDeleteTodoMutation} from "../queries/home/useDeleteTodoMutation";
import {useToggleTodoCompletionMutation} from "../queries/home/useToggleTodoCompletionMutation";
import {useReorderHomeTodosMutation} from "../queries/home/useReorderHomeTodosMutation";
import {useDeleteRecurrenceTodosMutation} from "../queries/home/useDeleteRecurrenceTodosMutation";

import {useModalStore} from "../../../shared/stores/modal/modalStore";

export default function TodoBoardSection({
  navigation,
  date, // ✅ Home/Calendar에서 넘겨주는 선택 날짜(YYYY-MM-DD)
  isViewingToday,
}) {
  const {open, close} = useModalStore();

  const {data: rawCategories = []} = useCategoriesQuery();
  const categories = useMemo(() => {
    const arr = Array.isArray(rawCategories) ? rawCategories : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((c) => ({
        categoryId: c.id,
        label: c.name,
        color: c.colorHex,
      }));
  }, [rawCategories]);

  const {data: rawTodos = []} = useHomeTodosQuery({
    date,
    categoryId: undefined,
  });
  const todos = useMemo(() => {
    const arr = Array.isArray(rawTodos) ? rawTodos : [];
    return arr
      .slice()
      .sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      .map((t) => ({
        id: String(t.id),
        title: t.description ?? "",
        done: t.status === "COMPLETED",
        categoryId: t.categoryId,
        displayOrder: t.displayOrder,
        date: t.date,
        recurrenceId: t.recurrenceId,
        occurrenceDate: t.occurrenceDate,
      }));
  }, [rawTodos]);

  const {mutateAsync: createTodoMutateAsync} = useCreateTodoMutation();
  const {mutateAsync: moveTodoTomorrowMutateAsync} =
    useMoveTodoTomorrowMutation();
  const {mutateAsync: moveTodoTodayMutateAsync} = useMoveTodoTodayMutation();
  const {mutateAsync: deleteTodoMutateAsync} = useDeleteTodoMutation();
  const {mutateAsync: deleteRecurrenceTodosMutateAsync} =
    useDeleteRecurrenceTodosMutation();
  const {mutateAsync: toggleCompletionMutateAsync} =
    useToggleTodoCompletionMutation();
  const {mutateAsync: reorderTodosMutateAsync} = useReorderHomeTodosMutation();

  const [selectedTodoId, setSelectedTodoId] = useState(null);

  const editor = useTodoEditorController({
    categories,
    selectedDate: date, // ✅ 핵심
    onSubmitTodo: async ({todo, text, categoryId, date}) => {
      if (!todo?.id) {
        await createTodoMutateAsync({
          description: text,
          categoryId,
          date, // ✅ 선택 날짜로 생성
        });
        return;
      }
      // edit 모드 업데이트는 추후 추가
    },
  });

  const isRecurringTodo = (todo) => {
    const rid = todo?.recurrenceId;
    return rid !== null && rid !== undefined && Number(rid) !== 0;
  };

  const handleRequestDeleteTodo = useCallback(
    async (todo) => {
      const todoId = Number(todo?.id);
      if (!todoId) return;

      if (isRecurringTodo(todo)) {
        const recurrenceId = Number(todo.recurrenceId);

        open({
          title: "반복 일정 삭제",
          showClose: true,
          closeOnBackdrop: true,
          primary: {
            label: "이번 투두만 삭제할래요",
            variant: "outline",
            closeAfterPress: false,
            onPress: async () => {
              await deleteTodoMutateAsync({todoId});
              close();
            },
          },
          secondary: {
            label: "모든 반복 투두를 삭제할래요",
            variant: "outline",
            closeAfterPress: false,
            onPress: async () => {
              await deleteRecurrenceTodosMutateAsync({recurrenceId});
              close();
            },
          },
        });

        return;
      }

      await deleteTodoMutateAsync({todoId});
    },
    [open, close, deleteTodoMutateAsync, deleteRecurrenceTodosMutateAsync],
  );

  const handlePressTodoInput = useCallback(
    (payload) => {
      const id = payload?.id ? Number(payload.id) : null;
      setSelectedTodoId(id);
      editor.openEditor?.(payload);
    },
    [editor],
  );

  return (
    <>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 36}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TodoCard
          navigation={navigation}
          onPressInput={handlePressTodoInput}
          categories={categories}
          todos={todos}
          isViewingToday={isViewingToday}
          onDoToday={async (todoId) => {
            return new Promise((resolve) => {
              open({
                title: "확인",
                description:
                  "투두가 오늘 날짜로 이동하며,\n기존 날짜의 투두는 삭제돼요. 오늘 하기로 설정할까요?",
                closeOnBackdrop: true,
                showClose: true,
                primary: {
                  label: "네, 설정할래요",
                  variant: "outline",
                  closeAfterPress: false,
                  onPress: async () => {
                    try {
                      await moveTodoTodayMutateAsync({todoId});
                      resolve(true);
                    } finally {
                      close();
                    }
                  },
                },
                secondary: {
                  label: "아니요, 그만둘래요",
                  variant: "outline",
                  closeAfterPress: true,
                  onPress: () => resolve(false),
                },
                onClose: () => resolve(false),
              });
            });
          }}
          onDoTomorrow={async (todoId) => {
            return new Promise((resolve) => {
              open({
                title: "확인",
                description:
                  "투두가 내일 날짜로 이동하며,\n기존 날짜의 투두는 삭제돼요. 내일 하기로 설정할까요?",
                closeOnBackdrop: true,
                showClose: true,
                primary: {
                  label: "네, 설정할래요",
                  variant: "outline",
                  closeAfterPress: false,
                  onPress: async () => {
                    try {
                      await moveTodoTomorrowMutateAsync({todoId});
                      resolve(true);
                    } finally {
                      close();
                    }
                  },
                },
                secondary: {
                  label: "아니요, 그만둘래요",
                  variant: "outline",
                  closeAfterPress: true,
                  onPress: () => resolve(false),
                },
                onClose: () => resolve(false),
              });
            });
          }}
          onDeleteTodo={handleRequestDeleteTodo}
          onToggleTodoCompletion={async (todoId) => {
            await toggleCompletionMutateAsync({todoId: Number(todoId)});
          }}
          onReorderTodos={async ({ids}) => {
            await reorderTodosMutateAsync({date, ids});
          }}
        />
      </ScrollView>

      <TodoEditorSheet
        {...editor.sheetProps}
        todoId={selectedTodoId}
        onDismiss={() => {
          setSelectedTodoId(null);
          editor.sheetProps?.onDismiss?.();
        }}
      />
    </>
  );
}
