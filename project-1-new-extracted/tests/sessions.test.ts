import test from "node:test";
import assert from "node:assert/strict";

import {
  addMessage,
  clearSession,
  createSession,
  getSession,
} from "../lib/sessions.ts";

test("createSession starts a session with an empty history", () => {
  const messages = createSession("session-create");

  assert.deepEqual(messages, []);
  assert.deepEqual(getSession("session-create"), []);
});

test("getSession returns undefined for an unknown session", () => {
  assert.equal(getSession("does-not-exist"), undefined);
});

test("addMessage creates the session automatically when it does not exist", () => {
  const history = addMessage("session-auto", { role: "user", content: "Show revenue" });

  assert.deepEqual(history, [{ role: "user", content: "Show revenue" }]);
  assert.deepEqual(getSession("session-auto"), [{ role: "user", content: "Show revenue" }]);
});

test("addMessage appends to existing history in order", () => {
  addMessage("session-123", { role: "user", content: "Show revenue" });
  addMessage("session-123", { role: "assistant", content: "Revenue is ₹50,000" });
  addMessage("session-123", { role: "user", content: "Show sales" });
  addMessage("session-123", { role: "assistant", content: "Sales increased by 10%" });

  assert.deepEqual(getSession("session-123"), [
    { role: "user", content: "Show revenue" },
    { role: "assistant", content: "Revenue is ₹50,000" },
    { role: "user", content: "Show sales" },
    { role: "assistant", content: "Sales increased by 10%" },
  ]);
});

test("separate sessions keep independent histories", () => {
  addMessage("session-a", { role: "user", content: "from a" });
  addMessage("session-b", { role: "user", content: "from b" });

  assert.deepEqual(getSession("session-a"), [{ role: "user", content: "from a" }]);
  assert.deepEqual(getSession("session-b"), [{ role: "user", content: "from b" }]);
});

test("clearSession empties the history without deleting the session", () => {
  addMessage("session-clear", { role: "user", content: "hi" });

  clearSession("session-clear");

  assert.deepEqual(getSession("session-clear"), []);
});
