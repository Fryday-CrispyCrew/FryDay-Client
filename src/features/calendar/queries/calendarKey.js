export const calendarKeys = {
  all: ["calendar"],
  dailyResults: () => [...calendarKeys.all, "dailyResults"],
  dailyResultsByRange: (startDate, endDate) =>
    [...calendarKeys.dailyResults(), { startDate, endDate }],
};