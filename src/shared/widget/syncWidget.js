import { NativeModules, Platform } from "react-native";
import { ExtensionStorage } from "@bacons/apple-targets";

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
    } catch {}
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      const merged = buildTodosPayload(todosByDate);
      AndroidWidget.syncTodos(JSON.stringify(merged));
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

export function peekPendingToggleIdsSync() {
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
    if (failed.length > 0) {
      storage.set("pendingToggleIds", JSON.stringify(failed));
    } else {
      storage.remove("pendingToggleIds");
    }
    reloadAllWidgetKinds();
    return;
  }

  if (Platform.OS === "android" && AndroidWidget) {
    try {
      if (failed.length > 0 && AndroidWidget.setPendingToggles) {
        await AndroidWidget.setPendingToggles(JSON.stringify(failed));
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
