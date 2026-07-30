import test from "node:test";
import assert from "node:assert/strict";

import { getBotResponse, responses } from "../lib/responses.ts";

test("returns the revenue response when revenue is mentioned", () => {
  assert.equal(getBotResponse("Show Revenue"), responses.revenue);
});

test("returns the sales response when sales is mentioned", () => {
  assert.equal(getBotResponse("Show Sales"), responses.sales);
});

test("returns the profit response when profit is mentioned", () => {
  assert.equal(getBotResponse("What is our profit"), responses.profit);
});

test("returns the fallback response for unrelated input", () => {
  assert.equal(getBotResponse("Hello"), responses.default);
});

test("returns the fallback response for empty input", () => {
  assert.equal(getBotResponse("   "), responses.default);
});
