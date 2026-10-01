import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "../../../shared/lib/storage/tokenStorage";
import { getUserIdFromAccessToken } from "../lib/groupIdentity";
import { groupApi } from "../api/groupApi";

import { groupKeys } from "./groupKeys";
export { groupKeys } from "./groupKeys";

function useFocusedQuery(options) {
  const query = useQuery({ retry: false, ...options });
  const { refetch } = query;
  const enabled = options.enabled !== false;
  useFocusEffect(useCallback(() => {
    if (enabled) void refetch();
  }, [enabled, refetch]));
  return query;
}

export function useGroupsQuery() {
  return useFocusedQuery({ queryKey: groupKeys.list(), queryFn: groupApi.getGroups });
}
export function useGroupQuery(groupId, options = {}) {
  return useQuery({ queryKey: groupKeys.detail(groupId), queryFn: () => groupApi.getGroup(groupId), enabled: !!groupId, retry: false, staleTime: Infinity, ...options });
}
export function useGroupNotificationQuery(groupId) {
  return useFocusedQuery({ queryKey: groupKeys.notification(groupId), queryFn: () => groupApi.getNotification(groupId), enabled: !!groupId });
}
export function useGroupCategoriesQuery(groupId) {
  return useFocusedQuery({ queryKey: groupKeys.categories(groupId), queryFn: () => groupApi.getPublicCategories(groupId), enabled: !!groupId });
}
export function useGroupMutation(mutationFn) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => { void client.invalidateQueries({ queryKey: groupKeys.all }); },
  });
}

export function useGroupCurrentUserIdQuery() {
  return useQuery({
    queryKey: ["groups", "currentUserId"],
    queryFn: async () => getUserIdFromAccessToken(await getAccessToken()),
  });
}

export function useGroupMemberTodosQuery(groupId, targetUserId) {
  return useQuery({
    retry: false,
    staleTime: Infinity,
    queryKey: groupKeys.memberTodos(groupId, targetUserId),
    queryFn: () => groupApi.getMemberTodos({ groupId, targetUserId }),
    enabled: !!groupId && !!targetUserId,
  });
}
