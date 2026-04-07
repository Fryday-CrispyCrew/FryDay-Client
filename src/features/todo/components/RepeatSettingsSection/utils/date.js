export const isSameDay = (a, b) => {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const toDayKey = (d) => {
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export const isBeforeDay = (a, b) => {
  const ak = toDayKey(a);
  const bk = toDayKey(b);
  if (ak == null || bk == null) return false;
  return ak < bk;
};

export const isAfterDay = (a, b) => {
  const ak = toDayKey(a);
  const bk = toDayKey(b);
  if (ak == null || bk == null) return false;
  return ak > bk;
};

export const addMonths = (date, delta) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
};
