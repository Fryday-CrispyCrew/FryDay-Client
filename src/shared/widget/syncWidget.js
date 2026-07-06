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

export function syncTodosToWidget(todos = []) {
  if (Platform.OS !== "ios") return;

  try {
    const widgetTodos = todos.map(toWidgetTodo);
    storage.set("todosJson", JSON.stringify(widgetTodos));
    ExtensionStorage.reloadWidget();
  } catch (e) {
    console.warn("[syncWidget] syncTodosToWidget failed:", e);
  }
}

export function syncLoginToWidget(isLoggedIn) {
  if (Platform.OS !== "ios") return;

  try {
    storage.set("isLoggedIn", isLoggedIn ? 1 : 0);
    ExtensionStorage.reloadWidget();
  } catch (e) {
    console.warn("[syncWidget] syncLoginToWidget failed:", e);
  }
}

export function clearWidgetForLogout() {
  if (Platform.OS !== "ios") return;

  try {
    storage.set("isLoggedIn", 0);
    storage.remove("todosJson");
    storage.remove("pendingToggleIds");
    storage.remove("completedTodoIds");
    ExtensionStorage.reloadWidget();
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

  for (const todoId of pending) {
    try {
      await toggleFn(todoId);
    } catch (e) {
      console.warn(`[syncWidget] toggle sync failed for ${todoId}:`, e);
    }
  }

  storage.remove("pendingToggleIds");
  ExtensionStorage.reloadWidget();
}
