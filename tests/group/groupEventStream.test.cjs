const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function setup() {
  let next = 0;
  const timers = new Map();
  const context = vm.createContext({
    Date,
    setTimeout: (fn, ms) => { timers.set(++next, { fn, ms }); return next; },
    clearTimeout: (id) => timers.delete(id),
  });
  vm.runInContext(fs.readFileSync("src/features/group/lib/groupEventStream.js", "utf8").replace(/export /g, ""), context);
  return { context, timers };
}
const flush = () => new Promise(setImmediate);

test("parses split CRLF, multiline data and ignores heartbeat comments", () => {
  const { context } = setup();
  const events = [];
  const parse = context.createSSEParser(e => events.push({ ...e }));
  parse("event: connected\r");
  parse("\ndata: ok\r\n\r\n:ping\n\nevent: group-pro");
  parse('gress\ndata: {"memberUserId":2}\n\nevent: test\ndata: a\ndata: b\n\n');
  assert.deepEqual(events, [
    { type: "connected", data: "ok" },
    { type: "group-progress", data: '{"memberUserId":2}' },
    { type: "test", data: "a\nb" },
  ]);
});

test("reconnects after EOF, delivers connected on each connection and aborts on cleanup", async () => {
  const { context, timers } = setup();
  const requests = [], events = [];
  const stop = context.openGroupEventStream({
    url: "https://example.test/events", getToken: async () => "test",
    recoverAuth: async () => {}, onEvent: e => events.push(e.type), onUnavailable: () => {},
    createRequest: () => {
      const xhr = { open() {}, setRequestHeader() {}, send() {}, abort() { this.aborted = true; } };
      requests.push(xhr);
      return xhr;
    },
  });
  await flush();
  const connect = xhr => {
    Object.assign(xhr, { readyState: 3, status: 200, responseText: "event: connected\ndata: ok\n\n" });
    xhr.onprogress();
  };
  connect(requests[0]);
  requests[0].onload();
  assert.equal(requests[0].aborted, true);
  const retry = [...timers.values()].find(t => t.ms === 1000);
  assert.ok(retry);
  retry.fn();
  await flush();
  connect(requests[1]);
  assert.deepEqual(events, ["connected", "connected"]);
  stop();
  assert.equal(requests[1].aborted, true);
});

test("404 stops retries and reports inaccessible group", async () => {
  const { context, timers } = setup();
  let xhr, unavailable = 0;
  context.openGroupEventStream({
    url: "/events", getToken: async () => "test", recoverAuth: async () => {},
    onEvent() {}, onUnavailable() { unavailable++; },
    createRequest: () => (xhr = { open() {}, setRequestHeader() {}, send() {}, abort() {} }),
  });
  await flush();
  Object.assign(xhr, { readyState: 2, status: 404 });
  xhr.onreadystatechange();
  assert.equal(unavailable, 1);
  assert.equal(timers.size, 0);
});

test("cleanup during token lookup never starts a request", async () => {
  const { context } = setup();
  let resolve, requests = 0;
  const stop = context.openGroupEventStream({
    url: "/events", getToken: () => new Promise(r => { resolve = r; }),
    createRequest: () => { requests++; },
  });
  stop();
  resolve("test");
  await flush();
  assert.equal(requests, 0);
});

test("Seoul date changes at UTC 15:00", () => {
  const { context } = setup();
  assert.equal(context.getSeoulDate(Date.parse("2026-09-29T14:59:59Z")), "2026-09-29");
  assert.equal(context.getSeoulDate(Date.parse("2026-09-29T15:00:00Z")), "2026-09-30");
});
