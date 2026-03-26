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
  AppState,
  StyleSheet,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { InteractionManager } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import Banner from "../../../../shared/components/Banner";
import ChevronIcon from "../../../../shared/components/ChevronIcon";
import { toast } from "../../../../shared/components/toast/CenterToast";

import MemoIcon from "../../assets/svg/todoEditorSheet/memo.svg";
import AlarmIcon from "../../assets/svg/todoEditorSheet/alarm.svg";
import RepeatIcon from "../../assets/svg/todoEditorSheet/repeat.svg";
import SelectDateIcon from "../../assets/svg/todoEditorSheet/calendarSelect.svg";

import { useRepeatEditorStore } from "../../stores/repeatEditorStore";

import RepeatSettingsSection from "../RepeatSettingsSection/RepeatSettingsSection";
import YearMonthWheelModal from "../RepeatSettingsSection/wheel/YearMonthWheelModal";
import AlarmTimeSettingSection from "./AlarmTimeSettingsSection";

import CategorySelector from "./components/CategorySelector";
import TitleInputSection from "./components/TitleInputSection";
import MemoSection from "./components/MemoSection";
import EditToolsRow from "./components/EditToolsRow";

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

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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
  if (!raw)
    return { weekdays: [], monthDays: [], yearMonths: [], yearDays: [] };

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

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const addMonths = (date, delta) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const buildMonthGrid = (monthDate) => {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDow = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];

  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(y, m, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
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

  const inputRef = useRef(null);
  const memoInputRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const selectedToolKeyRef = useRef(null);
  const isToolTransitioningRef = useRef(false);
  const sheetReadyTimerRef = useRef(null);
  const hasInitializedMemoRef = useRef(false);

  const [editingText, setEditingText] = useState(initialValue ?? "");
  const [memoText, setMemoText] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState(initialCategoryId);
  const isSubmitEnabled = editingText.trim().length > 0;

  const [selectedToolKey, setSelectedToolKey] = useState(null);
  const [isSheetReady, setIsSheetReady] = useState(false);

  const [alarmDraftDate, setAlarmDraftDate] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState(null);
  const [hasPickedAlarmTime, setHasPickedAlarmTime] = useState(false);
  const [isIosInlineAlarmPickerOpen, setIsIosInlineAlarmPickerOpen] =
    useState(false);

  const [openRepeatDropdownKey, setOpenRepeatDropdownKey] = useState(null);

  const [todoDate, setTodoDate] = useState(new Date());
  const [draftTodoDate, setDraftTodoDate] = useState(new Date());
  const [hasAppliedTodoDate, setHasAppliedTodoDate] = useState(false);
  const [todoMonthCursor, setTodoMonthCursor] = useState(() => {
    const base = new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [isTodoYearMonthWheelOpen, setIsTodoYearMonthWheelOpen] =
    useState(false);
  const [todoWheelInitialYear, setTodoWheelInitialYear] = useState(
    todoMonthCursor.getFullYear(),
  );
  const [todoWheelInitialMonth, setTodoWheelInitialMonth] = useState(
    todoMonthCursor.getMonth() + 1,
  );

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

  const isMemoOpen = mode === "edit" && selectedToolKey === "memo";
  const isAlarmOpen = mode === "edit" && selectedToolKey === "alarm";
  const isRepeatOpen = mode === "edit" && selectedToolKey === "repeat";
  const isSelectDateOpen = mode === "edit" && selectedToolKey === "select";

  const todoMonthGrid = useMemo(
    () => buildMonthGrid(todoMonthCursor),
    [todoMonthCursor],
  );

  const today = useMemo(() => new Date(), []);

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
    selectedToolKeyRef.current = selectedToolKey;
  }, [selectedToolKey]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const blurAllInputs = useCallback(() => {
    inputRef.current?.blur?.();
    memoInputRef.current?.blur?.();
    setIsTitleFocused(false);
    setIsMemoFocused(false);
    Keyboard.dismiss();
  }, []);

  const isReturningFromBackgroundRef = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "inactive" || nextState === "background") {
        blurAllInputs();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [blurAllInputs]);

  useEffect(() => {
    if (!isRepeatOpen) setOpenRepeatDropdownKey(null);
  }, [isRepeatOpen]);

  useEffect(() => {
    if (isAlarmOpen) {
      if (!alarmTime) {
        setHasPickedAlarmTime(false);
        setAlarmDraftDate(new Date());
      }
      if (alarmTime) setHasPickedAlarmTime(true);
    }
  }, [isAlarmOpen, alarmTime]);

  useEffect(() => {
    if (!isAlarmOpen) setIsIosInlineAlarmPickerOpen(false);
  }, [isAlarmOpen]);

  useEffect(() => {
    if (!isSelectDateOpen) return;
    const base = todoDate ?? new Date();
    setDraftTodoDate(base);
    setTodoMonthCursor(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [isSelectDateOpen, todoDate]);

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
    if (categoryId != null) setDraftCategoryId(categoryId);
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
  }, [mode, numericTodoId, todoDetail]);

  const toggleRepeatDropdown = useCallback((key) => {
    setOpenRepeatDropdownKey((prev) => (prev === key ? null : key));
  }, []);

  const focusTitleInput = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, []);

  const blurMemoOnly = useCallback(() => {
    memoInputRef.current?.blur?.();
    setIsMemoFocused(false);
  }, []);

  const closePanelAndFocusTitle = useCallback(
    (closingKey) => {
      setSelectedToolKey(null);
      blurMemoOnly();

      if (closingKey === "alarm") {
        setIsIosInlineAlarmPickerOpen(false);
      }

      setIsTitleFocused(true);
      focusTitleInput();
    },
    [blurMemoOnly, focusTitleInput],
  );

  const openToolAfterKeyboardDismiss = useCallback((key) => {
    inputRef.current?.blur?.();
    memoInputRef.current?.blur?.();
    setIsTitleFocused(false);
    setIsMemoFocused(false);
    Keyboard.dismiss();

    isToolTransitioningRef.current = true;

    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setSelectedToolKey(key);
        setTimeout(() => {
          isToolTransitioningRef.current = false;
        }, 400);
      });
    });
  }, []);

  const onSelectTool = useCallback(
    (key) => {
      const current = selectedToolKeyRef.current;

      if (current === key) {
        if (key === "alarm") setIsIosInlineAlarmPickerOpen(false);
        setSelectedToolKey(null);
        setIsTitleFocused(true);
        focusTitleInput();
        return;
      }

      if (key === "memo") {
        setSelectedToolKey("memo");
        return;
      }

      if (key === "alarm") setIsIosInlineAlarmPickerOpen(false);
      openToolAfterKeyboardDismiss(key);
    },
    [focusTitleInput, openToolAfterKeyboardDismiss],
  );

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
    [focusTitleInput],
  );

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

  const handlePickCategory = useCallback((categoryId) => {
    setDraftCategoryId(categoryId);
    setIsCategoryOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, []);

  const handleClearText = useCallback(() => {
    setEditingText("");
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, []);

  const handlePickTodoDateFromCalendar = useCallback((date) => {
    if (!date) return;

    const today0 = startOfDay(new Date());
    const picked0 = startOfDay(date);

    if (picked0 < today0) {
      toast.show("과거 날짜로는 이동할 수 없어요.");
      return;
    }

    setDraftTodoDate(date);
  }, []);

  const handleApplyTodoDate = useCallback(() => {
    if (!draftTodoDate) return;
    setTodoDate(draftTodoDate);
    setHasAppliedTodoDate(true);
    closePanelAndFocusTitle("select");
  }, [draftTodoDate, closePanelAndFocusTitle]);

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
  }, [initialCategoryId, onDismiss, resetEditHydrationRefs]);

  const hasEditChanges = useMemo(() => {
    if (mode !== "edit") return true;

    const initial = initialRef.current;
    if (!initial.todoId) return false;

    if (normalizeDesc(initial.description) !== normalizeDesc(editingText))
      return true;

    if (initial.categoryId != null && initial.categoryId !== draftCategoryId)
      return true;

    if (normalizeMemo(initial.memo) !== normalizeMemo(memoText)) return true;

    const initialNotifyAt = initial.notifyAt;
    const currentNotifyAt = hasPickedAlarmTime
      ? buildNotifyAt({ dateStr: todoDetail?.date, timeStr: alarmTime })
      : null;

    if (initialNotifyAt !== currentNotifyAt) return true;

    if (hasAppliedTodoDate) {
      const nextDateStr = toYYYYMMDD(todoDate);
      if (nextDateStr && nextDateStr !== (todoDetail?.date ?? null))
        return true;
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

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing
      maxDynamicContentSize={700}
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

            <View className="flex-row items-center pb-4">
              <TitleInputSection
                mode="create"
                inputRef={inputRef}
                value={editingText}
                onChangeText={setEditingText}
                onSubmitEditing={handleSubmitInternal}
                isFocused={isTitleFocused}
                setIsFocused={setIsTitleFocused}
                onClear={handleClearText}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSubmitInternal}
                disabled={!isSubmitEnabled}
                className={`ml-2 h-11 w-11 items-center justify-center rounded-full ${
                  isSubmitEnabled ? "bg-[#FF5B22]" : "bg-[#E4E4E4]"
                }`}
              >
                <ChevronIcon
                  direction="right"
                  size={24}
                  // color={isSubmitEnabled ? colors.gr : colors.gr300}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>

            <MemoSection
              visible={isMemoOpen}
              memoInputRef={memoInputRef}
              value={memoText}
              onChangeText={(text) => {
                if (text.length > 100) {
                  toast.show("메모는 100자까지 입력 가능합니다.");
                  return;
                }
                setMemoText(text);
              }}
              isFocused={isMemoFocused}
              setIsFocused={setIsMemoFocused}
            />

            {mode === "edit" ? (
              <EditToolsRow
                icons={EDIT_TOOL_ICONS}
                selectedToolKey={selectedToolKey}
                onSelectTool={onSelectTool}
                onSubmit={handleSubmitInternal}
                submitDisabled={!isSubmitEnabled || !hasEditChanges}
              />
            ) : null}

            {isAlarmOpen && (
              <View className="min-h-[335px] pb-8">
                <View className="py-[15px]">
                  <ChevronIcon direction="down" size={0} color="transparent" />
                </View>

                <AlarmTimeSettingSection
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
              </View>
            )}

            <RepeatSettingsSection
              visible={isRepeatOpen}
              openKey={openRepeatDropdownKey}
              onToggleOpenKey={toggleRepeatDropdown}
            />

            {isSelectDateOpen && (
              <View className="min-h-[335px]">
                <View className="py-[15px]">
                  <View className="text-gr700" />
                </View>

                <View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        setTodoMonthCursor((d) => addMonths(d, -1))
                      }
                      className="h-6 w-6 items-center justify-center"
                      hitSlop={8}
                    >
                      <ChevronIcon
                        direction="left"
                        size={18}
                        color="#666666"
                        strokeWidth={2}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setTodoWheelInitialYear(todoMonthCursor.getFullYear());
                        setTodoWheelInitialMonth(
                          todoMonthCursor.getMonth() + 1,
                        );
                        setIsTodoYearMonthWheelOpen(true);
                      }}
                      hitSlop={8}
                    >
                      <View>
                        <ChevronIcon
                          direction="down"
                          size={0}
                          color="transparent"
                        />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setTodoMonthCursor((d) => addMonths(d, 1))}
                      className="h-6 w-6 items-center justify-center"
                      hitSlop={8}
                    >
                      <ChevronIcon
                        direction="right"
                        size={18}
                        color="#666666"
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="mb-3 mt-4 flex-row">
                    {WEEKDAYS.map((w, idx) => (
                      <View
                        key={w}
                        className="items-center justify-center"
                        style={{ width: `${100 / 7.01}%` }}
                      >
                        <View>
                          <ChevronIcon
                            direction="down"
                            size={0}
                            color="transparent"
                          />
                        </View>
                      </View>
                    ))}
                  </View>

                  <View
                    className="min-h-[150px] flex-row flex-wrap"
                    style={{ rowGap: 12 }}
                  >
                    {todoMonthGrid.map((cellDate, i) => {
                      const isEmpty = !cellDate;
                      const selected = cellDate
                        ? isSameDay(cellDate, draftTodoDate)
                        : false;
                      const isToday = cellDate
                        ? isSameDay(cellDate, today)
                        : false;
                      const useTodayStyle = isToday && !selected;

                      return (
                        <TouchableOpacity
                          key={`todo-d-${i}`}
                          disabled={isEmpty}
                          activeOpacity={0.85}
                          onPress={() =>
                            handlePickTodoDateFromCalendar(cellDate)
                          }
                          className="items-center justify-center"
                          style={{ width: `${100 / 7.01}%` }}
                        >
                          {isEmpty ? (
                            <View className="h-5 w-full" />
                          ) : (
                            <View
                              className={[
                                "h-5 w-full items-center justify-center",
                                selected
                                  ? "aspect-square rounded-full border border-[#FF5B22]"
                                  : "",
                                useTodayStyle
                                  ? "aspect-square rounded-full bg-[#FF5B22]"
                                  : "",
                              ].join(" ")}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View className="mt-4 items-end">
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleApplyTodoDate}
                    className="h-11 w-[100px] items-center justify-center rounded-2xl bg-[#FF5B22]"
                  >
                    <View>
                      <ChevronIcon
                        direction="down"
                        size={0}
                        color="transparent"
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                <YearMonthWheelModal
                  visible={isTodoYearMonthWheelOpen}
                  initialYear={todoWheelInitialYear}
                  initialMonth={todoWheelInitialMonth}
                  onCancel={() => setIsTodoYearMonthWheelOpen(false)}
                  onConfirm={(year, month) => {
                    setTodoMonthCursor(new Date(year, month - 1, 1));
                    setDraftTodoDate((prev) => {
                      const base = prev ?? new Date();
                      const day = base.getDate();
                      const lastDay = new Date(year, month, 0).getDate();
                      return new Date(year, month - 1, Math.min(day, lastDay));
                    });
                    setIsTodoYearMonthWheelOpen(false);
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default TodoEditorSheet;
