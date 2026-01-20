// src/features/todo/components/TodoEditorSheet/TodoEditorSheet.jsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {InteractionManager} from "react-native";
import MemoIcon from "../../assets/svg/todoEditorSheet/memo.svg";
import AlarmIcon from "../../assets/svg/todoEditorSheet/alarm.svg";
import RepeatIcon from "../../assets/svg/todoEditorSheet/repeat.svg";
import SelectDateIcon from "../../assets/svg/todoEditorSheet/calendarSelect.svg";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRepeatEditorStore} from "../../stores/repeatEditorStore";
import RepeatSettingsSection from "../RepeatSettingsSection/RepeatSettingsSection";
import colors from "../../../../shared/styles/colors";
import AlarmTimeSettingSection from "./AlarmTimeSettingsSection";
import ChevronIcon from "../../../../shared/components/ChevronIcon";
import YearMonthWheelModal from "../RepeatSettingsSection/wheel/YearMonthWheelModal";
import {toast} from "../../../../shared/components/toast/CenterToast";
import ClearIcon from "../../../../shared/assets/svg/Clear.svg";

import {useTodoDetailQuery} from "../../queries/sheet/useTodoDetailQuery";

import {useUpdateTodoCategoryMutation} from "../../queries/sheet/content/useUpdateTodoCategoryMutation";
import {useUpdateTodoDescriptionMutation} from "../../queries/sheet/content/useUpdateTodoDescriptionMutation";
import {useUpdateTodoMemoMutation} from "../../queries/sheet/content/useUpdateTodoMemoMutation";
import {useSetTodoAlarmMutation} from "../../queries/sheet/alarm/useSetTodoAlarmMutation";
import {useDeleteTodoAlarmMutation} from "../../queries/sheet/alarm/useDeleteTodoAlarmMutation";
import {useCreateTodoRecurrenceMutation} from "../../queries/sheet/repeat/useCreateTodoRecurrenceMutation";
import {useUpdateRecurrenceRuleMutation} from "../../queries/sheet/repeat/useUpdateRecurrenceRuleMutation";
import {useUpdateTodoDateMutation} from "../../queries/sheet/date/useUpdateTodoDateMutation";
import {useDeleteTodoRecurrenceMutation} from "../../queries/sheet/repeat/useDeleteTodoRecurrenceMutation";

/**
 * ✅ BottomSheetTextInput만 분리 (IME-safe 로직 포함)
 * - 기존 로직 유지하면서 multiline 등 확장 props 추가
 */
function TodoBottomSheetTextInput({
  inputRef,
  value,
  onChangeText,
  onSubmitEditing,
  onEnabledChange,
  placeholder = "두근두근, 무엇을 튀겨볼까요?",
  maxLength = 20,
  style,
  multiline = false,
  blurOnSubmit = true,
  scrollEnabled = false,
  returnKeyType,
  onFocus,
  onBlur,
  autoFocus = false,
}) {
  const isSubmitEnabled = (value?.trim?.() ?? "").length > 0;

  const [localText, setLocalText] = useState(value);

  useEffect(() => {
    if (localText !== value) setLocalText(value);
  }, [value]);

  const onChangeLocalText = (text) => {
    setLocalText(text);
    onChangeText?.(text);
  };

  useEffect(() => {
    onEnabledChange?.(isSubmitEnabled);
  }, [isSubmitEnabled, onEnabledChange]);

  return (
    <BottomSheetTextInput
      ref={inputRef}
      value={localText}
      onChangeText={onChangeLocalText}
      placeholder={placeholder}
      placeholderTextColor="#C6C6C6"
      returnKeyType={returnKeyType ?? (multiline ? "default" : "done")}
      onSubmitEditing={onSubmitEditing}
      maxLength={maxLength}
      style={style}
      multiline={multiline}
      blurOnSubmit={blurOnSubmit}
      scrollEnabled={scrollEnabled}
      onFocus={onFocus}
      onBlur={onBlur}
      autoFocus={autoFocus}
    />
  );
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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

//날짜 비교 helper
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const buildMonthGrid = (monthDate) => {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth(); // 0~11
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDow = first.getDay(); // 0(일)~6(토)

  const daysInMonth = last.getDate();
  const cells = [];

  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(y, m, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
};

const API_TO_WEEKDAY = {
  MONDAY: "mon",
  TUESDAY: "tue",
  WEDNESDAY: "wed",
  THURSDAY: "thu",
  FRIDAY: "fri",
  SATURDAY: "sat",
  SUNDAY: "sun",
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

// "2026-01-30" -> Date
const ymdToDate = (ymd) => {
  if (!ymd) return null;
  // ✅ 로컬 00:00으로 맞추기
  const [y, m, d] = String(ymd).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// "09:00:00" -> "09:00"
const hhmmssToHHmm = (t) => {
  if (!t) return null;
  return String(t).slice(0, 5);
};

// recurrence.frequencyValues: "MONDAY,WEDNESDAY" / "25" / "1,15" / "03-30,12-25"
const parseFrequencyValues = ({type, frequencyValues}) => {
  const raw = (frequencyValues ?? "").trim();
  if (!raw) return {weekdays: [], monthDays: [], yearMonths: [], yearDays: []};

  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (type === "WEEKLY") {
    const weekdays = parts.map((p) => API_TO_WEEKDAY[p]).filter(Boolean);
    return {weekdays, monthDays: [], yearMonths: [], yearDays: []};
  }

  if (type === "MONTHLY") {
    const monthDays = parts
      .map((p) => Number(p))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 31);
    return {weekdays: [], monthDays, yearMonths: [], yearDays: []};
  }

  if (type === "YEARLY") {
    // "MM-dd" 들에서 month/day를 각각 뽑아 store 구조(월 배열 + 일 배열)에 맞춰 저장
    const months = [];
    const days = [];
    parts.forEach((p) => {
      const [mm, dd] = p.split("-").map((x) => Number(x));
      if (Number.isFinite(mm) && mm >= 1 && mm <= 12) months.push(mm);
      if (Number.isFinite(dd) && dd >= 1 && dd <= 31) days.push(dd);
    });

    // ✅ 중복 제거
    const yearMonths = Array.from(new Set(months));
    const yearDays = Array.from(new Set(days));

    return {weekdays: [], monthDays: [], yearMonths, yearDays};
  }

  // DAILY: 값이 없거나 의미 없음
  return {weekdays: [], monthDays: [], yearMonths: [], yearDays: []};
};

const mapRecurrenceToRepeatStore = (recurrence) => {
  if (!recurrence) return null;

  const type = recurrence?.type ?? null; // "WEEKLY" 등
  const cycle = recurrenceTypeToCycle(type);

  const repeatStartDate = ymdToDate(recurrence?.startDate);
  const endDate = recurrence?.endDate ?? null;
  const repeatEndType = endDate ? "date" : "none";
  const repeatEndDate = endDate ? ymdToDate(endDate) : null;

  const freqParsed = parseFrequencyValues({
    type,
    frequencyValues: recurrence?.frequencyValues,
  });

  // notificationTime: "HH:mm:ss"
  const nt = recurrence?.notificationTime ?? null;

  let repeatAlarm = "unset";
  let repeatAlarmTime = null;

  if (nt) {
    if (nt === "09:00:00") {
      repeatAlarm = "morning9";
      repeatAlarmTime = null;
    } else {
      repeatAlarm = "custom";
      repeatAlarmTime = hhmmssToHHmm(nt); // store는 "HH:mm"
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

const TodoEditorSheet = React.forwardRef(function TodoEditorSheet(
  {
    mode = "create", // ✅ "create" | "edit"
    value,
    onChangeText,
    onSubmit,
    onCloseTogether,
    onCloseAfterSubmit, // ✅ 추가
    onDismiss,
    categoryLabel = "카테고리",
    categories = [],
    initialCategoryId = 0,
    todoId = null, // ✅ 추가
  },
  ref,
) {
  const insets = useSafeAreaInsets();
  const repeatPayload = useRepeatEditorStore.getState().getRepeatPayload();

  const EDIT_TOOL_ICONS = [
    {key: "memo", Icon: MemoIcon},
    {key: "alarm", Icon: AlarmIcon},
    {key: "repeat", Icon: RepeatIcon},
    {key: "select", Icon: SelectDateIcon},
  ];

  const inputRef = useRef(null);

  // ✅ 메모 입력용 ref/state 추가
  const memoInputRef = useRef(null);
  const [memoText, setMemoText] = useState("");

  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isMemoFocused, setIsMemoFocused] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState(initialCategoryId);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const [selectedToolKey, setSelectedToolKey] = useState(null);
  const selectedToolKeyRef = useRef(null);

  // 알림 시간(임시 선택 값)
  const [alarmDraftDate, setAlarmDraftDate] = useState(new Date());
  // 적용된 알림 시간(저장될 값)
  const [alarmTime, setAlarmTime] = useState(null); // e.g. "07:30"
  // ✅ 알림 시간을 "사용자가 실제로 선택했는지" (초기: 미설정 상태)
  const [hasPickedAlarmTime, setHasPickedAlarmTime] = useState(false);
  // ✅ iOS에서만: 버튼 누른 뒤 인라인 스피너로 전환
  const [isIosInlineAlarmPickerOpen, setIsIosInlineAlarmPickerOpen] =
    useState(false);

  // ✅ repeat panel 내부 드롭다운 open 상태 (하나만 열리게)
  const [openRepeatDropdownKey, setOpenRepeatDropdownKey] = useState(null); // "repeatStart" | "repeatEnd" | "repeatCycle" | "repeatAlarm" | null

  // ===== 투두 날짜 변경(SelectDateIcon) =====
  const [todoDate, setTodoDate] = useState(new Date()); // ✅ 실제 적용된 값(추후 서버 저장용)
  const [draftTodoDate, setDraftTodoDate] = useState(new Date()); // ✅ 캘린더에서 임시 선택
  const [hasAppliedTodoDate, setHasAppliedTodoDate] = useState(false); // ✅ '적용하기'로 임시저장 했는지
  const [todoMonthCursor, setTodoMonthCursor] = useState(() => {
    const base = new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  // ✅ YearMonthWheelModal용 (number)
  const [isTodoYearMonthWheelOpen, setIsTodoYearMonthWheelOpen] =
    useState(false);
  const [todoWheelInitialYear, setTodoWheelInitialYear] = useState(
    todoMonthCursor.getFullYear(),
  );
  const [todoWheelInitialMonth, setTodoWheelInitialMonth] = useState(
    todoMonthCursor.getMonth() + 1,
  );

  // todoId가 string일 수 있으니 숫자로 보정
  const numericTodoId = useMemo(() => {
    const n = Number(todoId);
    return Number.isFinite(n) ? n : null;
  }, [todoId]);

  // ✅ 단건 조회
  const {
    data: todoDetail,
    isLoading: isTodoDetailLoading,
    isFetching: isTodoDetailFetching,
  } = useTodoDetailQuery(
    {todoId: numericTodoId},
    {enabled: mode === "edit" && !!numericTodoId},
  );

  const hasInitializedMemoRef = useRef(false);
  useEffect(() => {
    if (mode !== "edit") return;
    if (!numericTodoId) return;
    if (!todoDetail) return;

    if (hasInitializedMemoRef.current) return;
    const memo = todoDetail?.memo ?? "";
    setMemoText(memo);
    hasInitializedMemoRef.current = true;
  }, [mode, numericTodoId, todoDetail]);

  useEffect(() => {
    console.log("투두 단건 정보: ", todoDetail);
  }, [todoDetail]);

  // ✅ 초기값 스냅샷 (단건조회 기준)
  const initialRef = useRef({
    description: "",
    categoryId: null,
    memo: "",
    notifyAt: null, // "2026-01-08T14:30:00" 같은 문자열
    recurrenceId: null, // ✅ 추가
    todoId: null,
  });

  const initialRecurrencePayloadRef = useRef(null);

  const resetEditHydrationRefs = () => {
    initialRef.current.todoId = null;
    initialRef.current.recurrenceId = null;

    hasInitializedMemoRef.current = false;
    initialRecurrencePayloadRef.current = null;
  };

  // notifyAt -> "HH:mm" 추출 helper
  const toHHmm = (notifyAtStr) => {
    if (!notifyAtStr) return null;
    // "2026-01-08T14:30:00"
    const timePart = String(notifyAtStr).split("T")[1] ?? "";
    const hhmm = timePart.slice(0, 5); // "14:30"
    return hhmm.length === 5 ? hhmm : null;
  };

  // ✅ todoDetail이 들어오면: (1) 초기값 저장 (2) 화면 상태 주입
  useEffect(() => {
    if (mode !== "edit" || !numericTodoId || !todoDetail) return;

    // 이미 같은 todoId로 초기화했으면 중복 주입 방지(원하면 제거 가능)
    const currentRecurrenceId = todoDetail?.recurrence?.recurrenceId ?? null;
    if (
      initialRef.current.todoId === numericTodoId &&
      initialRef.current.recurrenceId === currentRecurrenceId
    )
      return;

    const description = todoDetail?.description ?? "";
    const categoryId =
      typeof todoDetail?.categoryId === "number" ? todoDetail.categoryId : null;
    const memo = todoDetail?.memo ?? "";
    const notifyAt = todoDetail?.alarm?.notifyAt ?? null;
    const dateStr = todoDetail?.date ?? null;

    const recurrenceId = todoDetail?.recurrence?.recurrenceId ?? null;

    initialRef.current = {
      description,
      categoryId,
      memo,
      notifyAt,
      recurrenceId: todoDetail?.recurrence?.recurrenceId ?? null,
      todoId: numericTodoId,
    };

    // ✅ 화면 값 주입
    onChangeText?.(description);
    if (categoryId != null) setDraftCategoryId(categoryId);
    setMemoText(memo);

    // ✅ 날짜 주입 (단건조회 date 기반)
    if (dateStr) {
      const injectedDate = ymdToDate(dateStr); // 이미 파일에 있는 helper
      if (injectedDate) {
        setTodoDate(injectedDate);
        setDraftTodoDate(injectedDate);
        setTodoMonthCursor(
          new Date(injectedDate.getFullYear(), injectedDate.getMonth(), 1),
        );
      }
    }
    // ✅ 새로 열 때는 "적용하기" 임시저장 플래그 초기화
    setHasAppliedTodoDate(false);

    const hhmm = toHHmm(notifyAt);
    setAlarmTime(hhmm); // 화면 표시용
    setHasPickedAlarmTime(!!hhmm); // “알림 설정됨” 상태

    // ✅ 반복 설정 주입 (recurrence가 있으면 store 채우기 / 없으면 초기화)
    const recurrence = todoDetail?.recurrence ?? null;
    const repeatStore = useRepeatEditorStore.getState();
    if (recurrence) {
      const mapped = mapRecurrenceToRepeatStore(recurrence);
      repeatStore.setRepeatAll(mapped);

      // ✅ "초기 recurrence"를 update/create payload 규격으로 스냅샷 저장
      const initialBody = buildInitialRecurrenceBodyFromDetail(recurrence);
      initialRecurrencePayloadRef.current = stableRecurrenceBody(initialBody);
    } else {
      repeatStore.resetRepeat();
      initialRecurrencePayloadRef.current = null;
    }
  }, [mode, numericTodoId, todoDetail, onChangeText]);

  const isMemoOpen = mode === "edit" && selectedToolKey === "memo";
  const isAlarmOpen = mode === "edit" && selectedToolKey === "alarm";
  const isRepeatOpen = mode === "edit" && selectedToolKey === "repeat";
  const isSelectDateOpen = mode === "edit" && selectedToolKey === "select";

  useEffect(() => {
    selectedToolKeyRef.current = selectedToolKey;
  }, [selectedToolKey]);

  useEffect(() => {
    if (!isRepeatOpen) setOpenRepeatDropdownKey(null);
  }, [isRepeatOpen]);

  useEffect(() => {
    if (isAlarmOpen) {
      // ✅ 알림 패널에 들어올 때, 아직 저장된 알림이 없으면 "미설정" 상태 유지
      if (!alarmTime) setHasPickedAlarmTime(false);
      // ✅ 저장된 알림이 있다면(추후 todo 편집 진입 시 주입한다면) 표시 상태로
      if (alarmTime) setHasPickedAlarmTime(true);
    }
  }, [isAlarmOpen, alarmTime]);

  useEffect(() => {
    if (!isAlarmOpen) setIsIosInlineAlarmPickerOpen(false);
  }, [isAlarmOpen]);

  // 패널 열릴 때: 현재 todoDate 기준으로 캘린더/선택값 동기화
  useEffect(() => {
    if (!isSelectDateOpen) return;
    const base = todoDate ?? new Date();
    setDraftTodoDate(base);
    setTodoMonthCursor(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [isSelectDateOpen, todoDate]);

  // ✅ edit일 때 높이 조금 더 (메모 input이 나타나므로 상향)
  const snapPoints = useMemo(() => {
    return mode === "edit" ? ["20%"] : ["15%"];
  }, [mode]);

  const toggleRepeatDropdown = useCallback((key) => {
    setOpenRepeatDropdownKey((prev) => (prev === key ? null : key));
  }, []);

  const blurAllInputs = useCallback(() => {
    // TextInput blur
    inputRef.current?.blur?.();
    memoInputRef.current?.blur?.();

    // focus 상태 리셋 (borderColor 원복)
    setIsTitleFocused(false);
    setIsMemoFocused(false);

    // 키보드까지 확실히 내리고 싶다면
    Keyboard.dismiss();
  }, []);

  const openToolAfterKeyboardDismiss = useCallback((key) => {
    // 1) 먼저 포커스/키보드 정리
    inputRef.current?.blur?.();
    memoInputRef.current?.blur?.();
    setIsTitleFocused(false);
    setIsMemoFocused(false);
    Keyboard.dismiss();

    // 2) 키보드/시트 인터랙션이 끝난 다음 프레임에 패널 오픈
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setSelectedToolKey(key);
      });
    });
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
      // 패널 닫기
      setSelectedToolKey(null);

      // 메모 input이 열려있던 상태면 정리
      blurMemoOnly();

      // 알림이면 iOS 인라인 피커도 닫기
      if (closingKey === "alarm") setIsIosInlineAlarmPickerOpen(false);

      // 제목 input 포커스
      setIsTitleFocused(true);
      focusTitleInput();
    },
    [blurMemoOnly, focusTitleInput],
  );

  const onSelectTool = useCallback(
    (key) => {
      const current = selectedToolKeyRef.current;

      // ✅ 같은 아이콘 다시 누르면: 패널 닫고 제목으로 복귀(키보드 올리기)
      if (current === key) {
        if (key === "alarm") setIsIosInlineAlarmPickerOpen(false);
        setSelectedToolKey(null);
        setIsTitleFocused(true);
        focusTitleInput();
        return;
      }

      // ✅ memo는 키보드 유지(메모 입력 UX) - 기존 의도 유지
      if (key === "memo") {
        setSelectedToolKey("memo");
        return;
      }

      // ✅ alarm/repeat/select 등: A안 적용 (키보드 내려간 뒤 열기)
      if (key === "alarm") setIsIosInlineAlarmPickerOpen(false);
      openToolAfterKeyboardDismiss(key);
    },
    [focusTitleInput, openToolAfterKeyboardDismiss],
  );

  const focusInput = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, []);

  const handleSheetAnimate = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === -1 && toIndex >= 0) focusInput();
    },
    [focusInput],
  );

  const renderBackdrop = useCallback(
    (props) => (
      <Pressable style={[StyleSheet.absoluteFill]} onPress={onCloseTogether}>
        <BottomSheetBackdrop
          {...props}
          pressBehavior="none"
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      </Pressable>
    ),
    [onCloseTogether],
  );

  useEffect(() => {
    setDraftCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  const handlePickCategory = useCallback((categoryId) => {
    setDraftCategoryId(categoryId);
    setIsCategoryOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, []);

  const {mutateAsync: updateCategory} = useUpdateTodoCategoryMutation();
  const {mutateAsync: updateDescription} = useUpdateTodoDescriptionMutation();
  const {mutateAsync: updateMemo} = useUpdateTodoMemoMutation();
  const {mutateAsync: setAlarm} = useSetTodoAlarmMutation();
  const {mutateAsync: deleteAlarm} = useDeleteTodoAlarmMutation();
  const {mutateAsync: createRecurrence} = useCreateTodoRecurrenceMutation();
  const {mutateAsync: updateRecurrenceRule} = useUpdateRecurrenceRuleMutation();
  const {mutateAsync: updateTodoDate} = useUpdateTodoDateMutation();
  const {mutateAsync: deleteTodoRecurrence} = useDeleteTodoRecurrenceMutation();

  const normalizeHHmm = (timeStr) => {
    if (!timeStr) return null;
    const parts = String(timeStr).split(":");
    if (parts.length < 2) return null;

    const hh = parts[0].trim().padStart(2, "0"); // ✅ trim 추가
    const mm = parts[1].trim().padStart(2, "0"); // ✅ trim 추가
    return `${hh}:${mm}`;
  };

  const toHHmmss = (timeStr) => {
    const hhmm = normalizeHHmm(timeStr); // "07:30"
    if (!hhmm) return null;
    return `${hhmm}:00`; // ✅ "07:30:00"
  };

  const buildNotifyAt = ({dateStr, timeStr}) => {
    // dateStr: "2026-01-08"
    // timeStr: "07:30" or "07:30:00"
    if (!dateStr) return null;
    const hhmm = normalizeHHmm(timeStr);
    if (!hhmm) return null;
    return `${dateStr}T${hhmm}:00`; // ✅ "2026-01-08T07:30:00"
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

  const WEEKDAY_TO_API = {
    mon: "MONDAY",
    tue: "TUESDAY",
    wed: "WEDNESDAY",
    thu: "THURSDAY",
    fri: "FRIDAY",
    sat: "SATURDAY",
    sun: "SUNDAY",
  };

  const buildCreateRecurrencePayload = (draft, {alarmTimeHHmm} = {}) => {
    if (!draft) return null;
    if (!draft.repeatCycle || draft.repeatCycle === "unset") return null;

    const type = String(draft.repeatCycle).toUpperCase(); // DAILY/WEEKLY/MONTHLY/YEARLY
    const startDate = toYYYYMMDD(draft.repeatStartDate);

    // endDate: null이면 무한 반복 (명세)
    const endDate =
      draft.repeatEndType === "date" ? toYYYYMMDD(draft.repeatEndDate) : null;

    // ✅ frequencyValues: 케이스별 명세 반영
    let frequencyValues = null;

    if (draft.repeatCycle === "daily") {
      // DAILY는 null 또는 빈 배열 (선택) → 안전하게 null
      frequencyValues = null;
    }

    if (draft.repeatCycle === "weekly") {
      // WEEKLY는 배열 필수
      frequencyValues = (draft.repeatWeekdays ?? [])
        .map((k) => WEEKDAY_TO_API[k])
        .filter(Boolean);
    }

    if (draft.repeatCycle === "monthly") {
      // MONTHLY는 날짜 "문자열" 배열 필수 (예: ["7","15"])
      frequencyValues = (draft.repeatMonthDays ?? [])
        .map((n) => String(Number(n))) // ✅ 문자열로
        .filter((s) => s !== "NaN");
    }

    if (draft.repeatCycle === "yearly") {
      // YEARLY는 "MM-dd" 문자열 배열 필수
      const months = (draft.repeatYearMonths ?? []).map((n) => Number(n));
      const days = (draft.repeatYearDays ?? []).map((n) => Number(n));

      const out = [];
      months.forEach((m) => {
        days.forEach((d) => {
          if (!Number.isFinite(m) || !Number.isFinite(d)) return;
          const mm = String(m).padStart(2, "0");
          const dd = String(d).padStart(2, "0");
          out.push(`${mm}-${dd}`); // ✅ "MM-dd"
        });
      });
      frequencyValues = out;
    }

    // ✅ notificationTime: "HH:mm:ss" (POST /recurrence)
    let notificationTime = null;
    if (draft.repeatAlarm === "morning9") notificationTime = "09:00:00";
    if (draft.repeatAlarm === "custom")
      notificationTime = toHHmmss(draft.repeatAlarmTime);
    if (draft.repeatAlarm === "sameTime")
      notificationTime = toHHmmss(alarmTimeHHmm);

    return {type, frequencyValues, startDate, endDate, notificationTime};
  };

  // ✅ recurrence 응답(string csv) -> update/create payload(body) 형태로 정규화
  const buildInitialRecurrenceBodyFromDetail = (recurrence) => {
    if (!recurrence) return null;

    const type = recurrence?.type ?? null; // "DAILY" | "WEEKLY" | ...
    if (!type) return null;

    // 서버 응답은 string "TUESDAY,THURSDAY" / "25,15" / "03-30,12-25" 형태
    const raw = (recurrence?.frequencyValues ?? "").trim();
    const parts = raw
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    let frequencyValues = null;

    if (type === "DAILY") {
      // create builder가 DAILY는 null로 보내고 있어서 동일하게 맞춤
      frequencyValues = null;
    } else {
      frequencyValues = parts; // WEEKLY/MONTHLY/YEARLY는 배열로
    }

    const startDate = recurrence?.startDate ?? null; // "YYYY-MM-DD"
    const endDate = recurrence?.endDate ?? null; // 없으면 null

    // notificationTime은 "HH:mm:ss" or null
    const notificationTime = recurrence?.notificationTime ?? null;

    return {type, frequencyValues, startDate, endDate, notificationTime};
  };

  // ✅ 비교를 위한 안정화 (frequencyValues 정렬, DAILY null 통일)
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

  const handleSubmitInternal = useCallback(async () => {
    // create 모드는 기존 흐름 유지(필요하면 create mutation 연결)
    if (mode !== "edit") {
      onSubmit?.(draftCategoryId);
      return;
    }

    if (!numericTodoId) return;

    const initial = initialRef.current;

    const currentDescription = normalizeDesc(value);
    const currentCategoryId = draftCategoryId;
    const currentMemo = normalizeMemo(memoText);

    // ✅ 초기 알림/현재 알림 비교를 위해 둘 다 "notifyAt" 문자열로 통일
    const initialNotifyAt = initial.notifyAt; // ex) "2026-01-08T14:30:00" or null
    const todoDateStr = todoDetail?.date; // 단건조회 응답의 date 사용
    const currentNotifyAt = hasPickedAlarmTime
      ? buildNotifyAt({dateStr: todoDateStr, timeStr: alarmTime})
      : null;

    const tasks = [];

    // 1) 제목 변경
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

    // 2) 카테고리 변경
    if (
      initial.categoryId != null &&
      initial.categoryId !== currentCategoryId
    ) {
      tasks.push(
        updateCategory({todoId: numericTodoId, categoryId: currentCategoryId}),
      );
    }

    // 3) 메모 변경 (null/"" 처리 포함)
    if (normalizeMemo(initial.memo) !== currentMemo) {
      tasks.push(updateMemo({todoId: numericTodoId, memo: currentMemo}));
    }

    // ✅ 기존에 알림이 있었는데, clear 적용으로 현재 알림이 null이면 삭제 호출
    if (initialNotifyAt && !currentNotifyAt) {
      tasks.push(deleteAlarm({todoId: numericTodoId}));
    }
    // ✅ 알림 신규 설정/시간 변경
    else if (initialNotifyAt !== currentNotifyAt && currentNotifyAt) {
      tasks.push(setAlarm({todoId: numericTodoId, notifyAt: currentNotifyAt}));
    }

    // ✅ 반복(Recurrence) - "초기엔 없음" → "지금 설정됨"일 때만 생성 호출
    const initialRecurrenceId = initial.recurrenceId; // null이면 초기 반복 없음

    // store의 최신 상태에서 payload를 꺼내야 함(상단의 repeatPayload 변수 쓰면 stale 될 수 있음)
    const repeatDraft = useRepeatEditorStore.getState().getRepeatPayload?.();

    // ✅ 스냅샷을 API payload로 변환
    const repeatPayload = buildCreateRecurrencePayload(repeatDraft, {
      alarmTimeHHmm: hasPickedAlarmTime ? alarmTime : null,
    });

    // ✅ 초기 recurrence 존재 여부 (단건조회에서 온 값)
    const initialHasRecurrence = !!initialRecurrenceId;

    // ✅ 사용자가 "모두 미설정"으로 만든 상태 판별
    // - 너희 store 기준으로 repeatCycle이 unset이면 반복 자체가 미설정 상태로 보는 게 가장 안전함
    const isRepeatCleared = repeatDraft?.repeatCycle === "unset";

    // getRepeatPayload가 "미설정"이면 null을 반환하도록 되어있는 전제(없으면 아래 조건에서 추가 가드 가능)
    const shouldCreateRecurrence = !initialRecurrenceId && !!repeatPayload;

    // ✅ 반복(Recurrence) - "초기에 있었음" + "현재 payload 있음" + "서로 다름" => 규칙 수정 호출
    const shouldUpdateRecurrence =
      !!initialRecurrenceId &&
      !!repeatPayload &&
      !isSameRecurrenceBody(initialRecurrencePayloadRef.current, repeatPayload);

    // ✅ (최우선) 기존에 반복이 있었는데, 사용자가 반복을 전부 미설정으로 만들었다면 "반복 해제" API가 우선
    if (initialHasRecurrence && isRepeatCleared) {
      tasks.push(deleteTodoRecurrence({todoId: Number(todoId)}));
      // delete가 우선이므로 update/create는 절대 타면 안 됨
    } else {
      if (shouldCreateRecurrence) {
        // API 필수값 가드(명세 기준)
        const hasRequired =
          repeatPayload?.type &&
          repeatPayload?.startDate &&
          (repeatPayload.type === "DAILY"
            ? true // ✅ DAILY는 frequencyValues 없어도 됨(null 가능)
            : Array.isArray(repeatPayload?.frequencyValues) &&
              repeatPayload.frequencyValues.length > 0);

        console.log("repeatPayload.type: ", repeatPayload?.type);
        console.log(
          "Array.isArray(repeatPayload?.frequencyValues): ",
          Array.isArray(repeatPayload?.frequencyValues),
        );
        console.log("repeatPayload.startDate: ", repeatPayload?.startDate);
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
        // 명세상 PATCH /api/todos/recurrence/{recurrenceId}
        tasks.push(
          updateRecurrenceRule({
            recurrenceId: initialRecurrenceId,
            ...repeatPayload,
          }),
        );
      }
    }

    // ✅ 날짜 변경: 사용자가 날짜 탭에서 '적용하기'로 임시저장한 경우에만 호출
    // API: PATCH /api/todos/{todoId}/date  body: { date: "YYYY-MM-DD" } :contentReference[oaicite:5]{index=5}
    if (hasAppliedTodoDate) {
      const initialDateStr = todoDetail?.date ?? null; // "YYYY-MM-DD"
      const nextDateStr = toYYYYMMDD(todoDate); // Date -> "YYYY-MM-DD"

      // (선택) 실제로 날짜가 다를 때만 호출 (불필요 호출 방지)
      if (nextDateStr && nextDateStr !== initialDateStr) {
        tasks.push(updateTodoDate({todoId: numericTodoId, date: nextDateStr}));
      }
    }

    // ✅ 변경된 게 없으면 그냥 닫기
    if (tasks.length === 0) {
      onCloseAfterSubmit?.(); // ✅ 모달 없이 즉시 닫기
      return;
    }

    try {
      await Promise.all(tasks);
      onCloseAfterSubmit?.(); // ✅ 모달 없이 즉시 닫기
    } catch (e) {
      // axios interceptor에서 토스트 처리 중이면 여기서는 조용히
      // 필요하면 추가 toast 가능
    }
  }, [
    mode,
    numericTodoId,
    value,
    draftCategoryId,
    memoText,
    hasPickedAlarmTime,
    alarmTime,
    hasAppliedTodoDate,
    todoDate,
    todoDetail?.date,
    updateDescription,
    updateCategory,
    updateMemo,
    setAlarm,
    updateTodoDate,
    onSubmit,
    onCloseTogether,
    createRecurrence,
    updateRecurrenceRule,
  ]);

  const handleDismiss = useCallback(() => {
    setIsCategoryOpen(false);
    setDraftCategoryId(initialCategoryId);
    setSelectedToolKey(null);
    setMemoText(""); // ✅ 닫을 때 메모 입력 초기화
    setHasAppliedTodoDate(false);
    resetEditHydrationRefs(); // ✅ 주입 가드 전체 리셋
    Keyboard.dismiss();
    onDismiss?.();
  }, [onDismiss, initialCategoryId]);

  const otherCategories = useMemo(() => {
    return categories
      .filter((c) => c.categoryId !== 0)
      .filter((c) => c.categoryId !== draftCategoryId);
  }, [categories, draftCategoryId]);

  const handleClearText = useCallback(() => {
    onChangeText?.("");
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, [onChangeText]);

  const todoMonthGrid = useMemo(
    () => buildMonthGrid(todoMonthCursor),
    [todoMonthCursor],
  );

  const today = useMemo(() => new Date(), []);

  const handlePickTodoDateFromCalendar = useCallback(
    (date) => {
      if (!date) return;

      const today0 = startOfDay(new Date());
      const picked0 = startOfDay(date);

      // ✅ 과거 날짜면: 선택 무시 + 중앙 토스트
      if (picked0 < today0) {
        toast.show("과거 날짜로는 이동할 수 없어요.");
        return;
      }

      setDraftTodoDate(date);
    },
    [toast],
  );

  const handleApplyTodoDate = useCallback(() => {
    if (!draftTodoDate) return;
    setTodoDate(draftTodoDate);
    setHasAppliedTodoDate(true); // ✅ '적용하기'로 임시저장 표시

    // 적용 후 패널 닫기 (원하면 유지로 바꿔도 됨)
    closePanelAndFocusTitle("select");
  }, [draftTodoDate, closePanelAndFocusTitle]);

  const renderEditTools = () => {
    return (
      <View style={styles.toolsRow}>
        <View style={styles.toolsLeft}>
          {EDIT_TOOL_ICONS.map(({key, Icon}) => {
            const isSelected = selectedToolKey === key;

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                style={styles.toolIconButton}
                onPress={() => onSelectTool(key)}
              >
                <Icon
                  width={24}
                  height={24}
                  color={isSelected ? colors.or : colors.gr500}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSubmitInternal}
          disabled={!isSubmitEnabled}
          style={[
            styles.submitButton,
            !isSubmitEnabled && styles.submitButtonDisabled,
          ]}
        >
          <ChevronIcon
            direction="right"
            size={24}
            color={isSubmitEnabled ? colors.gr : colors.gr300}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      // snapPoints={snapPoints}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      onAnimate={handleSheetAnimate}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{backgroundColor: "#FAFAFA"}}
      handleIndicatorStyle={{backgroundColor: "#D0D0D0", width: "38.4%"}}
      enableContentPanningGesture={false} // ✅ content로는 시트 이동 X (고정)
      bottomInset={insets.bottom}
      enablePanDownToClose={false}
      // detached={true}
    >
      <BottomSheetView>
        <View style={styles.container}>
          {/* (선택) 로딩 표시 */}
          {mode === "edit" && (isTodoDetailLoading || isTodoDetailFetching) ? (
            <Text style={{fontSize: 12, color: "#B0B0B0", marginBottom: 8}}>
              투두 정보를 불러오는 중...
            </Text>
          ) : null}

          {/* 카테고리 row */}
          <View style={styles.categoryInlineRow}>
            <View style={styles.categoryChipSelected}>
              <Text style={styles.categorySelectedText}>
                {categories.find((c) => c.categoryId === draftCategoryId)
                  ?.label ?? categoryLabel}
              </Text>
            </View>

            {!isCategoryOpen && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsCategoryOpen(true)}
                style={styles.chevronButton}
                hitSlop={8}
              >
                <ChevronIcon
                  direction="right"
                  size={14}
                  color={colors.gr500}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            )}

            {isCategoryOpen && (
              <ScrollView
                horizontal
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryInlineList}
                style={styles.categoryInlineScroll}
              >
                {otherCategories.map((c) => (
                  <TouchableOpacity
                    key={c.categoryId}
                    activeOpacity={0.7}
                    onPress={() => handlePickCategory(c.categoryId)}
                    style={styles.categoryChip}
                  >
                    <Text style={styles.categoryText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* ✅ create/edit 레이아웃 분기 */}
          {mode === "create" ? (
            // ===== 생성 모드: input 옆에 submit =====
            <View style={styles.inputRow}>
              <View
                style={[
                  styles.inputWrapper,
                  isTitleFocused && styles.inputWrapperFocused,
                ]}
              >
                <TodoBottomSheetTextInput
                  inputRef={inputRef}
                  value={value}
                  onChangeText={onChangeText}
                  onSubmitEditing={handleSubmitInternal}
                  onEnabledChange={setIsSubmitEnabled}
                  maxLength={20}
                  style={styles.input}
                  onFocus={() => setIsTitleFocused(true)}
                  onBlur={() => setIsTitleFocused(false)}
                />

                {!!value?.length && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClearText}
                    style={styles.clearButton}
                    hitSlop={8}
                  >
                    <ClearIcon width={16} height={16} color={colors.gr300} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSubmitInternal}
                disabled={!isSubmitEnabled}
                style={[
                  styles.submitButton,
                  !isSubmitEnabled && styles.submitButtonDisabled,
                ]}
              >
                <ChevronIcon
                  direction="right"
                  size={24}
                  color={isSubmitEnabled ? colors.gr : colors.gr300}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>
          ) : (
            // ===== 수정 모드: memo 선택 시 제목 아래 메모 input + toolsRow + submit =====
            <View>
              <View
                style={[
                  styles.inputWrapperEdit,
                  isTitleFocused && styles.inputWrapperFocused,
                  isMemoOpen && {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                ]}
              >
                <TodoBottomSheetTextInput
                  inputRef={inputRef}
                  value={value}
                  onChangeText={onChangeText}
                  onSubmitEditing={handleSubmitInternal}
                  onEnabledChange={setIsSubmitEnabled}
                  maxLength={20}
                  style={styles.inputEdit}
                  placeholder="두근두근, 무엇을 튀겨볼까요?"
                  onFocus={() => {
                    setIsTitleFocused(true);

                    if (selectedToolKey) {
                      // ✅ 켜져있던 툴/패널 닫기
                      setSelectedToolKey(null);
                      // ✅ repeat 내부 드롭다운도 정리
                      setOpenRepeatDropdownKey(null);
                      // ✅ 알림 인라인 picker 정리
                      setIsIosInlineAlarmPickerOpen(false);
                      // ✅ 메모 input 열려있으면 내려주기
                      blurMemoOnly();
                    }
                  }}
                  onBlur={() => setIsTitleFocused(false)}
                />

                {!!value?.length && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClearText}
                    style={styles.clearButton}
                    hitSlop={8}
                  >
                    <ClearIcon width={16} height={16} color={colors.gr300} />
                  </TouchableOpacity>
                )}
              </View>

              {/* ✅ memo 아이콘 선택 시: 최대 3줄 메모 input */}
              {isMemoOpen && (
                <View
                  style={[
                    styles.memoWrapper,
                    isMemoFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <TodoBottomSheetTextInput
                    inputRef={memoInputRef}
                    value={memoText}
                    onChangeText={setMemoText}
                    onEnabledChange={() => {}}
                    placeholder="기억해야 할 메모를 입력해 주세요."
                    maxLength={200}
                    multiline
                    blurOnSubmit={false}
                    scrollEnabled
                    style={styles.memoInput}
                    onFocus={() => setIsMemoFocused(true)}
                    onBlur={() => setIsMemoFocused(false)}
                    autoFocus={true}
                  />
                </View>
              )}

              {renderEditTools()}

              {/* ✅ iOS/Android 공통: 처음엔 동일한 '미설정' UI */}
              {isAlarmOpen && (
                <View style={styles.alarmPanel}>
                  <Text style={styles.alarmTitle}>알림 설정</Text>

                  <AlarmTimeSettingSection
                    alarmDraftDate={alarmDraftDate}
                    alarmTime={alarmTime}
                    hasPickedAlarmTime={hasPickedAlarmTime}
                    isIosInlineAlarmPickerOpen={isIosInlineAlarmPickerOpen}
                    setAlarmDraftDate={setAlarmDraftDate}
                    setAlarmTime={setAlarmTime}
                    setHasPickedAlarmTime={setHasPickedAlarmTime}
                    setIsIosInlineAlarmPickerOpen={
                      setIsIosInlineAlarmPickerOpen
                    }
                    onClosePanel={() => closePanelAndFocusTitle("alarm")}
                    styles={styles}
                  />
                </View>
              )}

              <RepeatSettingsSection
                visible={isRepeatOpen}
                openKey={openRepeatDropdownKey}
                onToggleOpenKey={toggleRepeatDropdown}
              />

              {/* ✅ SelectDateIcon: 투두 날짜 변경 캘린더 */}
              {isSelectDateOpen && (
                <View style={styles.selectDatePanel}>
                  <Text style={styles.selectDateTitle}>변경할 날짜</Text>

                  <View style={styles.calendarWrap}>
                    {/* 월 네비게이션 */}
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          setTodoMonthCursor((d) => addMonths(d, -1))
                        }
                        style={styles.monthNavBtn}
                        hitSlop={8}
                      >
                        <ChevronIcon
                          direction="left"
                          size={18}
                          color={colors.gr500}
                          strokeWidth={2}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          setTodoWheelInitialYear(
                            todoMonthCursor.getFullYear(),
                          );
                          setTodoWheelInitialMonth(
                            todoMonthCursor.getMonth() + 1,
                          );
                          setIsTodoYearMonthWheelOpen(true);
                        }}
                        hitSlop={8}
                      >
                        <Text style={styles.calendarHeaderText}>
                          {todoMonthCursor.getFullYear()}년{" "}
                          {todoMonthCursor.getMonth() + 1}월
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          setTodoMonthCursor((d) => addMonths(d, 1))
                        }
                        style={styles.monthNavBtn}
                        hitSlop={8}
                      >
                        <ChevronIcon
                          direction="right"
                          size={18}
                          color={colors.gr500}
                          strokeWidth={2}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* 요일 */}
                    <View style={styles.weekHeaderRow}>
                      {WEEKDAYS.map((w, idx) => (
                        <View key={w} style={styles.weekHeaderCell}>
                          <Text
                            style={[
                              styles.weekHeaderText,
                              idx === 0 && styles.weekHeaderSun,
                              idx === 6 && styles.weekHeaderSat,
                            ]}
                          >
                            {w}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* 날짜 grid */}
                    <View style={styles.calendarGrid}>
                      {todoMonthGrid.map((cellDate, i) => {
                        const isEmpty = !cellDate;
                        const selected = cellDate
                          ? isSameDay(cellDate, draftTodoDate)
                          : false;
                        const isToday = cellDate
                          ? isSameDay(cellDate, today)
                          : false;

                        // ✅ 오늘이더라도 선택이면 오늘 스타일은 적용 X
                        const useTodayStyle = isToday && !selected;

                        return (
                          <TouchableOpacity
                            key={`todo-d-${i}`}
                            disabled={isEmpty}
                            activeOpacity={0.85}
                            onPress={() =>
                              handlePickTodoDateFromCalendar(cellDate)
                            }
                            style={styles.dayCell}
                          >
                            {isEmpty ? (
                              <View style={styles.dayCircle} />
                            ) : (
                              <View
                                style={[
                                  styles.dayCircle,
                                  selected && styles.daySelectedCircle,
                                  useTodayStyle && styles.dayTodayCircle,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.dayText,
                                    selected && styles.daySelectedText,
                                    useTodayStyle && styles.dayTodayText,
                                  ]}
                                >
                                  {cellDate.getDate()}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.selectDateFooter}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleApplyTodoDate}
                      style={styles.selectDateApplyButton}
                    >
                      <Text style={styles.selectDateApplyText}>적용하기</Text>
                    </TouchableOpacity>
                  </View>
                  <YearMonthWheelModal
                    visible={isTodoYearMonthWheelOpen}
                    initialYear={todoWheelInitialYear}
                    initialMonth={todoWheelInitialMonth} // 1~12
                    onCancel={() => setIsTodoYearMonthWheelOpen(false)}
                    onConfirm={(year, month) => {
                      // ✅ 캘린더 커서 이동
                      setTodoMonthCursor(new Date(year, month - 1, 1));

                      // ✅ draftTodoDate도 같은 '일' 유지하면서 이동 (말일 보정)
                      setDraftTodoDate((prev) => {
                        const base = prev ?? new Date();
                        const day = base.getDate();
                        const lastDay = new Date(year, month, 0).getDate();
                        return new Date(
                          year,
                          month - 1,
                          Math.min(day, lastDay),
                        );
                      });

                      setIsTodoYearMonthWheelOpen(false);
                    }}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default TodoEditorSheet;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    // paddingBottom: 16,
  },

  categoryInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  categoryChipSelected: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FF5B22",
  },
  categorySelectedText: {
    fontSize: 13,
    color: "#FFFFFF",
  },

  chevronButton: {
    // width: 26,
    // height: 26,
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  categoryInlineScroll: {flex: 1},
  categoryInlineList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 6,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F0F0F0",
  },
  categoryText: {
    fontSize: 13,
    color: "#B0B0B0",
  },

  // ===== create =====
  inputRow: {flexDirection: "row", alignItems: "center", paddingBottom: 16},
  inputWrapper: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
    borderWidth: 1,
    borderColor: colors.gr100,
  },
  inputWrapperFocused: {
    borderColor: "#EAEAEA",
  },
  input: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: colors.gr900,
    paddingRight: 26,
    // borderWidth: 1,
    paddingVertical: 0,
    lineHeight: 12 * 1.5,
  },

  // ===== edit =====
  inputWrapperEdit: {
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    // paddingVertical: 6,
    minHeight: 44,
    position: "relative",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gr100,
  },
  inputEdit: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.gr700,
    paddingRight: 26,
    paddingVertical: 0,
    // borderWidth: 1,
  },

  // ✅ memo input
  memoWrapper: {
    // marginTop: 10,
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  // ✅ "3줄" 높이로 제한 (lineHeight 18 * 3 = 54)
  memoInput: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: colors.gr700,
    lineHeight: 18,
    // minHeight: 54,
    maxHeight: 54,
    textAlignVertical: "top",
    paddingVertical: 0, // wrapper가 padding을 담당하므로 깔끔
    // borderWidth: 1,
  },

  clearButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    // borderWidth: 1,
  },
  // clearIcon: {
  //   fontSize: 16,
  //   lineHeight: 16,
  //   color: "#B0B0B0",
  // },

  // ===== edit tools row =====
  toolsRow: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // borderWidth: 1,
  },
  toolsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  toolIconButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // submit (공통)
  submitButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF5B22",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#E4E4E4",
  },
  panelWrapper: {
    marginTop: 14,
  },
  panelTitle: {
    fontSize: 12,
    color: "#B0B0B0",
    marginBottom: 10,
  },
  pickerBox: {
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
  },
  panelFooter: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  applyButton: {
    backgroundColor: "#FF5B22",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
  },
  alarmPanel: {
    justifyContent: "space-between",
    minHeight: 335,
    paddingTop: 16,
    paddingBottom: 32,
    // borderWidth: 1,
  },
  alarmTitle: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.gr700,
    marginBottom: 10,
  },
  // ===== SelectDate(투두 날짜 변경) =====
  selectDatePanel: {
    paddingTop: 15,
    minHeight: 335,
    // borderWidth: 1,
  },
  selectDateTitle: {
    fontFamily: "Pretendard-Medium",
    marginBottom: 15,
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.gr700,
  },

  calendarWrap: {},
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    // borderWidth: 1,
  },
  monthNavBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarHeaderText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: colors.bk,
  },

  weekHeaderRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 12,
  },
  weekHeaderCell: {
    width: `${100 / 7.01}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  weekHeaderText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.bk,
  },
  weekHeaderSun: {color: colors.rd75},
  weekHeaderSat: {color: colors.bl75},

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    // borderWidth: 1,
    minHeight: 150,
  },
  dayCell: {
    width: `${100 / 7.01}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: "100%",
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 10,
    color: colors.bk,
    lineHeight: 10 * 1.5,
  },
  daySelectedCircle: {
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: colors.or,
  },
  daySelectedText: {
    color: colors.or,
  },
  dayTodayCircle: {
    aspectRatio: 1,
    backgroundColor: colors.or,
    borderRadius: 20,
  },
  dayTodayText: {
    color: colors.wt,
  },

  selectDateFooter: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  selectDateApplyButton: {
    height: 44,
    width: 100,
    borderRadius: 16,
    backgroundColor: colors.or,
    alignItems: "center",
    justifyContent: "center",
  },
  selectDateApplyText: {
    fontFamily: "Pretendard-SemiBold",
    color: colors.wt,
    fontSize: 14,
  },
});
