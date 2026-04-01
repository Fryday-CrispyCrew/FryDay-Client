import { WEEKDAY_LABEL } from "../constants/repeatConstants";

export const cycleLabel = (v) =>
  v === "unset"
    ? "미설정"
    : v === "daily"
      ? "매일"
      : v === "weekly"
        ? "매주"
        : v === "monthly"
          ? "매월"
          : "매년";

export const alarmLabel = (v, time) =>
  v === "unset"
    ? "미설정"
    : v === "sameTime"
      ? "시작 시간과 동일"
      : v === "morning9"
        ? "오전 9시"
        : (time ?? "미설정");

const formatWithEllipsis = (items, { max = 3, joiner = "," } = {}) => {
  const arr = (items ?? []).filter(Boolean);
  if (arr.length === 0) return "";

  const shown = arr.slice(0, max).join(joiner);
  return arr.length > max ? `${shown},...` : shown;
};

export const repeatCycleLabel = ({
  repeatCycle,
  repeatWeekdays,
  repeatMonthDays,
  repeatYearMonths,
  repeatYearDays,
}) => {
  if (!repeatCycle || repeatCycle === "unset") return "미설정";

  if (repeatCycle === "daily") return "매일";

  if (repeatCycle === "weekly") {
    const mapped = (repeatWeekdays ?? [])
      .map((k) => WEEKDAY_LABEL[k])
      .filter(Boolean);

    const text = formatWithEllipsis(mapped);
    return text ? `매주 ${text}` : "매주";
  }

  if (repeatCycle === "monthly") {
    const days = [...(repeatMonthDays ?? [])]
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    const text = formatWithEllipsis(days);
    return text ? `매월 ${text}일` : "매월";
  }

  if (repeatCycle === "yearly") {
    const months = [...(repeatYearMonths ?? [])]
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    const days = [...(repeatYearDays ?? [])]
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    const mText = formatWithEllipsis(months);
    const dText = formatWithEllipsis(days);

    if (mText && dText) return `매년 ${mText}월 ${dText}일`;
    if (mText) return `매년 ${mText}월`;
    if (dText) return `매년 ${dText}일`;
    return "매년";
  }

  return "미설정";
};
