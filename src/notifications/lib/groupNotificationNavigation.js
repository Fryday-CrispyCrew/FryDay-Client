import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "../../shared/lib/navigationRef";
import { queryClient } from "../../shared/lib/queryClient";
import { groupKeys } from "../../features/group/queries/groupKeys";

const STORAGE_KEY = "pendingGroupNotification";
const DETAIL_TYPES = new Set([
  "GROUP_JOINED", "GROUP_FRYING_STARTED", "GROUP_FRYING_FINISHED", "GROUP_INTERACTION",
]);
let flushing = false;

export function getGroupNotificationTarget(data) {
  if (data?.type === "GROUP_DISBANDED") return { screen: "GroupHome" };
  if (!DETAIL_TYPES.has(data?.type)) return null;
  const groupId = Number(data.groupId);
  return Number.isSafeInteger(groupId) && groupId > 0
    ? { screen: "GroupDetail", params: { groupId } }
    : { screen: "GroupHome" };
}

export async function queueGroupNotification(data) {
  const target = getGroupNotificationTarget(data);
  if (!target) return false;
  await queueGroupTarget(target);
  return true;
}

/** 초대 링크처럼 알림이 아닌 진입도 같은 대기열을 써서 로그인/온보딩이 끝난 뒤 이동한다. */
export async function queueGroupTarget(target) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  await flushGroupNotification();
}

export async function flushGroupNotification() {
  if (flushing || !navigationRef.isReady()) return;
  const state = navigationRef.getRootState();
  // 로그인/약관/온보딩을 건너뛰지 않고 Main 진입 후 이동한다.
  if (state?.routes?.[state.index]?.name !== "Main") return;
  flushing = true;
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return;
    const target = JSON.parse(value);
    await AsyncStorage.removeItem(STORAGE_KEY);
    void queryClient.invalidateQueries({ queryKey: groupKeys.all });
    navigationRef.navigate("Main", { screen: "Group", params: { ...target, initial: false } });
  } finally {
    flushing = false;
  }
}
