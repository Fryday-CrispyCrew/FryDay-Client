// src/features/todo/components/TodoBoardSection.jsx
import React, {useMemo, useState, useCallback, useRef} from "react";
import {Image, StyleSheet, View} from "react-native";
import {NestableScrollContainer} from "react-native-draggable-flatlist";
import TodoCard from "./TodoCard";
import TodoEditorSheet from "./TodoEditorSheet/TodoEditorSheet";
import ErrorImage from "../../../shared/assets/png/error-icon.png";
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import {useModalStore} from "../../../shared/stores/modal/modalStore";
import {toast} from "../../../shared/components/toast/CenterToast";

export default function TodoBoardSection({
  navigation,
  date, // ✅ Home/Calendar에서 넘겨주는 선택 날짜(YYYY-MM-DD)
  isViewingToday,
  ListHeaderComponent,
}) {
  const {open, close} = useModalStore();

  const {data: rawCategories = [], isError: isCategoriesError} =
    useCategoriesQuery();
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

  const {data: rawTodos = [], isError: isTodosError} = useHomeTodosQuery({
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
        memo: t.memo ?? "",
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
  const todoCardRef = useRef(null);

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
        todoCardRef.current?.openCategory?.(categoryId);
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
          description: "어떤 반복 일정을 삭제할까요?",
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

  const toYmd = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = toYmd(new Date());
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toYmd(d);
  })();

  const shouldShowBoardError = isCategoriesError && isTodosError;

  return (
    <>
      <NestableScrollContainer
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 36}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {ListHeaderComponent}
        {shouldShowBoardError ? (
          <View style={styles.errorContainer}>
            <Image
              source={ErrorImage}
              style={styles.errorImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <TodoCard
            ref={todoCardRef}
            navigation={navigation}
            onPressInput={handlePressTodoInput}
            categories={categories}
            todos={todos}
            isViewingToday={isViewingToday}
            onDoToday={async (todo) => {
              const todoId = Number(todo?.id);
              const isDone = !!todo?.done;
              const storageKey = isDone
                ? "doNotAsk_doTodayAgain"
                : "doNotAsk_doToday";

              const skip = await AsyncStorage.getItem(storageKey);
              if (skip === "true") {
                if (isDone) {
                  await createTodoMutateAsync({
                    description: todo?.title ?? "",
                    categoryId: todo?.categoryId,
                    date: todayStr,
                  });
                } else {
                  await moveTodoTodayMutateAsync({todoId});
                }
                toast.show("해당 튀김을 오늘 튀기기로 설정했어요");
                return true;
              }

              return new Promise((resolve) => {
                open({
                  title: isDone ? "오늘 또 하기" : "오늘 하기",
                  description: isDone
                    ? "투두가 오늘 날짜로 복사되며,\n완료한 기존 투두도 유지돼요.\n오늘 하기로 설정할까요?"
                    : "투두가 오늘 날짜로 이동하며,\n남은 기존 투두는 삭제돼요.\n오늘 하기로 설정할까요?",
                  closeOnBackdrop: true,
                  showClose: true,
                  showDoNotAskAgain: true,
                  primary: {
                    label: "네, 설정할래요",
                    variant: "outline",
                    closeAfterPress: false,
                    onPress: async (doNotAskAgain) => {
                      try {
                        if (doNotAskAgain) {
                          await AsyncStorage.setItem(storageKey, "true");
                        }
                        if (isDone) {
                          // ✅ 완료 투두: "복사" (기존 유지)
                          await createTodoMutateAsync({
                            description: todo?.title ?? "",
                            categoryId: todo?.categoryId,
                            date: todayStr,
                          });
                        } else {
                          // ✅ 미완료 투두: "이동"
                          await moveTodoTodayMutateAsync({todoId});
                        }
                        toast.show("해당 튀김을 오늘 튀기기로 설정했어요");

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
            onDoTomorrow={async (todo) => {
              const todoId = Number(todo?.id);
              const isDone = !!todo?.done;
              const storageKey = isDone
                ? "doNotAsk_doTomorrowAgain"
                : "doNotAsk_doTomorrow";

              const skip = await AsyncStorage.getItem(storageKey);
              if (skip === "true") {
                if (isDone) {
                  await createTodoMutateAsync({
                    description: todo?.title ?? "",
                    categoryId: todo?.categoryId,
                    date: tomorrowStr,
                  });
                } else {
                  await moveTodoTomorrowMutateAsync({todoId});
                }
                toast.show("해당 튀김을 내일 튀기기로 설정했어요");
                return true;
              }

              return new Promise((resolve) => {
                open({
                  title: isDone ? "내일 또 하기" : "내일 하기",
                  description: isDone
                    ? "투두가 내일 날짜로 복사되며,\n완료한 기존 투두도 유지돼요.\n내일 하기로 설정할까요?"
                    : "투두가 내일 날짜로 이동하며,\n남은 기존 투두는 삭제돼요.\n내일 하기로 설정할까요?",
                  closeOnBackdrop: true,
                  showClose: true,
                  showDoNotAskAgain: true,
                  primary: {
                    label: "네, 설정할래요",
                    variant: "outline",
                    closeAfterPress: false,
                    onPress: async (doNotAskAgain) => {
                      try {
                        if (doNotAskAgain) {
                          await AsyncStorage.setItem(storageKey, "true");
                        }
                        if (isDone) {
                          // ✅ 완료 투두: "복사"
                          await createTodoMutateAsync({
                            description: todo?.title ?? "",
                            categoryId: todo?.categoryId,
                            date: tomorrowStr,
                          });
                        } else {
                          // ✅ 미완료 투두: "이동"
                          await moveTodoTomorrowMutateAsync({todoId});
                        }
                        toast.show("해당 튀김을 내일 튀기기로 설정했어요");
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
        )}
      </NestableScrollContainer>

      <TodoEditorSheet
        {...editor.sheetProps}
        todoId={selectedTodoId}
        onEditSuccess={(categoryId) =>
          todoCardRef.current?.openCategory?.(categoryId)
        }
        onDismiss={() => {
          setSelectedTodoId(null);
          editor.sheetProps?.onDismiss?.();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorImage: {
    width: 180,
    height: 180,
  },
});
