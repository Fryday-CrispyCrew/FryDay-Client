// useNoticesQuery.js
import { useQuery } from "@tanstack/react-query";
import { noticesApi } from "./noticeApi";

export function useNoticesQuery(options = {}) {
  return useQuery({
    queryKey: ["notices"],
    queryFn: () => noticesApi.getNotices({ skipErrorToast: true }),
    ...options,
  });
}
