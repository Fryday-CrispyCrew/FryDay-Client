import { Platform } from "react-native";
import { ExtensionStorage } from "@bacons/apple-targets";

const APP_GROUP = "group.com.fryday.shared";
const storage = new ExtensionStorage(APP_GROUP);

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

export function syncTodosToWidget(todosByDate = {}) {
  if (Platform.OS !== "ios") return;

  try {
    const payload = {};
    for (const [date, todos] of Object.entries(todosByDate)) {
      payload[date] = (todos ?? []).map(toWidgetTodo);
    }
    storage.set("todosByDateJson", JSON.stringify(payload));
    ExtensionStorage.reloadWidget("FrydayWidget");
  } catch (e) {
    console.warn("[syncWidget] syncTodosToWidget failed:", e);
  }
}

export function syncLoginToWidget(isLoggedIn) {
  if (Platform.OS !== "ios") return;

  try {
    storage.set("isLoggedIn", isLoggedIn ? 1 : 0);
    ExtensionStorage.reloadWidget("FrydayWidget");
  } catch (e) {
    console.warn("[syncWidget] syncLoginToWidget failed:", e);
  }
}

export function clearWidgetForLogout() {
  if (Platform.OS !== "ios") return;

  try {
    storage.set("isLoggedIn", 0);
    storage.remove("todosByDateJson");
    storage.remove("pendingToggleIds");
    ExtensionStorage.reloadWidget("FrydayWidget");
  } catch (e) {
    console.warn("[syncWidget] clearWidgetForLogout failed:", e);
  }
}

export async function drainPendingToggles(toggleFn) {
  if (Platform.OS !== "ios") return;

  const raw = storage.get("pendingToggleIds");
  if (!raw) return;

  let pending = [];
  try {
    pending = JSON.parse(raw);
  } catch {
    pending = [];
  }

  if (!Array.isArray(pending) || pending.length === 0) return;

  const successful = [];
  for (const todoId of pending) {
    try {
      await toggleFn(todoId);
      successful.push(todoId);
    } catch (e) {
      console.warn(`[syncWidget] toggle sync failed for ${todoId}:`, e);
    }
  }

  if (successful.length > 0) {
    const raw = storage.get("todosByDateJson");
    if (raw) {
      try {
        const byDate = JSON.parse(raw);
        const successSet = new Set(successful);
        const updated = {};
        for (const [date, todos] of Object.entries(byDate)) {
          updated[date] = todos.map((t) =>
            successSet.has(t.id) ? { ...t, isDone: !t.isDone } : t,
          );
        }
        storage.set("todosByDateJson", JSON.stringify(updated));
      } catch (e) {
        console.warn("[syncWidget] optimistic todos update failed:", e);
      }
    }
  }

  storage.remove("pendingToggleIds");
  ExtensionStorage.reloadWidget();
}
