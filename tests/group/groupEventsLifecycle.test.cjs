const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function setup() {
  let deps, cleanup, stream, appListener;
  let opens = 0, closes = 0, details = 0, todos = 0;
  const timers = new Map();
  let id = 0;
  const client = {
    fetchQuery: async () => { details++; },
    invalidateQueries: async (options) => { if (options.refetchType !== "none") todos++; },
    getQueryData: () => undefined,
  };
  const source = fs.readFileSync("src/features/group/hooks/useGroupEvents.js", "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace("export default function", "function");
  const context = vm.createContext({
    useEffect(fn, next) {
      if (deps && next.every((v, i) => v === deps[i])) return;
      cleanup?.();
      deps = next;
      cleanup = fn();
    },
    useQueryClient: () => client,
    AppState: { currentState: "active", addEventListener: (_, fn) => {
      appListener = fn; return { remove() {} };
    } },
    api: { getUri: ({ url }) => url },
    getAccessToken() {},
    groupApi: { getGroup() {} },
    groupKeys: { detail: id => ["groups", String(id), "detail"] },
    getSeoulDate: () => "2026-10-01",
    openGroupEventStream(options) {
      opens++; stream = options; return () => { closes++; };
    },
    setTimeout(fn) { timers.set(++id, fn); return id; },
    clearTimeout(key) { timers.delete(key); },
    setInterval() {}, clearInterval() {},
  });
  vm.runInContext(source, context);
  return {
    render: id => context.useGroupEvents(id),
    event: type => stream.onEvent({ type }),
    app: state => appListener(state),
    flush() { const list = [...timers.values()]; timers.clear(); list.forEach(fn => fn()); },
    counts: () => ({ opens, closes, details, todos }),
  };
}

test("same group route changes retain one stream; connected refreshes detail once", () => {
  const h = setup();
  h.render("6");
  h.event("connected");
  h.flush();
  for (let i = 0; i < 30; i++) h.render("6");
  assert.deepEqual(h.counts(), { opens: 1, closes: 0, details: 1, todos: 0 });
  h.event("group-progress");
  h.flush();
  assert.deepEqual(h.counts(), { opens: 1, closes: 0, details: 2, todos: 1 });
  h.render(null);
  assert.equal(h.counts().closes, 1);
});

test("background/resume reconnects and refreshes detail and todos exactly once", () => {
  const h = setup();
  h.render("6"); h.event("connected"); h.flush();
  h.app("background");
  h.app("active");
  h.event("connected"); h.flush();
  assert.deepEqual(h.counts(), { opens: 2, closes: 1, details: 2, todos: 1 });
});

test("changing groups closes previous stream and cancels scheduled refresh", () => {
  const h = setup();
  h.render("6"); h.event("connected");
  h.render("7"); h.event("connected"); h.flush();
  assert.deepEqual(h.counts(), { opens: 2, closes: 1, details: 1, todos: 0 });
});
