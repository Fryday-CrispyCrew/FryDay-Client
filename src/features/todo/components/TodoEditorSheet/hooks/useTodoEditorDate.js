import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "../../../../../shared/components/toast/CenterToast";

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

  for (let i = 0; i < startDow; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(y, m, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
};

export default function useTodoEditorDate({
  isSelectDateOpen,
  closePanelAndFocusTitle, selectedDate,
}) {
  const getInitialDate = () => {
    if (!selectedDate) return new Date();
    const [y, m, d] = String(selectedDate).split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const [todoDate, setTodoDate] = useState(getInitialDate);
  const [draftTodoDate, setDraftTodoDate] = useState(getInitialDate);
  const [hasAppliedTodoDate, setHasAppliedTodoDate] = useState(false);

  const [todoMonthCursor, setTodoMonthCursor] = useState(() => {
    const base = getInitialDate();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [isTodoYearMonthWheelOpen, setIsTodoYearMonthWheelOpen] =
    useState(false);
  const [todoWheelInitialYear, setTodoWheelInitialYear] = useState(
    new Date().getFullYear(),
  );
  const [todoWheelInitialMonth, setTodoWheelInitialMonth] = useState(
    new Date().getMonth() + 1,
  );

  const todoMonthGrid = useMemo(
    () => buildMonthGrid(todoMonthCursor),
    [todoMonthCursor],
  );

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!selectedDate) return;

    const next = getInitialDate();

    setTodoDate(next);
    setDraftTodoDate(next);
    setTodoMonthCursor(new Date(next.getFullYear(), next.getMonth(), 1));
    setTodoWheelInitialYear(next.getFullYear());
    setTodoWheelInitialMonth(next.getMonth() + 1);
    setHasAppliedTodoDate(false);
  }, [selectedDate]);

  useEffect(() => {
    if (!isSelectDateOpen) return;

    const base = todoDate ?? new Date();
    setDraftTodoDate(base);
    setTodoMonthCursor(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [isSelectDateOpen, todoDate]);

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
  }, [closePanelAndFocusTitle, draftTodoDate]);

  return {
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
  };
}
