// src/features/todo/hooks/useTodoEditorController.js
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Keyboard, BackHandler} from "react-native";
import {useRepeatEditorStore} from "../stores/repeatEditorStore";
import {useModalStore} from "../../../shared/stores/modal/modalStore";

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
  selectedDate, // ✅ 추가: 홈/달력에서 선택된 날짜(YYYY-MM-DD)
} = {}) {
  const bottomSheetRef = useRef(null);
  const {open, close} = useModalStore();

  useEffect(() => {
    const subHide = Keyboard.addListener("keyboardDidHide", () => {
      // ✅ 키보드는 내려갔는데 시트가 떠있는 잔상(translate)이 남는 케이스 방지
      // Modal ref는 외부에서 forwardRef로 들어오니 ref 사용
      requestAnimationFrame(() => {
        bottomSheetRef?.current?.snapToIndex?.(0);
      });
    });

    return () => {
      subHide.remove();
    };
  }, [bottomSheetRef]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // 편집 대상 todo / 입력 텍스트
  const [editingTodo, setEditingTodo] = useState(null); // { id, title, categoryId } or null
  const [editingText, setEditingText] = useState("");

  // 바텀시트 "초기 선택 카테고리"
  const initialFallbackCategoryId =
    defaultCategoryId ?? categories?.[0]?.categoryId ?? 0;

  const [sheetInitialCategoryId, setSheetInitialCategoryId] = useState(
    initialFallbackCategoryId,
  );

  // 현재 sheet에서 보여줄 카테고리(라벨/색)
  const sheetCategory = useMemo(() => {
    const found = categories.find(
      (c) => c.categoryId === sheetInitialCategoryId,
    );
    return found ?? categories[0] ?? {categoryId: 0, label: "카테고리"};
  }, [categories, sheetInitialCategoryId]);

  // create / edit 모드
  const sheetMode = editingTodo?.id ? "edit" : "create";

  // Editor 닫기(키보드 + 시트 동시에)
  const closeEditorTogether = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.dismiss?.();
    // 상태 초기화는 onDismiss에서 통일
  }, []);

  // ✅ "닫으려 할 때" 항상 호출할 함수(모달 먼저)
  const requestCloseEditorTogether = useCallback(() => {
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
          closeEditorTogether(); // ✅ 여기서만 실제 dismiss
          close(); // ✅ 모달 닫기
        },
      },

      secondary: {
        label: "아니요, 계속 쓸래요",
        variant: "outline",
        closeAfterPress: true, // ModalHost가 자동 close
        onPress: () => {},
      },
    });
  }, [open, close, closeEditorTogether]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      // ✅ 바텀시트가 열려있을 때만 가로채기
      if (!isSheetOpen) return false;

      // ✅ 여기서 바로 dismiss 하지 말고, "그만둘까요?" 모달 띄우기
      requestCloseEditorTogether();
      return true; // ✅ 시스템 back 동작 막기
    });

    return () => sub.remove();
  }, [isSheetOpen, requestCloseEditorTogether]);

  // Editor 열기 (TodoCard에서 호출)
  const openEditor = useCallback(
    (todo) => {
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
          // ✅ 기존 todo에 반복이 없으면 'unset' 상태로 주입
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

  // 시트 dismiss 되었을 때 상태 초기화
  const onDismiss = useCallback(() => {
    setEditingTodo(null);
    setEditingText("");
    setIsSheetOpen(false);
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
          date: selectedDate, // ✅ 핵심: 선택 날짜도 같이 넘김
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
    ],
  );

  // TodoEditorSheet에 바로 꽂을 props 패키지
  const sheetProps = useMemo(
    () => ({
      ref: bottomSheetRef,
      mode: sheetMode,
      value: editingText,
      onChangeText: setEditingText,
      onCloseTogether: requestCloseEditorTogether, // ✅ 항상 모달 먼저
      onCloseAfterSubmit: closeEditorTogether, // ✅ 제출 성공 시 즉시 닫기
      onDismiss,
      categoryLabel: sheetCategory?.label ?? "카테고리",
      categories,
      initialCategoryId: sheetCategory?.categoryId ?? 0,
      onSubmit: (draftCategoryId) => handleSubmit(draftCategoryId),
    }),
    [
      categories,
      requestCloseEditorTogether,
      closeEditorTogether,
      editingText,
      handleSubmit,
      onDismiss,
      sheetCategory,
      sheetMode,
    ],
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
    closeEditorTogether, // (확정 닫기)
    requestCloseEditorTogether, // (모달 띄우는 닫기 요청)
    handleSubmit,

    // pre-bundled props
    sheetProps,
  };
}
