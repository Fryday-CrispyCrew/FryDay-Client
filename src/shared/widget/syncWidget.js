import { NativeModules, Platform } from "react-native";
import { ExtensionStorage } from "@bacons/apple-targets";
import { setPendingCache } from "./pendingCache";

const APP_GROUP = "group.com.fryday.shared";

// iOS App Group 파일 (NSFileCoordinator 기반, UserDefaults 크로스프로세스 sync 이슈 회피)
const PENDING_FILE = "widget-pending.json";
const TODOS_FILE = "widget-todos.json";
const STATE_FILE = "widget-state.json";

const WIDGET_KINDS = ["FrydayWidget"];

const AndroidWidget = NativeModules.FrydayWidget;

function reloadAllWidgetKinds() {
  for (const kind of WIDGET_KINDS) {
    try {
      ExtensionStorage.reloadWidget(kind);
    } catch {}
  }
}

const HEX_TO_CODE = {
  "#FF5B22": "OR",
  "#693838": "BR",
  "#82B236": "LG",
  "#9351A1": "VL",
  "#D0509D": "DP",
  "#3E78AE": "CB",
  "#AA7459": "MB",
  "#3CB492": "MT",
  "#F06B9C": "PK",
};

function toCategoryCode(colorHex) {
  if (!colorHex) return "OR";
  return HEX_TO_CODE[colorHex.toUpperCase()] || "OR";
}

function toWidgetTodo(todo) {
  return {
    id: String(todo.id),
    title: todo.title || todo.description || todo.name || "",
    categoryCode: toCategoryCode(todo.categoryColor || todo.colorHex),
    isDone: !!todo.done,
  };
}

function buildTodosPayload(todosByDate = {}) {
  const payload = {};
  for (const [date, todos] of Object.entries(todosByDate)) {
    payload[date] = (todos ?? []).map(toWidgetTodo);
  }
  return payload;
}

// -------- iOS 파일 storage 헬퍼 --------

function iosReadJSON(fileName, fallback) {
  try {
    const raw = ExtensionStorage.readAppGroupFile(APP_GROUP, fileName);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function iosWriteJSON(fileName, value) {
  try {
    ExtensionStorage.writeAppGroupFile(APP_GROUP, fileName, JSON.stringify(value));
  } catch {}
}

function iosReadState() {
  return iosReadJSON(STATE_FILE, {}) ?? {};
}

function iosMergeState(patch) {
  const cur = iosReadState();
  iosWriteJSON(STATE_FILE, { ...cur, ...patch });
}

function iosReadPending() {
  const s = iosReadJSON(PENDING_FILE, null);
  if (!s || typeof s !== "object") return { ids: [] };
  return {
    ids: Array.isArray(s.ids) ? s.ids.map(String) : [],
  };
}

function iosWritePending(state) {
  iosWriteJSON(PENDING_FILE, {
    ids: state.ids ?? [],
  });
}

// pending 로그를 id 별 count 로 집계 → 홀수만 flip 대상 (parity model)
function computeFlipCounts(ids) {
  const counts = {};
  ids.forEach((id) => {
    const key = String(id);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

// successful 리스트에서 각 id 를 latest 에서 count 만큼 제거 (index 기반)
function removeSuccessfulFromLatest(latestIds, successful) {
  const remaining = [...latestIds];
  for (const id of successful) {
    const idx = remaining.indexOf(String(id));
    if (idx !== -1) remaining.splice(idx, 1);
  }
  return remaining;
}

// successful 을 count 기반 flip 으로 todos.json 반영
// (같은 id 짝수 번 처리 → net no change, 홀수 → 1회 flip)
function applyCountFlipToTodos(byDate, successful) {
  const flipCounts = computeFlipCounts(successful);
  const updated = {};
  for (const [date, todos] of Object.entries(byDate)) {
    updated[date] = (todos ?? []).map((t) => {
      const cnt = flipCounts[String(t.id)] || 0;
      return cnt % 2 === 1 ? { ...t, isDone: !t.isDone } : t;
    });
  }
  return updated;
}

// -------- 앱 → 위젯 write --------

export function syncTodosToWidget(todosByDate = {}) {
  if (Platform.OS === "ios") {
    try {
      const existing = iosReadJSON(TODOS_FILE, {}) ?? {};
      const merged = { ...existing, ...buildTodosPayload(todosByDate) };
      iosWriteJSON(TODOS_FILE, merged);
      reloadAllWidgetKinds();
    } catch {}
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      const merged = buildTodosPayload(todosByDate);
      AndroidWidget.syncTodos(JSON.stringify(merged));
      setTimeout(() => {
        try {
          AndroidWidget.reloadWidgets?.();
        } catch {}
      }, 300);
    } catch {}
  }
}

export function syncLoginToWidget(isLoggedIn) {
  if (Platform.OS === "ios") {
    try {
      iosMergeState({ isLoggedIn: !!isLoggedIn });
      reloadAllWidgetKinds();
    } catch {}
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      AndroidWidget.syncLogin(!!isLoggedIn);
    } catch {}
  }
}

export function syncServerErrorToWidget(isServerError) {
  if (Platform.OS === "ios") {
    try {
      iosMergeState({ isServerError: !!isServerError });
      reloadAllWidgetKinds();
    } catch {}
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      AndroidWidget.syncServerError(!!isServerError);
    } catch {}
  }
}

export function clearWidgetForLogout() {
  if (Platform.OS === "ios") {
    try {
      iosWriteJSON(STATE_FILE, { isLoggedIn: false });
      ExtensionStorage.deleteAppGroupFile(APP_GROUP, TODOS_FILE);
      ExtensionStorage.deleteAppGroupFile(APP_GROUP, PENDING_FILE);
      reloadAllWidgetKinds();
    } catch {}
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      AndroidWidget.clearForLogout();
    } catch {}
  }
}

// -------- 위젯 → 앱 read (pending) --------

export function peekPendingToggleIdsSync() {
  if (Platform.OS === "ios") {
    return iosReadPending().ids;
  }
  return null;
}

export async function peekPendingToggleIds() {
  if (Platform.OS === "ios") {
    return iosReadPending().ids;
  }
  if (Platform.OS === "android" && AndroidWidget) {
    try {
      const raw = await AndroidWidget.getPendingToggles();
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function drainPendingToggles(toggleFn) {
  const pending = await peekPendingToggleIds();
  if (pending.length === 0) return;

  const successful = [];
  const failed = [];
  for (const todoId of pending) {
    try {
      await toggleFn(todoId);
      successful.push(todoId);
    } catch {
      failed.push(todoId);
    }
  }

  if (Platform.OS === "ios") {
    // pending 로그에서 처리한 만큼만 제거. 같은 id 여러 번이면 처리한 횟수만큼 뺌.
    try {
      const latest = iosReadPending();
      const remainingIds = removeSuccessfulFromLatest(latest.ids, successful);
      iosWritePending({ ids: remainingIds });
    } catch {}
    // widget-todos.json 에도 net flip 반영 (짝수 처리 → no change, 홀수 → 1회 flip)
    if (successful.length > 0) {
      try {
        const byDate = iosReadJSON(TODOS_FILE, {}) ?? {};
        const updated = applyCountFlipToTodos(byDate, successful);
        iosWriteJSON(TODOS_FILE, updated);
      } catch {}
    }
    reloadAllWidgetKinds();
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      // pending 로그에서 처리한 만큼만 제거
      let remaining = [];
      try {
        const latestRaw = await AndroidWidget.getPendingToggles();
        const latestArr = latestRaw ? JSON.parse(latestRaw) : [];
        remaining = removeSuccessfulFromLatest(
          (Array.isArray(latestArr) ? latestArr : []).map(String),
          successful,
        );
      } catch {
        remaining = failed;
      }

      if (remaining.length > 0 && AndroidWidget.setPendingToggles) {
        await AndroidWidget.setPendingToggles(JSON.stringify(remaining));
      } else {
        await AndroidWidget.clearPendingToggles();
      }
      if (successful.length > 0) {
        try {
          const currentJson = await AndroidWidget.getTodosByDate?.();
          if (currentJson) {
            const byDate = JSON.parse(currentJson);
            const updated = applyCountFlipToTodos(byDate, successful);
            await AndroidWidget.syncTodos(JSON.stringify(updated));
          }
        } catch {}
      } else {
        await AndroidWidget.reloadWidgets();
      }
    } catch {}
  }
}

// 모듈 로드 즉시 pending 캐시 초기화 (Android select 콜드 스타트 race 방지)
peekPendingToggleIds()
  .then((ids) => setPendingCache(ids))
  .catch(() => {});
