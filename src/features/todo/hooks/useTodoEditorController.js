import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, BackHandler, AppState } from "react-native";
import { useRepeatEditorStore } from "../stores/repeatEditorStore";
import { useModalStore } from "../../../shared/stores/modal/modalStore";

export function useTodoEditorController({
                                          categories = [],
                                          onSubmitTodo,
                                          defaultCategoryId,
                                          selectedDate,
                                        } = {}) {
  const bottomSheetRef = useRef(null);
  const isClosingRef = useRef(false);
  const { open, close } = useModalStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const initialFallbackCategoryId =
    defaultCategoryId ?? categories?.[0]?.categoryId ?? 0;

  const [sheetInitialCategoryId, setSheetInitialCategoryId] = useState(
    initialFallbackCategoryId,
  );

  const sheetCategory = useMemo(() => {
    const found = categories.find(
      (c) => c.categoryId === sheetInitialCategoryId,
    );

    return found ?? categories[0] ?? { categoryId: 0, label: "카테고리" };
  }, [categories, sheetInitialCategoryId]);

  const sheetMode = editingTodo?.id ? "edit" : "create";

  const closeEditorTogether = useCallback(() => {
    isClosingRef.current = true;
    bottomSheetRef.current?.dismiss?.();
  }, []);

  const closeEditorAfterSubmit = useCallback(() => {
    isClosingRef.current = true;
    Keyboard.dismiss();
    bottomSheetRef.current?.dismiss?.();
  }, []);

  const requestCloseEditorTogether = useCallback(() => {
    Keyboard.dismiss();
    open({
      title: "투두 설정 그만두기",
      description:
        "아직 투두가 저장되지 않았어요!\n정말 작성을 그만두시겠어요?",
      showClose: true,
      closeOnBackdrop: true,
      primary: {
        label: "네, 그만둘래요",
        variant: "outline",
        closeAfterPress: false,
        onPress: () => {
          closeEditorTogether();
          close();
        },
      },
      secondary: {
        label: "아니요, 계속 쓸래요",
        variant: "outline",
        closeAfterPress: true,
        onPress: () => {},
      },
    });
  }, [open, close, closeEditorTogether]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!isSheetOpen) return false;

      requestCloseEditorTogether();
      return true;
    });

    return () => sub.remove();
  }, [isSheetOpen, requestCloseEditorTogether]);

  const openEditor = useCallback(
    (todo) => {
      const nextCategoryId =
        todo?.categoryId ??
        categories?.[0]?.categoryId ??
        initialFallbackCategoryId;

      setSheetInitialCategoryId(nextCategoryId);
      setEditingTodo(todo ?? null);

      if (todo?.mode === "create") {
        useRepeatEditorStore.getState().resetRepeat();
      }
      if (todo?.mode === "edit") {
        useRepeatEditorStore.getState().setRepeatAll({
          repeatCycle: todo.repeatCycle ?? "unset",
          repeatStartDate: todo.repeatStartDate
            ? new Date(todo.repeatStartDate)
            : null,
          repeatEndType: todo.repeatEndType ?? "unset",
          repeatEndDate: todo.repeatEndDate
            ? new Date(todo.repeatEndDate)
            : null,
          repeatAlarm: todo.repeatAlarm ?? "unset",
          repeatAlarmTime: todo.repeatAlarmTime ?? null,
          repeatWeekdays: todo.repeatWeekdays ?? [],
          repeatMonthDays: todo.repeatMonthDays ?? [],
          repeatYearMonths: todo.repeatYearMonths ?? [],
          repeatYearDays: todo.repeatYearDays ?? [],
        });
      }

      bottomSheetRef.current?.present?.();
      setIsSheetOpen(true);
    },
    [categories, initialFallbackCategoryId],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", () => {});

    return () => {
      subscription?.remove();
    };
  }, []);

  const onDismiss = useCallback(() => {
    isClosingRef.current = false;
    setEditingTodo(null);
    setIsSheetOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (payloadOrCategoryId, maybeText) => {
      const isPayload =
        payloadOrCategoryId &&
        typeof payloadOrCategoryId === "object" &&
        !Array.isArray(payloadOrCategoryId);

      const trimmed = isPayload
        ? (payloadOrCategoryId.description ?? "").trim()
        : (maybeText ?? "").trim();

      if (!editingTodo?.id && trimmed.length === 0) {
        closeEditorTogether();
        return;
      }

      const resolvedCategoryId =
        (isPayload ? payloadOrCategoryId.categoryId : payloadOrCategoryId) ??
        sheetCategory?.categoryId ??
        sheetInitialCategoryId ??
        0;

      if (typeof onSubmitTodo === "function") {
        await onSubmitTodo({
          todo: editingTodo,
          text: trimmed,
          categoryId: resolvedCategoryId,
          date: isPayload
            ? payloadOrCategoryId.date ?? selectedDate
            : selectedDate,
          memo: isPayload ? payloadOrCategoryId.memo : undefined,
          notifyAt: isPayload ? payloadOrCategoryId.notifyAt : undefined,
          recurrence: isPayload ? payloadOrCategoryId.recurrence : undefined,
          isCancelRecurrence: isPayload
            ? payloadOrCategoryId.isCancelRecurrence
            : false,
        });
      }

      closeEditorTogether();
    },
    [
      editingTodo,
      onSubmitTodo,
      closeEditorTogether,
      sheetCategory,
      sheetInitialCategoryId,
      selectedDate,
    ],
  );

  const sheetProps = useMemo(
    () => ({
      ref: bottomSheetRef,
      mode: sheetMode,
      selectedDate,
      initialValue: editingTodo?.title ?? "",
      onCloseTogether: requestCloseEditorTogether,
      onCloseAfterSubmit: closeEditorAfterSubmit,
      onDismiss,
      categoryLabel: sheetCategory?.label ?? "카테고리",
      categories,
      initialCategoryId: sheetCategory?.categoryId ?? 0,
      onSubmit: handleSubmit,
    }),
    [
      categories,
      requestCloseEditorTogether,
      closeEditorTogether,
      closeEditorAfterSubmit,
      editingTodo,
      handleSubmit,
      onDismiss,
      sheetCategory,
      sheetMode,
    ],
  );

  return {
    bottomSheetRef,
    editingTodo,
    sheetInitialCategoryId,
    sheetCategory,
    sheetMode,
    setEditingTodo,
    setSheetInitialCategoryId,
    openEditor,
    closeEditorTogether,
    requestCloseEditorTogether,
    handleSubmit,
    sheetProps,
  };
}