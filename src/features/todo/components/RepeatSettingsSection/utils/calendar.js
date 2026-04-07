export const buildMonthGrid = (monthDate) => {
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
