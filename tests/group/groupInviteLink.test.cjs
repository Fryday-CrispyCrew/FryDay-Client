const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function load() {
  const context = vm.createContext({});
  vm.runInContext(
    fs.readFileSync("src/features/group/lib/groupInviteLink.js", "utf8").replace(/export /g, ""),
    context,
  );
  return context;
}

test("builds a share link that the invite landing page understands", () => {
  const { buildInviteLink } = load();
  assert.equal(buildInviteLink("FRY123"), "https://app.fryday.co.kr/invite/?code=FRY123");
});

test("share message carries both the readable code and the link", () => {
  const { buildInviteMessage } = load();
  const message = buildInviteMessage("FRY123");
  assert.match(message, /그룹 코드 : FRY123/);
  assert.match(message, /https:\/\/app\.fryday\.co\.kr\/invite\/\?code=FRY123/);
});

test("reads the code from the https invite link", () => {
  const { parseInviteCode } = load();
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite/?code=FRY123"), "FRY123");
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite?code=FRY123"), "FRY123");
});

test("reads the code from the app scheme used by the landing page button", () => {
  const { parseInviteCode } = load();
  assert.equal(parseInviteCode("fryday://group/join?code=FRY123"), "FRY123");
});

test("normalizes lowercase and stray characters the same way the input screen does", () => {
  const { parseInviteCode } = load();
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite/?code=fry-123"), "FRY123");
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite/?utm=kakao&code=fry123#top"), "FRY123");
});

test("input normalization keeps typing up to six characters", () => {
  const { normalizeGroupCode } = load();
  assert.equal(normalizeGroupCode("fry-1"), "FRY1");
  assert.equal(normalizeGroupCode("fry1234"), "FRY123");
  assert.equal(normalizeGroupCode(undefined), "");
});

test("a link with a seven character code is rejected instead of truncated", () => {
  const { parseInviteCode } = load();
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite/?code=FRY1234"), null);
});

test("ignores links that are not invites or carry a broken code", () => {
  const { parseInviteCode } = load();
  assert.equal(parseInviteCode("https://app.fryday.co.kr/?code=FRY123"), null);
  assert.equal(parseInviteCode("https://evil.example/invite/?code=FRY123"), null);
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite/?code=FRY12"), null);
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite/"), null);
  assert.equal(parseInviteCode("https://app.fryday.co.kr/invite/?code=%E0%A4%A"), null);
  assert.equal(parseInviteCode("fryday://todo"), null);
  assert.equal(parseInviteCode(null), null);
});
