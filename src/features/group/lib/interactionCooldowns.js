// 화면이 언마운트되어도 요청 상태와 만료 시각은 유지한다.
const entries = new Map();
const listeners = new Set();
let revision = 0;

function notify() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export const subscribeInteractionCooldowns = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getInteractionCooldownSnapshot = () => revision;
export const interactionCooldownKey = (userId, groupId, memberId, type) =>
  JSON.stringify([String(userId), String(groupId), String(memberId), type]);

export function isInteractionBlocked(key) {
  const entry = entries.get(key);
  return !!entry && (entry.pending || entry.expiresAt > Date.now());
}

export function beginInteraction(key) {
  if (isInteractionBlocked(key)) return false;
  entries.set(key, { pending: true });
  notify();
  return true;
}

export function finishInteraction(key, cooldown) {
  if (cooldown) {
    const entry = { pending: false, expiresAt: Date.now() + 30_000 };
    entries.set(key, entry);
    setTimeout(() => {
      if (entries.get(key) === entry) {
        entries.delete(key);
        notify();
      }
    }, 30_000);
  } else {
    entries.delete(key);
  }
  notify();
}

// 백그라운드에서 지연된 타이머를 기다리지 않고 실제 만료 시각으로 갱신한다.
export function refreshInteractionCooldowns() {
  for (const [key, entry] of entries) {
    if (!entry.pending && entry.expiresAt <= Date.now()) entries.delete(key);
  }
  notify();
}
