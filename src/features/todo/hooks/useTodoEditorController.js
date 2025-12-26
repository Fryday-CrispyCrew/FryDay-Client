// src/features/todo/hooks/useTodoEditorController.js
import {useCallback, useMemo, useRef, useState} from "react";
import {Keyboard} from "react-native";
import {useRepeatEditorStore} from "../stores/repeatEditorStore";

/**
 * TodoEditor(BottomSheet) 제어 훅
 * - HomeScreen/WeekScreen 어디서든 동일한 editor UX 재사용
 *
 * @param {Object} params
 * @param {Array} params.categories - [{ categoryId, label, color }, ...]
 * @param {(payload: { todo: any|null, text: string, categoryId: number }) => (void|Promise<void>)} [params.onSubmitTodo]
 * @param {number} [params.defaultCategoryId]
 */
export function useTodoEditorController({
  categories = [],
  onSubmitTodo,
  defaultCategoryId,
} = {}) {
  const bottomSheetRef = useRef(null);

  // 편집 대상 todo / 입력 텍스트
  const [editingTodo, setEditingTodo] = useState(null); // { id, title, categoryId } or null
  const [editingText, setEditingText] = useState("");

  // 바텀시트 "초기 선택 카테고리"
  const initialFallbackCategoryId =
    defaultCategoryId ?? categories?.[0]?.categoryId ?? 0;

  const [sheetInitialCategoryId, setSheetInitialCategoryId] = useState(
    initialFallbackCategoryId
  );

  // 현재 sheet에서 보여줄 카테고리(라벨/색)
  const sheetCategory = useMemo(() => {
    const found = categories.find(
      (c) => c.categoryId === sheetInitialCategoryId
    );
    return found ?? categories[0] ?? {categoryId: 0, label: "카테고리"};
  }, [categories, sheetInitialCategoryId]);

  // create / edit 모드
  const sheetMode = editingTodo?.id ? "edit" : "create";

  // Editor 열기 (TodoCard에서 호출)
  const openEditor = useCallback(
    (todo) => {
      console.log("todo", todo);
      const nextCategoryId =
        todo?.categoryId ??
        categories?.[0]?.categoryId ??
        initialFallbackCategoryId;

      setSheetInitialCategoryId(nextCategoryId);
      setEditingTodo(todo ?? null);
      setEditingText(todo?.title ?? "");

      if (todo?.mode === "create") {
        useRepeatEditorStore.getState().resetRepeat();
      }
      if (todo?.mode === "edit") {
        // ✅ 기존 todo의 repeat 값을 store에 주입
        useRepeatEditorStore.getState().setRepeatAll({
          repeatStartDate: todo.repeatStartDate
            ? new Date(todo.repeatStartDate)
            : new Date(),
          repeatEndType: todo.repeatEndType ?? "none",
          repeatEndDate: todo.repeatEndDate
            ? new Date(todo.repeatEndDate)
            : new Date(),
          repeatCycle: todo.repeatCycle ?? "unset",
          repeatAlarm: todo.repeatAlarm ?? "unset",
        });
      }

      bottomSheetRef.current?.present?.();
    },
    [categories, initialFallbackCategoryId]
  );

  // Editor 닫기(키보드 + 시트 동시에)
  const closeEditorTogether = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.dismiss?.();
    // 상태 초기화는 onDismiss에서 통일
  }, []);

  // 시트 dismiss 되었을 때 상태 초기화
  const onDismiss = useCallback(() => {
    setEditingTodo(null);
    setEditingText("");
  }, []);

  // submit
  const handleSubmit = useCallback(
    async (draftCategoryId) => {
      const trimmed = (editingText ?? "").trim();

      // create인데 텍스트가 비어있으면 그냥 닫기
      if (!editingTodo?.id && trimmed.length === 0) {
        closeEditorTogether();
        return;
      }

      const resolvedCategoryId =
        draftCategoryId ??
        sheetCategory?.categoryId ??
        sheetInitialCategoryId ??
        0;

      // 실제 저장/수정 로직은 화면에서 주입(react-query mutation 등)
      if (typeof onSubmitTodo === "function") {
        await onSubmitTodo({
          todo: editingTodo, // null이면 create
          text: trimmed,
          categoryId: resolvedCategoryId,
        });
      }

      closeEditorTogether();
    },
    [
      editingTodo,
      editingText,
      onSubmitTodo,
      closeEditorTogether,
      sheetCategory,
      sheetInitialCategoryId,
    ]
  );

  // TodoEditorSheet에 바로 꽂을 props 패키지
  const sheetProps = useMemo(
    () => ({
      ref: bottomSheetRef,
      mode: sheetMode,
      value: editingText,
      onChangeText: setEditingText,
      onCloseTogether: closeEditorTogether,
      onDismiss,
      categoryLabel: sheetCategory?.label ?? "카테고리",
      categories,
      initialCategoryId: sheetCategory?.categoryId ?? 0,
      onSubmit: (draftCategoryId) => handleSubmit(draftCategoryId),
    }),
    [
      categories,
      closeEditorTogether,
      editingText,
      handleSubmit,
      onDismiss,
      sheetCategory,
      sheetMode,
    ]
  );

  return {
    // refs
    bottomSheetRef,

    // state
    editingTodo,
    editingText,
    sheetInitialCategoryId,
    sheetCategory,
    sheetMode,

    // setters (필요시 화면에서 쓰게)
    setEditingTodo,
    setEditingText,
    setSheetInitialCategoryId,

    // actions
    openEditor,
    closeEditorTogether,
    handleSubmit,

    // pre-bundled props
    sheetProps,
  };
}
