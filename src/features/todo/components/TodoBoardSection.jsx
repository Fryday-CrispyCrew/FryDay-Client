import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TodoEditorSheet from "./TodoEditorSheet/TodoEditorSheet";
import TodoBoardSkeleton from "./TodoBoardSkeleton";
import { useTodoEditorController } from "../hooks/useTodoEditorController";

import AppText from "../../../shared/components/AppText";
import DragHandleIcon from "../assets/svg/DragHandle.svg";
import DeleteIcon from "../assets/svg/Delete.svg";
import StartDateIcon from "../assets/svg/StartDate.svg";
import TomorrowIcon from "../assets/svg/Tomorrow.svg";
import TodoRadioOnIcon from "../assets/svg/RadioOn.svg";
import TodoRadioOffIcon from "../assets/svg/RadioOff.svg";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import PlusIcon from "../assets/svg/Plus.svg";
import Dotted from "../../calendar/assets/svg/Dotted.svg";

import { useCategoriesQuery } from "../queries/category/useCategoriesQuery";
import { useCreateTodoMutation } from "../queries/sheet/useCreateTodoMutation";
import { useMoveTodoTomorrowMutation } from "../queries/home/useMoveTodoTomorrowMutation";
import { useMoveTodoTodayMutation } from "../queries/home/useMoveTodoTodayMutation";
import { useDeleteTodoMutation } from "../queries/home/useDeleteTodoMutation";
import { useToggleTodoCompletionMutation } from "../queries/home/useToggleTodoCompletionMutation";
import { useReorderHomeTodosMutation } from "../queries/home/useReorderHomeTodosMutation";
import { useDeleteRecurrenceTodosMutation } from "../queries/home/useDeleteRecurrenceTodosMutation";

import { useModalStore } from "../../../shared/stores/modal/modalStore";
import { toast } from "../../../shared/components/toast/CenterToast";
import colors from "../../../shared/styles/colors";
import { Swipeable } from "react-native-gesture-handler";
import BorderButton from "../../../shared/components/BorderButton";
import CategoryIcon from "../../../shared/assets/svg/Category.svg";
import { useUpdateTodoMemoMutation } from "../queries/sheet/content/useUpdateTodoMemoMutation";
import { useSetTodoAlarmMutation } from "../queries/sheet/alarm/useSetTodoAlarmMutation";
import { useCreateTodoRecurrenceMutation } from "../queries/sheet/repeat/useCreateTodoRecurrenceMutation";
import { useUpdateTodoDateMutation } from "../queries/sheet/date/useUpdateTodoDateMutation";

function Chevron({ isOpen, color }) {
  return (
    <ChevronIcon
      direction={isOpen ? "up" : "down"}
      size={14}
      color={color}
      strokeWidth={2}
    />
  );
}

function TodoItem({
  item,
  isActive,
  onToggleDone,
  onDelete,
  onLongPressDrag,
  onPressItem,
  onDoToday,
  onDoTomorrow,
  isViewingToday,
  categoryColor,
}) {
  const renderRightActions = () => (
    <View className="flex-row items-center pr-[2px]">
      <TouchableOpacity
        style={{ backgroundColor: categoryColor }}
        className="mr-1.5 h-[35px] w-12 items-center justify-center rounded-xl"
        activeOpacity={0.7}
        onPress={() => onDelete(item)}
      >
        <DeleteIcon width={24} height={24} />
      </TouchableOpacity>

      {isViewingToday ? (
        <TouchableOpacity
          style={{ borderColor: categoryColor }}
          className="h-[35px] w-12 items-center justify-center rounded-xl border-2 bg-white"
          activeOpacity={0.7}
          onPress={() => onDoTomorrow?.(item)}
        >
          <TomorrowIcon width={24} height={24} color={categoryColor} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ borderColor: categoryColor }}
          className="h-[35px] w-12 items-center justify-center rounded-xl border-2 bg-white"
          activeOpacity={0.7}
          onPress={() => onDoToday?.(item)}
        >
          <StartDateIcon width={24} height={24} color={categoryColor} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View>
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={30}
      >
        <View
          className="min-h-[36px] flex-row items-center rounded-xl bg-wt"
          style={isActive ? { backgroundColor: "#F2F2F2" } : undefined}
        >
          <TouchableOpacity
            onLongPress={onLongPressDrag}
            delayLongPress={180}
            hitSlop={8}
            className="mr-1.5 items-center justify-center px-1.5"
            activeOpacity={0.8}
          >
            <DragHandleIcon width={12} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-1"
            onPress={() => onPressItem?.(item)}
          >
            <AppText variant="M500" className="text-bk">
              {item.title ?? item.description ?? ""}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg px-1 py-1"
            activeOpacity={0.6}
            onPress={() => onToggleDone(item.id)}
          >
            {item.done ? (
              <TodoRadioOnIcon width={24} height={24} color={categoryColor} />
            ) : (
              <TodoRadioOffIcon width={24} height={24} />
            )}
          </TouchableOpacity>
        </View>
      </Swipeable>

      {item.memo ? (
        <AppText
          variant="M400"
          className="pl-[30px] pr-1.5 text-[12px] leading-[18px] text-gr500"
        >
          {item.memo}
        </AppText>
      ) : null}
    </View>
  );
}

function CategoryHeader({
  category,
  isOpen,
  isFirst,
  onToggleSection,
  onPressAddTodo,
}) {
  const color = category.color ?? colors.or;

  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingTop: isFirst ? 18 : 24 }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onToggleSection(category.categoryId)}
        style={{ backgroundColor: color }}
        className="flex-row items-center rounded-full px-2.5 py-1.5"
      >
        <AppText variant="M600" style={{ color: colors.wt }}>
          {category.label}
        </AppText>
        <View className="w-1" />
        <Chevron isOpen={isOpen} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPressAddTodo(category.categoryId)}
        className="px-1.5 py-2"
      >
        <View className="flex-row items-center gap-1">
          <AppText variant="M600" style={{ color }}>
            새 투두 튀기기
          </AppText>
          <PlusIcon width={14} height={14} color={color} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function TodoBoardSection({
  navigation,
  date,
  isViewingToday,
  ListHeaderComponent,
  todos: todosProp,
  setParentScrollEnabled,
}) {
  const { open, close } = useModalStore();

  const { data: rawCategories = [], isLoading: isCategoriesLoading } =
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

  const [todos, setTodos] = useState(Array.isArray(todosProp) ? todosProp : []);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [openMap, setOpenMap] = useState({});
  const [didInitOpenMap, setDidInitOpenMap] = useState(false);

  useEffect(() => {
    setTodos(Array.isArray(todosProp) ? todosProp : []);
  }, [todosProp]);

  useEffect(() => {
    if (didInitOpenMap) return;
    if (!Array.isArray(categories) || categories.length === 0) return;

    const initial = {};
    for (const c of categories) initial[c.categoryId] = true;
    setOpenMap(initial);
    setDidInitOpenMap(true);
  }, [categories, didInitOpenMap]);

  const { mutateAsync: createTodoMutateAsync } = useCreateTodoMutation();
  const { mutateAsync: moveTodoTomorrowMutateAsync } =
    useMoveTodoTomorrowMutation();
  const { mutateAsync: moveTodoTodayMutateAsync } = useMoveTodoTodayMutation();
  const { mutateAsync: deleteTodoMutateAsync } = useDeleteTodoMutation();
  const { mutateAsync: deleteRecurrenceTodosMutateAsync } =
    useDeleteRecurrenceTodosMutation();
  const { mutateAsync: toggleCompletionMutateAsync } =
    useToggleTodoCompletionMutation();
  const { mutateAsync: reorderTodosMutateAsync } =
    useReorderHomeTodosMutation();

  const { mutateAsync: updateMemoMutateAsync } =
    useUpdateTodoMemoMutation();

  const { mutateAsync: setAlarmMutateAsync } =
    useSetTodoAlarmMutation();

  const { mutateAsync: createRecurrenceMutateAsync } =
    useCreateTodoRecurrenceMutation();

  const { mutateAsync: updateTodoDateMutateAsync } =
    useUpdateTodoDateMutation();

  const editor = useTodoEditorController({
    categories,
    selectedDate: date,

    onSubmitTodo: async ({
                           todo,
                           text,
                           categoryId,
                           date: submitDate,
                           memo,
                           notifyAt,
                           recurrence,
                         }) => {
      if (!todo?.id) {
        const created = await createTodoMutateAsync({
          description: text,
          categoryId,
          date: submitDate,
        });

        const todoId = created?.data?.id ?? created?.id;

        if (!todoId) return;

        if (memo?.trim()) {
          await updateMemoMutateAsync({
            todoId,
            memo: memo.trim(),
          });
        }

        if (notifyAt) {
          await setAlarmMutateAsync({
            todoId,
            notifyAt,
          });
        }

        if (recurrence) {
          await createRecurrenceMutateAsync({
            todoId,
            ...recurrence,
          });
        }

        if (submitDate) {
          await updateTodoDateMutateAsync({
            todoId,
            date: submitDate,
          });
        }

        setOpenMap((prev) => ({
          ...prev,
          [categoryId]: true,
        }));

        return;
      }
    },
  });

  const groupedTodos = useMemo(() => {
    const by = {};
    for (const c of categories) by[c.categoryId] = [];
    for (const t of todos) {
      const key = Number(t.categoryId);
      if (!by[key]) by[key] = [];
      by[key].push(t);
    }
    return by;
  }, [categories, todos]);

  const mergeByCategoryOrder = useCallback(
    (sourceGrouped) => {
      const merged = [];
      for (const c of categories) {
        merged.push(...(sourceGrouped[c.categoryId] ?? []));
      }
      return merged;
    },
    [categories],
  );

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
              await deleteTodoMutateAsync({ todoId });
              close();
            },
          },
          secondary: {
            label: "모든 반복 투두를 삭제할래요",
            variant: "outline",
            closeAfterPress: false,
            onPress: async () => {
              await deleteRecurrenceTodosMutateAsync({ recurrenceId });
              close();
            },
          },
        });

        return;
      }

      await deleteTodoMutateAsync({ todoId });
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

  const toggleTodoDone = useCallback(
    async (id) => {
      let prevDone = false;

      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id !== id) return todo;
          prevDone = !!todo.done;
          return { ...todo, done: !todo.done };
        }),
      );

      try {
        await toggleCompletionMutateAsync({ todoId: Number(id) });
      } catch (e) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id ? { ...todo, done: prevDone } : todo,
          ),
        );
      }
    },
    [toggleCompletionMutateAsync],
  );

  const handleToggleSection = useCallback((categoryId) => {
    setOpenMap((prev) => ({ ...prev, [categoryId]: !prev?.[categoryId] }));
  }, []);

  const handlePressAddTodo = useCallback(
    (categoryId) => {
      handlePressTodoInput({ id: null, title: "", categoryId, mode: "create" });
    },
    [handlePressTodoInput],
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

  const handleDoToday = useCallback(
    async (todo) => {
      const todoId = Number(todo?.id);
      const isDone = !!todo?.done;
      const storageKey = isDone ? "doNotAsk_doTodayAgain" : "doNotAsk_doToday";

      const skip = await AsyncStorage.getItem(storageKey);
      if (skip === "true") {
        if (isDone) {
          await createTodoMutateAsync({
            description: todo?.title ?? todo?.description ?? "",
            categoryId: todo?.categoryId,
            date: todayStr,
          });
        } else {
          await moveTodoTodayMutateAsync({ todoId });
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
                  await createTodoMutateAsync({
                    description: todo?.title ?? "",
                    categoryId: todo?.categoryId,
                    date: todayStr,
                  });
                } else {
                  await moveTodoTodayMutateAsync({ todoId });
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
    },
    [close, createTodoMutateAsync, moveTodoTodayMutateAsync, open, todayStr],
  );

  const handleDoTomorrow = useCallback(
    async (todo) => {
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
          await moveTodoTomorrowMutateAsync({ todoId });
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
                  await createTodoMutateAsync({
                    description: todo?.title ?? "",
                    categoryId: todo?.categoryId,
                    date: tomorrowStr,
                  });
                } else {
                  await moveTodoTomorrowMutateAsync({ todoId });
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
    },
    [
      close,
      createTodoMutateAsync,
      moveTodoTomorrowMutateAsync,
      open,
      tomorrowStr,
    ],
  );

  const handleDragEnd = useCallback(
    async (categoryId, data) => {
      const nextGrouped = { ...groupedTodos, [categoryId]: data };
      const merged = mergeByCategoryOrder(nextGrouped);

      setTodos(merged);

      const ids = merged
        .map((t) => Number(t.id))
        .filter((n) => Number.isFinite(n));

      try {
        await reorderTodosMutateAsync({ date, ids });
      } finally {
        setParentScrollEnabled?.(true);
      }
    },
    [
      date,
      groupedTodos,
      mergeByCategoryOrder,
      reorderTodosMutateAsync,
      setParentScrollEnabled,
    ],
  );

  const isBoardLoading = isCategoriesLoading;
  const [showBoardSkeleton, setShowBoardSkeleton] = useState(false);

  useEffect(() => {
    if (!isBoardLoading) {
      setShowBoardSkeleton(false);
      return;
    }
    const timer = setTimeout(() => setShowBoardSkeleton(true), 3000);
    return () => clearTimeout(timer);
  }, [isBoardLoading]);

  if (isBoardLoading && showBoardSkeleton) {
    return <TodoBoardSkeleton />;
  }

  return (
    <>
      <View className="pb-9">
        {ListHeaderComponent ? ListHeaderComponent : null}

        {categories.map((category, index) => {
          const categoryId = category.categoryId;
          const sectionTodos = groupedTodos[categoryId] ?? [];
          const isOpen = !!openMap?.[categoryId];
          const color = category.color ?? colors.or;

          return (
            <View key={categoryId}>
              <CategoryHeader
                category={category}
                isOpen={isOpen}
                isFirst={index === 0}
                onToggleSection={handleToggleSection}
                onPressAddTodo={handlePressAddTodo}
              />

              {isOpen ? (
                <DraggableFlatList
                  data={sectionTodos}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item, drag, isActive }) => (
                    <View className="pt-0.5">
                      <TodoItem
                        item={item}
                        isActive={isActive}
                        onToggleDone={toggleTodoDone}
                        onDelete={handleRequestDeleteTodo}
                        onDoToday={handleDoToday}
                        onDoTomorrow={handleDoTomorrow}
                        isViewingToday={isViewingToday}
                        categoryColor={color}
                        onLongPressDrag={drag}
                        onPressItem={(todo) =>
                          handlePressTodoInput({ ...todo, mode: "edit" })
                        }
                      />
                    </View>
                  )}
                  activationDistance={16}
                  dragItemOverflow={false}
                  scrollEnabled={false}
                  nestedScrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingTop: 8 }}
                  ItemSeparatorComponent={() => <View className="h-2" />}
                  onDragBegin={() => {
                    setParentScrollEnabled?.(false);
                  }}
                  onRelease={() => {
                    setParentScrollEnabled?.(true);
                  }}
                  onDragEnd={({ data }) => handleDragEnd(categoryId, data)}
                />
              ) : null}
            </View>
          );
        })}

        <View className="mx-5 mt-3">
          <Dotted width="100%" height={1} />
        </View>

        <View className="mt-[18px]">
          <BorderButton
            icon={<CategoryIcon/>}
            text={"카테고리 관리"}
            borderColor={colors.gr100}
            iconPosition="left"
            backgroundColor={colors.gr100}
            onPress={() =>
              navigation.navigate("Category", {
                screen: "CategList",
              })}
          />
        </View>
      </View>

      <TodoEditorSheet
        {...editor.sheetProps}
        todoId={selectedTodoId}
        onEditSuccess={(categoryId) =>
          setOpenMap((prev) => ({ ...prev, [categoryId]: true }))
        }
        onDismiss={() => {
          setSelectedTodoId(null);
          editor.sheetProps?.onDismiss?.();
        }}
      />
    </>
  );
}
