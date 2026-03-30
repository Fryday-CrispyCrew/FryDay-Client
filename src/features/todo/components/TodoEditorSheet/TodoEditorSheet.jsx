import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Pressable,
  TouchableOpacity,
  Keyboard,
  Platform,
  StyleSheet,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import Banner from "../../../../shared/components/Banner";
import { toast } from "../../../../shared/components/toast/CenterToast";

import MemoIcon from "../../assets/svg/todoEditorSheet/memo.svg";
import AlarmIcon from "../../assets/svg/todoEditorSheet/alarm.svg";
import RepeatIcon from "../../assets/svg/todoEditorSheet/repeat.svg";
import SelectDateIcon from "../../assets/svg/todoEditorSheet/calendarSelect.svg";

import { useRepeatEditorStore } from "../../stores/repeatEditorStore";

import RepeatSettingsSection from "../RepeatSettingsSection/RepeatSettingsSection";

import CategorySelector from "./components/CategorySelector";
import CreateTodoSection from "./CreateTodoSection";
import EditTodoSection from "./EditTodoSection";
import AlarmPanel from "./panels/AlarmPanel";

import { useTodoDetailQuery } from "../../queries/sheet/useTodoDetailQuery";
import { useUpdateTodoCategoryMutation } from "../../queries/sheet/content/useUpdateTodoCategoryMutation";
import { useUpdateTodoDescriptionMutation } from "../../queries/sheet/content/useUpdateTodoDescriptionMutation";
import { useUpdateTodoMemoMutation } from "../../queries/sheet/content/useUpdateTodoMemoMutation";
import { useSetTodoAlarmMutation } from "../../queries/sheet/alarm/useSetTodoAlarmMutation";
import { useDeleteTodoAlarmMutation } from "../../queries/sheet/alarm/useDeleteTodoAlarmMutation";
import { useCreateTodoRecurrenceMutation } from "../../queries/sheet/repeat/useCreateTodoRecurrenceMutation";
import { useUpdateRecurrenceRuleMutation } from "../../queries/sheet/repeat/useUpdateRecurrenceRuleMutation";
import { useUpdateTodoDateMutation } from "../../queries/sheet/date/useUpdateTodoDateMutation";
import { useDeleteTodoRecurrenceMutation } from "../../queries/sheet/repeat/useDeleteTodoRecurrenceMutation";

import useTodoEditorFocus from "./hooks/useTodoEditorFocus";
import useTodoEditorKeyboard from "./hooks/useTodoEditorKeyboard";
import useTodoEditorAppState from "./hooks/useTodoEditorAppState";
import useTodoEditorPanels from "./hooks/useTodoEditorPanels";
import useTodoEditorDate from "./hooks/useTodoEditorDate";
import SelectDatePanel from "./components/SelectDatePanel";

const API_TO_WEEKDAY = {
  MONDAY: "mon",
  TUESDAY: "tue",
  WEDNESDAY: "wed",
  THURSDAY: "thu",
  FRIDAY: "fri",
  SATURDAY: "sat",
  SUNDAY: "sun",
};

const WEEKDAY_TO_API = {
  mon: "MONDAY",
  tue: "TUESDAY",
  wed: "WEDNESDAY",
  thu: "THURSDAY",
  fri: "FRIDAY",
  sat: "SATURDAY",
  sun: "SUNDAY",
};

const recurrenceTypeToCycle = (type) => {
  switch (type) {
    case "DAILY":
      return "daily";
    case "WEEKLY":
      return "weekly";
    case "MONTHLY":
      return "monthly";
    case "YEARLY":
      return "yearly";
    default:
      return "unset";
  }
};

const ymdToDate = (ymd) => {
  if (!ymd) return null;
  const [y, m, d] = String(ymd).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const hhmmssToHHmm = (t) => {
  if (!t) return null;
  return String(t).slice(0, 5);
};

const parseFrequencyValues = ({ type, frequencyValues }) => {
  const raw = (frequencyValues ?? "").trim();
  if (!raw) {
    return { weekdays: [], monthDays: [], yearMonths: [], yearDays: [] };
  }

  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (type === "WEEKLY") {
    const weekdays = parts.map((p) => API_TO_WEEKDAY[p]).filter(Boolean);
    return { weekdays, monthDays: [], yearMonths: [], yearDays: [] };
  }

  if (type === "MONTHLY") {
    const monthDays = parts
      .map((p) => Number(p))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 31);

    return { weekdays: [], monthDays, yearMonths: [], yearDays: [] };
  }

  if (type === "YEARLY") {
    const months = [];
    const days = [];

    parts.forEach((p) => {
      const [mm, dd] = p.split("-").map((x) => Number(x));
      if (Number.isFinite(mm) && mm >= 1 && mm <= 12) months.push(mm);
      if (Number.isFinite(dd) && dd >= 1 && dd <= 31) days.push(dd);
    });

    return {
      weekdays: [],
      monthDays: [],
      yearMonths: Array.from(new Set(months)),
      yearDays: Array.from(new Set(days)),
    };
  }

  return { weekdays: [], monthDays: [], yearMonths: [], yearDays: [] };
};

const mapRecurrenceToRepeatStore = (recurrence) => {
  if (!recurrence) return null;

  const type = recurrence?.type ?? null;
  const cycle = recurrenceTypeToCycle(type);

  const repeatStartDate = ymdToDate(recurrence?.startDate);
  const endDate = recurrence?.endDate ?? null;
  const repeatEndType = endDate ? "date" : "none";
  const repeatEndDate = endDate ? ymdToDate(endDate) : null;

  const freqParsed = parseFrequencyValues({
    type,
    frequencyValues: recurrence?.frequencyValues,
  });

  const nt = recurrence?.notificationTime ?? null;

  let repeatAlarm = "unset";
  let repeatAlarmTime = null;

  if (nt) {
    if (nt === "09:00:00") {
      repeatAlarm = "morning9";
    } else {
      repeatAlarm = "custom";
      repeatAlarmTime = hhmmssToHHmm(nt);
    }
  }

  return {
    repeatStartDate,
    repeatEndType,
    repeatEndDate,
    repeatCycle: cycle,
    repeatWeekdays: freqParsed.weekdays,
    repeatMonthDays: freqParsed.monthDays,
    repeatYearMonths: freqParsed.yearMonths,
    repeatYearDays: freqParsed.yearDays,
    repeatAlarm,
    repeatAlarmTime,
  };
};

const normalizeMemo = (m) => (m ?? "").trim();
const normalizeDesc = (d) => (d ?? "").trim();

const toYYYYMMDD = (v) => {
  if (!v) return null;

  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return String(v).slice(0, 10);
};

const normalizeHHmm = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(":");
  if (parts.length < 2) return null;
  const hh = parts[0].trim().padStart(2, "0");
  const mm = parts[1].trim().padStart(2, "0");
  return `${hh}:${mm}`;
};

const toHHmmss = (timeStr) => {
  const hhmm = normalizeHHmm(timeStr);
  if (!hhmm) return null;
  return `${hhmm}:00`;
};

const buildNotifyAt = ({ dateStr, timeStr }) => {
  if (!dateStr) return null;
  const hhmm = normalizeHHmm(timeStr);
  if (!hhmm) return null;
  return `${dateStr}T${hhmm}:00`;
};

const buildCreateRecurrencePayload = (draft, { alarmTimeHHmm } = {}) => {
  if (!draft) return null;
  if (!draft.repeatCycle || draft.repeatCycle === "unset") return null;

  const type = String(draft.repeatCycle).toUpperCase();
  const startDate = toYYYYMMDD(draft.repeatStartDate);
  const endDate =
    draft.repeatEndType === "date" ? toYYYYMMDD(draft.repeatEndDate) : null;

  let frequencyValues = null;

  if (draft.repeatCycle === "weekly") {
    frequencyValues = (draft.repeatWeekdays ?? [])
      .map((k) => WEEKDAY_TO_API[k])
      .filter(Boolean);
  }

  if (draft.repeatCycle === "monthly") {
    frequencyValues = (draft.repeatMonthDays ?? [])
      .map((n) => String(Number(n)))
      .filter((s) => s !== "NaN");
  }

  if (draft.repeatCycle === "yearly") {
    const months = (draft.repeatYearMonths ?? []).map((n) => Number(n));
    const days = (draft.repeatYearDays ?? []).map((n) => Number(n));

    const out = [];
    months.forEach((m) => {
      days.forEach((d) => {
        if (!Number.isFinite(m) || !Number.isFinite(d)) return;
        out.push(`${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
      });
    });
    frequencyValues = out;
  }

  let notificationTime = null;
  if (draft.repeatAlarm === "morning9") notificationTime = "09:00:00";
  if (draft.repeatAlarm === "custom")
    notificationTime = toHHmmss(draft.repeatAlarmTime);
  if (draft.repeatAlarm === "sameTime")
    notificationTime = toHHmmss(alarmTimeHHmm);

  return { type, frequencyValues, startDate, endDate, notificationTime };
};

const buildInitialRecurrenceBodyFromDetail = (recurrence) => {
  if (!recurrence) return null;

  const type = recurrence?.type ?? null;
  if (!type) return null;

  const raw = (recurrence?.frequencyValues ?? "").trim();
  const parts = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    type,
    frequencyValues: type === "DAILY" ? null : parts,
    startDate: recurrence?.startDate ?? null,
    endDate: recurrence?.endDate ?? null,
    notificationTime: recurrence?.notificationTime ?? null,
  };
};

const stableRecurrenceBody = (body) => {
  if (!body) return null;

  const isDaily = body.type === "DAILY";
  const fv = isDaily
    ? null
    : Array.isArray(body.frequencyValues)
      ? [...body.frequencyValues].sort()
      : [];

  return {
    type: body.type ?? null,
    frequencyValues: fv,
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    notificationTime: body.notificationTime ?? null,
  };
};

const isSameRecurrenceBody = (a, b) =>
  JSON.stringify(stableRecurrenceBody(a)) ===
  JSON.stringify(stableRecurrenceBody(b));

const toHHmm = (notifyAtStr) => {
  if (!notifyAtStr) return null;
  const timePart = String(notifyAtStr).split("T")[1] ?? "";
  const hhmm = timePart.slice(0, 5);
  return hhmm.length === 5 ? hhmm : null;
};

const TodoEditorSheet = React.forwardRef(function TodoEditorSheet(
  {
    mode = "create",
    initialValue = "",
    onSubmit,
    onCloseTogether,
    onCloseAfterSubmit,
    onEditSuccess,
    onDismiss,
    categoryLabel = "카테고리",
    categories = [],
    initialCategoryId = 0,
    todoId = null,
  },
  ref,
) {
  const insets = useSafeAreaInsets();

  const isSubmittingRef = useRef(false);
  const sheetReadyTimerRef = useRef(null);
  const hasInitializedMemoRef = useRef(false);

  const [editingText, setEditingText] = useState(initialValue ?? "");
  const [memoText, setMemoText] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState(initialCategoryId);
  const [isSheetReady, setIsSheetReady] = useState(false);

  const [alarmDraftDate, setAlarmDraftDate] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState(null);
  const [hasPickedAlarmTime, setHasPickedAlarmTime] = useState(false);
  const [isIosInlineAlarmPickerOpen, setIsIosInlineAlarmPickerOpen] =
    useState(false);

  const isSubmitEnabled = editingText.trim().length > 0;

  const repeatSnapshot = useRepeatEditorStore(
    useShallow((s) => ({
      repeatCycle: s.repeatCycle,
      repeatStartDate: s.repeatStartDate,
      repeatEndType: s.repeatEndType,
      repeatEndDate: s.repeatEndDate,
      repeatAlarm: s.repeatAlarm,
      repeatAlarmTime: s.repeatAlarmTime,
      repeatWeekdays: s.repeatWeekdays,
      repeatMonthDays: s.repeatMonthDays,
      repeatYearMonths: s.repeatYearMonths,
      repeatYearDays: s.repeatYearDays,
    })),
  );

  const {
    inputRef,
    memoInputRef,
    focusTitleInput,
    blurMemoOnly,
    blurAllInputs,
  } = useTodoEditorFocus({
    setIsTitleFocused,
    setIsMemoFocused,
  });

  const { isKeyboardVisible } = useTodoEditorKeyboard();

  const { isReturningFromBackgroundRef } = useTodoEditorAppState({
    blurAllInputs,
  });

  const {
    selectedToolKey,
    setSelectedToolKey,
    openRepeatDropdownKey,
    toggleRepeatDropdown,
    isMemoOpen,
    isAlarmOpen,
    isRepeatOpen,
    isSelectDateOpen,
    closePanelAndFocusTitle,
    onSelectTool,
  } = useTodoEditorPanels({
    mode,
    blurMemoOnly,
    focusTitleInput,
    inputRef,
    memoInputRef,
    setIsTitleFocused,
    setIsMemoFocused,
    setIsIosInlineAlarmPickerOpen,
  });

  const {
    todoDate,
    setTodoDate,
    draftTodoDate,
    setDraftTodoDate,
    hasAppliedTodoDate,
    setHasAppliedTodoDate,
    todoMonthCursor,
    setTodoMonthCursor,
    isTodoYearMonthWheelOpen,
    setIsTodoYearMonthWheelOpen,
    todoWheelInitialYear,
    setTodoWheelInitialYear,
    todoWheelInitialMonth,
    setTodoWheelInitialMonth,
    todoMonthGrid,
    today,
    isSameDay,
    addMonths,
    handlePickTodoDateFromCalendar,
    handleApplyTodoDate,
  } = useTodoEditorDate({
    isSelectDateOpen,
    closePanelAndFocusTitle,
  });

  const numericTodoId = useMemo(() => {
    const n = Number(todoId);
    return Number.isFinite(n) ? n : null;
  }, [todoId]);

  const {
    data: todoDetail,
    isLoading: isTodoDetailLoading,
    isFetching: isTodoDetailFetching,
  } = useTodoDetailQuery(
    { todoId: numericTodoId },
    { enabled: mode === "edit" && !!numericTodoId },
  );

  const { mutateAsync: updateCategory } = useUpdateTodoCategoryMutation();
  const { mutateAsync: updateDescription } = useUpdateTodoDescriptionMutation();
  const { mutateAsync: updateMemo } = useUpdateTodoMemoMutation();
  const { mutateAsync: setAlarm } = useSetTodoAlarmMutation();
  const { mutateAsync: deleteAlarm } = useDeleteTodoAlarmMutation();
  const { mutateAsync: createRecurrence } = useCreateTodoRecurrenceMutation();
  const { mutateAsync: updateRecurrenceRule } =
    useUpdateRecurrenceRuleMutation();
  const { mutateAsync: updateTodoDate } = useUpdateTodoDateMutation();
  const { mutateAsync: deleteTodoRecurrence } =
    useDeleteTodoRecurrenceMutation();

  const initialRef = useRef({
    description: "",
    categoryId: null,
    memo: "",
    notifyAt: null,
    recurrenceId: null,
    todoId: null,
  });

  const initialRecurrencePayloadRef = useRef(null);

  const EDIT_TOOL_ICONS = [
    { key: "memo", Icon: MemoIcon },
    { key: "alarm", Icon: AlarmIcon },
    { key: "repeat", Icon: RepeatIcon },
    { key: "select", Icon: SelectDateIcon },
  ];

  const resetEditHydrationRefs = useCallback(() => {
    initialRef.current.todoId = null;
    initialRef.current.recurrenceId = null;
    hasInitializedMemoRef.current = false;
    initialRecurrencePayloadRef.current = null;
  }, []);

  useEffect(() => {
    setEditingText(initialValue ?? "");
  }, [initialValue]);

  useEffect(() => {
    setDraftCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    if (isAlarmOpen) {
      if (!alarmTime) {
        setHasPickedAlarmTime(false);
        setAlarmDraftDate(new Date());
      }
      if (alarmTime) {
        setHasPickedAlarmTime(true);
      }
    }
  }, [isAlarmOpen, alarmTime]);

  useEffect(() => {
    if (!isAlarmOpen) {
      setIsIosInlineAlarmPickerOpen(false);
    }
  }, [isAlarmOpen]);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!numericTodoId) return;
    if (!todoDetail) return;
    if (hasInitializedMemoRef.current) return;

    setMemoText(todoDetail?.memo ?? "");
    hasInitializedMemoRef.current = true;
  }, [mode, numericTodoId, todoDetail]);

  useEffect(() => {
    if (mode !== "edit" || !numericTodoId || !todoDetail) return;

    const currentRecurrenceId = todoDetail?.recurrence?.recurrenceId ?? null;

    if (
      initialRef.current.todoId === numericTodoId &&
      initialRef.current.recurrenceId === currentRecurrenceId
    ) {
      return;
    }

    const description = todoDetail?.description ?? "";
    const categoryId =
      typeof todoDetail?.categoryId === "number" ? todoDetail.categoryId : null;
    const memo = todoDetail?.memo ?? "";
    const notifyAt = todoDetail?.alarm?.notifyAt ?? null;
    const dateStr = todoDetail?.date ?? null;

    initialRef.current = {
      description,
      categoryId,
      memo,
      notifyAt,
      recurrenceId: currentRecurrenceId,
      todoId: numericTodoId,
    };

    setEditingText(description);
    if (categoryId != null) {
      setDraftCategoryId(categoryId);
    }
    setMemoText(memo);

    if (dateStr) {
      const injectedDate = ymdToDate(dateStr);
      if (injectedDate) {
        setTodoDate(injectedDate);
        setDraftTodoDate(injectedDate);
        setTodoMonthCursor(
          new Date(injectedDate.getFullYear(), injectedDate.getMonth(), 1),
        );
      }
    }

    setHasAppliedTodoDate(false);

    const hhmm = toHHmm(notifyAt);
    setAlarmTime(hhmm);
    setHasPickedAlarmTime(!!hhmm);

    if (hhmm) {
      const [h, m] = hhmm.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      setAlarmDraftDate(d);
    }

    const recurrence = todoDetail?.recurrence ?? null;
    const repeatStore = useRepeatEditorStore.getState();

    if (recurrence) {
      const mapped = mapRecurrenceToRepeatStore(recurrence);
      repeatStore.setRepeatAll(mapped);
      initialRecurrencePayloadRef.current = stableRecurrenceBody(
        buildInitialRecurrenceBodyFromDetail(recurrence),
      );
    } else {
      repeatStore.resetRepeat();
      initialRecurrencePayloadRef.current = null;
    }
  }, [
    mode,
    numericTodoId,
    todoDetail,
    setTodoDate,
    setDraftTodoDate,
    setTodoMonthCursor,
    setHasAppliedTodoDate,
  ]);

  const renderBackdrop = useCallback(
    (props) => (
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={isSheetReady ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onCloseTogether}>
          <BottomSheetBackdrop
            {...props}
            pressBehavior="none"
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.5}
          />
        </Pressable>

        <View
          className="absolute left-5 right-5 top-20 items-center"
          pointerEvents="box-auto"
        >
          <Banner />
        </View>
      </View>
    ),
    [isSheetReady, onCloseTogether],
  );

  const handlePickCategory = useCallback(
    (categoryId) => {
      setDraftCategoryId(categoryId);
      setIsCategoryOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus?.());
    },
    [inputRef],
  );

  const handleClearText = useCallback(() => {
    setEditingText("");
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, [inputRef]);

  const handleDismiss = useCallback(() => {
    setIsCategoryOpen(false);
    setDraftCategoryId(initialCategoryId);
    setSelectedToolKey(null);
    setMemoText("");
    setEditingText("");
    setHasAppliedTodoDate(false);
    setIsSheetReady(false);
    resetEditHydrationRefs();
    Keyboard.dismiss();
    onDismiss?.();
    isSubmittingRef.current = false;
  }, [
    initialCategoryId,
    onDismiss,
    resetEditHydrationRefs,
    setHasAppliedTodoDate,
    setSelectedToolKey,
  ]);

  const hasEditChanges = useMemo(() => {
    if (mode !== "edit") return true;

    const initial = initialRef.current;
    if (!initial.todoId) return false;

    if (normalizeDesc(initial.description) !== normalizeDesc(editingText)) {
      return true;
    }

    if (initial.categoryId != null && initial.categoryId !== draftCategoryId) {
      return true;
    }

    if (normalizeMemo(initial.memo) !== normalizeMemo(memoText)) {
      return true;
    }

    const initialNotifyAt = initial.notifyAt;
    const currentNotifyAt = hasPickedAlarmTime
      ? buildNotifyAt({ dateStr: todoDetail?.date, timeStr: alarmTime })
      : null;

    if (initialNotifyAt !== currentNotifyAt) {
      return true;
    }

    if (hasAppliedTodoDate) {
      const nextDateStr = toYYYYMMDD(todoDate);
      if (nextDateStr && nextDateStr !== (todoDetail?.date ?? null)) {
        return true;
      }
    }

    const repeatDraft = useRepeatEditorStore.getState().getRepeatPayload?.();
    const currentRepeatPayload = buildCreateRecurrencePayload(repeatDraft, {
      alarmTimeHHmm: hasPickedAlarmTime ? alarmTime : null,
    });

    const initialHasRecurrence = !!initial.recurrenceId;
    const isRepeatCleared = repeatDraft?.repeatCycle === "unset";

    if (initialHasRecurrence && isRepeatCleared) return true;
    if (!initial.recurrenceId && !!currentRepeatPayload) return true;

    if (
      initial.recurrenceId &&
      currentRepeatPayload &&
      !isSameRecurrenceBody(
        initialRecurrencePayloadRef.current,
        currentRepeatPayload,
      )
    ) {
      return true;
    }

    return false;
  }, [
    mode,
    editingText,
    draftCategoryId,
    memoText,
    hasPickedAlarmTime,
    alarmTime,
    todoDetail?.date,
    hasAppliedTodoDate,
    todoDate,
    repeatSnapshot,
  ]);

  const handleSubmitInternal = useCallback(async () => {
    if (mode !== "edit") {
      const text = (editingText ?? "").trim();
      if (!text) return;
      if (isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      onSubmit?.(draftCategoryId, text);

      Keyboard.dismiss();
      requestAnimationFrame(() => {
        ref?.current?.dismiss?.();
      });
      return;
    }

    if (!numericTodoId) return;

    const initial = initialRef.current;
    const currentDescription = normalizeDesc(editingText);
    const currentCategoryId = draftCategoryId;
    const currentMemo = normalizeMemo(memoText);
    const initialNotifyAt = initial.notifyAt;
    const currentNotifyAt = hasPickedAlarmTime
      ? buildNotifyAt({ dateStr: todoDetail?.date, timeStr: alarmTime })
      : null;

    const tasks = [];

    if (
      normalizeDesc(initial.description) !== currentDescription &&
      currentDescription.length > 0
    ) {
      tasks.push(
        updateDescription({
          todoId: numericTodoId,
          description: currentDescription,
        }),
      );
    }

    if (
      initial.categoryId != null &&
      initial.categoryId !== currentCategoryId
    ) {
      tasks.push(
        updateCategory({
          todoId: numericTodoId,
          categoryId: currentCategoryId,
        }),
      );
    }

    if (normalizeMemo(initial.memo) !== currentMemo) {
      tasks.push(updateMemo({ todoId: numericTodoId, memo: currentMemo }));
    }

    if (initialNotifyAt && !currentNotifyAt) {
      tasks.push(deleteAlarm({ todoId: numericTodoId }));
    } else if (initialNotifyAt !== currentNotifyAt && currentNotifyAt) {
      const alarmDate = new Date(currentNotifyAt);

      if (alarmDate < new Date()) {
        toast.show("알림 시간은 현재 시간 이후로 설정해야 합니다.");
        return;
      }

      tasks.push(
        setAlarm({ todoId: numericTodoId, notifyAt: currentNotifyAt }),
      );
    }

    const repeatDraft = useRepeatEditorStore.getState().getRepeatPayload?.();
    const repeatPayload = buildCreateRecurrencePayload(repeatDraft, {
      alarmTimeHHmm: hasPickedAlarmTime ? alarmTime : null,
    });

    const initialRecurrenceId = initial.recurrenceId;
    const initialHasRecurrence = !!initialRecurrenceId;
    const isRepeatCleared = repeatDraft?.repeatCycle === "unset";
    const shouldCreateRecurrence = !initialRecurrenceId && !!repeatPayload;
    const shouldUpdateRecurrence =
      !!initialRecurrenceId &&
      !!repeatPayload &&
      !isSameRecurrenceBody(initialRecurrencePayloadRef.current, repeatPayload);

    if (initialHasRecurrence && isRepeatCleared) {
      tasks.push(deleteTodoRecurrence({ todoId: Number(todoId) }));
    } else {
      if (shouldCreateRecurrence) {
        const hasRequired =
          repeatPayload?.type &&
          repeatPayload?.startDate &&
          (repeatPayload.type === "DAILY"
            ? true
            : Array.isArray(repeatPayload?.frequencyValues) &&
              repeatPayload.frequencyValues.length > 0);

        if (!hasRequired) {
          toast.show("반복 설정 정보를 다시 확인해주세요.");
          return;
        }

        tasks.push(
          createRecurrence({
            todoId: numericTodoId,
            ...repeatPayload,
          }),
        );
      }

      if (shouldUpdateRecurrence) {
        tasks.push(
          updateRecurrenceRule({
            recurrenceId: initialRecurrenceId,
            ...repeatPayload,
          }),
        );
      }
    }

    if (hasAppliedTodoDate) {
      const initialDateStr = todoDetail?.date ?? null;
      const nextDateStr = toYYYYMMDD(todoDate);

      if (nextDateStr && nextDateStr !== initialDateStr) {
        tasks.push(
          updateTodoDate({ todoId: numericTodoId, date: nextDateStr }),
        );
      }
    }

    if (tasks.length === 0) {
      onCloseAfterSubmit?.();
      return;
    }

    try {
      await Promise.all(tasks);
      onEditSuccess?.(draftCategoryId);
      onCloseAfterSubmit?.();
    } catch (e) {}
  }, [
    mode,
    editingText,
    draftCategoryId,
    memoText,
    hasPickedAlarmTime,
    alarmTime,
    todoDetail?.date,
    hasAppliedTodoDate,
    todoDate,
    numericTodoId,
    updateDescription,
    updateCategory,
    updateMemo,
    deleteAlarm,
    setAlarm,
    createRecurrence,
    updateRecurrenceRule,
    deleteTodoRecurrence,
    updateTodoDate,
    onSubmit,
    onEditSuccess,
    onCloseAfterSubmit,
    ref,
    todoId,
  ]);

  const handleSheetAnimate = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === -1 && toIndex >= 0) {
        if (!isReturningFromBackgroundRef.current) {
          focusTitleInput();
        }

        sheetReadyTimerRef.current = setTimeout(
          () => setIsSheetReady(true),
          Platform.OS === "ios" ? 1150 : 0,
        );
      }

      if (toIndex === -1) {
        if (sheetReadyTimerRef.current) {
          clearTimeout(sheetReadyTimerRef.current);
          sheetReadyTimerRef.current = null;
        }
        setIsSheetReady(false);
      }
    },
    [focusTitleInput, isReturningFromBackgroundRef],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing
      maxDynamicContentSize={550}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      onAnimate={handleSheetAnimate}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: "#FAFAFA" }}
      handleIndicatorStyle={{ backgroundColor: "#D0D0D0", width: "38.4%" }}
      enableContentPanningGesture={false}
      enablePanDownToClose={false}
      enableHandlePanningGesture={false}
    >
      <BottomSheetView>
        <View className="relative">
          {!isSheetReady && (
            <View
              style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
              pointerEvents="box-only"
            />
          )}

          <View
            className="px-5 pt-2"
            style={{ paddingBottom: isKeyboardVisible ? 0 : insets.bottom }}
          >
            <CategorySelector
              categories={categories}
              draftCategoryId={draftCategoryId}
              categoryLabel={categoryLabel}
              isCategoryOpen={isCategoryOpen}
              setIsCategoryOpen={setIsCategoryOpen}
              onPickCategory={handlePickCategory}
            />

            {mode === "create" ? (
              <CreateTodoSection
                inputRef={inputRef}
                editingText={editingText}
                setEditingText={setEditingText}
                handleSubmitInternal={handleSubmitInternal}
                isSubmitEnabled={isSubmitEnabled}
                isTitleFocused={isTitleFocused}
                setIsTitleFocused={setIsTitleFocused}
                handleClearText={handleClearText}
              />
            ) : (
              <EditTodoSection
                inputRef={inputRef}
                memoInputRef={memoInputRef}
                editingText={editingText}
                setEditingText={setEditingText}
                memoText={memoText}
                setMemoText={setMemoText}
                handleSubmitInternal={handleSubmitInternal}
                isSubmitEnabled={isSubmitEnabled}
                hasEditChanges={hasEditChanges}
                isTitleFocused={isTitleFocused}
                setIsTitleFocused={setIsTitleFocused}
                isMemoFocused={isMemoFocused}
                setIsMemoFocused={setIsMemoFocused}
                handleClearText={handleClearText}
                isMemoOpen={isMemoOpen}
                selectedToolKey={selectedToolKey}
                onSelectTool={onSelectTool}
                EDIT_TOOL_ICONS={EDIT_TOOL_ICONS}
              />
            )}
            <SelectDatePanel
              visible={isSelectDateOpen}
              todoMonthCursor={todoMonthCursor}
              setTodoMonthCursor={setTodoMonthCursor}
              draftTodoDate={draftTodoDate}
              setDraftTodoDate={setDraftTodoDate}
              today={today}
              todoMonthGrid={todoMonthGrid}
              isSameDay={isSameDay}
              addMonths={addMonths}
              handlePickDate={handlePickTodoDateFromCalendar}
              handleApply={handleApplyTodoDate}
              isWheelOpen={isTodoYearMonthWheelOpen}
              setIsWheelOpen={setIsTodoYearMonthWheelOpen}
              wheelYear={todoWheelInitialYear}
              setWheelYear={setTodoWheelInitialYear}
              wheelMonth={todoWheelInitialMonth}
              setWheelMonth={setTodoWheelInitialMonth}
            />

            <AlarmPanel
              visible={isAlarmOpen}
              alarmDraftDate={alarmDraftDate}
              alarmTime={alarmTime}
              hasPickedAlarmTime={hasPickedAlarmTime}
              isIosInlineAlarmPickerOpen={isIosInlineAlarmPickerOpen}
              setAlarmDraftDate={setAlarmDraftDate}
              setAlarmTime={setAlarmTime}
              setHasPickedAlarmTime={setHasPickedAlarmTime}
              setIsIosInlineAlarmPickerOpen={setIsIosInlineAlarmPickerOpen}
              todoDateStr={todoDetail?.date}
              onClosePanel={() => closePanelAndFocusTitle("alarm")}
            />

            <RepeatSettingsSection
              visible={isRepeatOpen}
              openKey={openRepeatDropdownKey}
              onToggleOpenKey={toggleRepeatDropdown}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default TodoEditorSheet;
