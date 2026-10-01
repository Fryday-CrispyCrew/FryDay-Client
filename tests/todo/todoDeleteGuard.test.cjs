const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const context = vm.createContext({});
vm.runInContext(fs.readFileSync("src/features/todo/lib/todoDeleteGuard.js", "utf8").replace("export ", ""), context);

test("rapid presses send one request and stale UI cannot delete successful ID again", async () => {
  const guard = context.createTodoDeleteGuard();
  let resolve, calls = 0;
  const request = () => { calls++; return new Promise(r => { resolve = r; }); };
  const first = guard.run(30, request);
  for (let i = 0; i < 10; i++) assert.equal(await guard.run("30", request), false);
  assert.equal(calls, 1);
  resolve();
  assert.equal(await first, true);
  assert.equal(await guard.run(30, request), false);
  assert.equal(calls, 1);
});

test("failure releases lock for retry", async () => {
  const guard = context.createTodoDeleteGuard();
  await assert.rejects(guard.run(30, async () => { throw new Error("offline"); }));
  assert.equal(guard.isBlocked(30), false);
  assert.equal(await guard.run(30, async () => {}), true);
});

test("different todo IDs can be deleted independently", async () => {
  const guard = context.createTodoDeleteGuard();
  let resolve;
  const first = guard.run(30, () => new Promise(r => { resolve = r; }));
  assert.equal(await guard.run(31, async () => {}), true);
  resolve();
  assert.equal(await first, true);
});
