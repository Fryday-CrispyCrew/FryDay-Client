import { useQuery } from "@tanstack/react-query";
import { calendarKeys } from "./calendarKey";
import { getDailyResultsMap } from "../api/dailyResultsApi";

export function useDailyResultsQuery({ startDate, endDate }, options = {}) {
  return useQuery({
    queryKey: calendarKeys.dailyResultsByRange(startDate, endDate),
    queryFn: () => getDailyResultsMap(startDate, endDate),
    enabled: !!startDate && !!endDate && (options.enabled ?? true),
    ...options,
  });
}