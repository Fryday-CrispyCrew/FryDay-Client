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
  if (!s || typeof s !== "object") return { ids: [], before: {} };
  return {
    ids: Array.isArray(s.ids) ? s.ids.map(String) : [],
    before: s.before && typeof s.before === "object" ? s.before : {},
  };
}

function iosWritePending(state) {
  iosWriteJSON(PENDING_FILE, {
    ids: state.ids ?? [],
    before: state.before ?? {},
  });
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

export function peekPendingBeforeStatesSync() {
  if (Platform.OS === "ios") {
    return iosReadPending().before;
  }
  return null;
}

export async function peekPendingBeforeStates() {
  if (Platform.OS === "ios") {
    return iosReadPending().before;
  }
  if (Platform.OS === "android" && AndroidWidget) {
    try {
      const raw = await AndroidWidget.getPendingBeforeStates?.();
      if (!raw) return {};
      const obj = JSON.parse(raw);
      return typeof obj === "object" && obj !== null ? obj : {};
    } catch {
      return {};
    }
  }
  return {};
}

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
    // 성공한 todo 는 widget-todos.json 에서도 isDone 반전 (위젯이 flip 뒤 진짜 상태 보게)
    if (successful.length > 0) {
      try {
        const byDate = iosReadJSON(TODOS_FILE, {}) ?? {};
        const successSet = new Set(successful);
        const updated = {};
        for (const [date, todos] of Object.entries(byDate)) {
          updated[date] = (todos ?? []).map((t) =>
            successSet.has(String(t.id)) ? { ...t, isDone: !t.isDone } : t,
          );
        }
        iosWriteJSON(TODOS_FILE, updated);
      } catch {}
    }
    // Drain 중 위젯이 새로 추가한 pending 이 있을 수 있음 → 최신 read 후 successful 만 제거
    try {
      const latest = iosReadPending();
      const successSet = new Set(successful);
      const remainingIds = latest.ids.filter((id) => !successSet.has(id));
      const remainingBefore = {};
      for (const [k, v] of Object.entries(latest.before)) {
        if (!successSet.has(k)) remainingBefore[k] = v;
      }
      iosWritePending({ ids: remainingIds, before: remainingBefore });
    } catch {}
    reloadAllWidgetKinds();
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      let remaining = [];
      try {
        const latestRaw = await AndroidWidget.getPendingToggles();
        const latestArr = latestRaw ? JSON.parse(latestRaw) : [];
        const successSet = new Set(successful);
        remaining = (Array.isArray(latestArr) ? latestArr : [])
          .map(String)
          .filter((id) => !successSet.has(id));
      } catch {
        remaining = failed;
      }

      if (remaining.length > 0 && AndroidWidget.setPendingToggles) {
        await AndroidWidget.setPendingToggles(JSON.stringify(remaining));
        try {
          const beforeRaw = await AndroidWidget.getPendingBeforeStates?.();
          if (beforeRaw && AndroidWidget.setPendingBeforeStates) {
            const beforeObj = JSON.parse(beforeRaw);
            const successSet = new Set(successful);
            const newBefore = {};
            for (const [k, v] of Object.entries(beforeObj)) {
              if (!successSet.has(k)) newBefore[k] = v;
            }
            await AndroidWidget.setPendingBeforeStates(JSON.stringify(newBefore));
          }
        } catch {}
      } else {
        await AndroidWidget.clearPendingToggles();
      }
      if (successful.length > 0) {
        try {
          const currentJson = await AndroidWidget.getTodosByDate?.();
          if (currentJson) {
            const byDate = JSON.parse(currentJson);
            const successSet = new Set(successful);
            const updated = {};
            for (const [date, todos] of Object.entries(byDate)) {
              updated[date] = todos.map((t) =>
                successSet.has(String(t.id)) ? { ...t, isDone: !t.isDone } : t,
              );
            }
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
