// src/shared/lib/queryClient.js
import {QueryClient} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분 동안 fresh
      gcTime: 10 * 60 * 1000, // 10분 후 캐시 정리
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});
