import { NativeModules, Platform } from "react-native";
import { ExtensionStorage } from "@bacons/apple-targets";
import { setPendingCache } from "./pendingCache";

const APP_GROUP = "group.com.fryday.shared";
const storage = new ExtensionStorage(APP_GROUP);

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

export function syncTodosToWidget(todosByDate = {}) {
  if (Platform.OS === "ios") {
    try {
      let existing = {};
      const raw = storage.get("todosByDateJson");
      if (raw) {
        try {
          existing = JSON.parse(raw) ?? {};
        } catch {
          existing = {};
        }
      }
      const merged = { ...existing, ...buildTodosPayload(todosByDate) };
      storage.set("todosByDateJson", JSON.stringify(merged));
      reloadAllWidgetKinds();
      // 크로스프로세스 UserDefaults 전파 지연 커버용 다중 재시도
      setTimeout(reloadAllWidgetKinds, 100);
      setTimeout(reloadAllWidgetKinds, 500);
      setTimeout(reloadAllWidgetKinds, 1500);
    } catch {}
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      const merged = buildTodosPayload(todosByDate);
      AndroidWidget.syncTodos(JSON.stringify(merged));
      // 위젯 리로드 async 이므로 재시도로 확실히 반영
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
      storage.set("isLoggedIn", isLoggedIn ? 1 : 0);
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
      storage.set("isServerError", isServerError ? 1 : 0);
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
      storage.set("isLoggedIn", 0);
      storage.remove("isServerError");
      storage.remove("todosByDateJson");
      storage.remove("pendingToggleIds");
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

export function peekPendingBeforeStatesSync() {
  if (Platform.OS === "ios") {
    let raw = null;
    try {
      const freshStorage = new ExtensionStorage(APP_GROUP);
      raw = freshStorage.get("pendingBeforeStates");
    } catch {
      raw = storage.get("pendingBeforeStates");
    }
    if (!raw) return {};
    try {
      const obj = JSON.parse(raw);
      return typeof obj === "object" && obj !== null ? obj : {};
    } catch {
      return {};
    }
  }
  return null;
}

export async function peekPendingBeforeStates() {
  if (Platform.OS === "ios") {
    return peekPendingBeforeStatesSync() ?? {};
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
    let raw = null;
    try {
      const freshStorage = new ExtensionStorage(APP_GROUP);
      raw = freshStorage.get("pendingToggleIds");
    } catch {
      raw = storage.get("pendingToggleIds");
    }
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }
  return null;
}

export async function peekPendingToggleIds() {
  if (Platform.OS === "ios") {
    const raw = storage.get("pendingToggleIds");
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
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
    if (successful.length > 0) {
      const raw = storage.get("todosByDateJson");
      if (raw) {
        try {
          const byDate = JSON.parse(raw);
          const successSet = new Set(successful);
          const updated = {};
          for (const [date, todos] of Object.entries(byDate)) {
            updated[date] = todos.map((t) =>
              successSet.has(String(t.id)) ? { ...t, isDone: !t.isDone } : t,
            );
          }
          storage.set("todosByDateJson", JSON.stringify(updated));
        } catch {}
      }
    }
    // Drain 중 위젯이 새로 추가한 pending 이 있을 수 있음 → 최신 storage 다시 읽어서 successful 만 제거
    try {
      const latestRaw = storage.get("pendingToggleIds");
      const latestArr = latestRaw ? JSON.parse(latestRaw) : [];
      const successSet = new Set(successful);
      const remaining = (Array.isArray(latestArr) ? latestArr : [])
        .map(String)
        .filter((id) => !successSet.has(id));
      if (remaining.length > 0) {
        storage.set("pendingToggleIds", JSON.stringify(remaining));
      } else {
        storage.remove("pendingToggleIds");
      }
      // before states 도 successful 항목 제거
      const beforeRaw = storage.get("pendingBeforeStates");
      if (beforeRaw) {
        try {
          const beforeObj = JSON.parse(beforeRaw);
          const newBefore = {};
          for (const [k, v] of Object.entries(beforeObj)) {
            if (!successSet.has(k)) newBefore[k] = v;
          }
          if (Object.keys(newBefore).length > 0) {
            storage.set("pendingBeforeStates", JSON.stringify(newBefore));
          } else {
            storage.remove("pendingBeforeStates");
          }
        } catch {}
      }
    } catch {
      if (failed.length > 0) {
        storage.set("pendingToggleIds", JSON.stringify(failed));
      } else {
        storage.remove("pendingToggleIds");
      }
    }
    reloadAllWidgetKinds();
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      // Drain 중 위젯이 새로 추가한 pending 이 있을 수 있음 → 최신 storage 다시 읽어서 successful 만 제거
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
        // before states 도 successful 제거 후 write
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
