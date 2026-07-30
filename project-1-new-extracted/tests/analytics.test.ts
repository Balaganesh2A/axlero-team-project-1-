import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllMetrics,
  getMetric,
  getRevenueTrend,
  isMetricKey,
} from "../lib/analytics.ts";

test("isMetricKey accepts only known metric keys", () => {
  assert.equal(isMetricKey("revenue"), true);
  assert.equal(isMetricKey("sales"), true);
  assert.equal(isMetricKey("profit"), true);
  assert.equal(isMetricKey("expenses"), false);
  assert.equal(isMetricKey(""), false);
});

test("getMetric returns the full metric record for each key", () => {
  assert.deepEqual(getMetric("revenue"), {
    key: "revenue",
    label: "Revenue",
    value: 50000,
    unit: "currency",
    summary: "Revenue is ₹50,000",
  });
  assert.deepEqual(getMetric("sales"), {
    key: "sales",
    label: "Sales",
    value: 10,
    unit: "percent",
    summary: "Sales increased by 10%",
  });
  assert.deepEqual(getMetric("profit"), {
    key: "profit",
    label: "Profit",
    value: 20000,
    unit: "currency",
    summary: "Profit is ₹20,000",
  });
});

test("getAllMetrics returns all three metrics", () => {
  const metrics = getAllMetrics();

  assert.equal(metrics.length, 3);
  assert.deepEqual(
    metrics.map((metric) => metric.key).sort(),
    ["profit", "revenue", "sales"]
  );
});

test("getRevenueTrend returns an ordered, non-empty series", () => {
  const trend = getRevenueTrend();

  assert.ok(trend.length > 0);
  for (const point of trend) {
    assert.equal(typeof point.label, "string");
    assert.equal(typeof point.value, "number");
  }
});
