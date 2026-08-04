import test from "node:test";
import assert from "node:assert/strict";

import { generateCubeQuery } from "../lib/langchain.ts";
test("maps sales by category to a Cube query", async () => {
  const result = await generateCubeQuery("Show sales by category");

  assert.deepEqual(result, {
    query: {
      measures: ["orders.total_sales"],
      dimensions: ["orders.category"],
    },
  });
});

test("maps profit by country to a Cube query", async () => {
  const result = await generateCubeQuery("Show profit by country");

  assert.deepEqual(result, {
    query: {
      measures: ["orders.total_profit"],
      dimensions: ["orders.country"],
    },
  });
});

test("maps quantity requests to a measure-only Cube query", async () => {
  const result = await generateCubeQuery("Show quantity");

  assert.deepEqual(result, {
    query: {
      measures: ["orders.total_quantity"],
    },
  });
});

test("maps average order value by region to a Cube query", async () => {
  const result = await generateCubeQuery("Show average order value by region");

  assert.deepEqual(result, {
    query: {
      measures: ["orders.average_order_value"],
      dimensions: ["orders.region"],
    },
  });
});

test("maps profit margin requests to a Cube query", async () => {
  const result = await generateCubeQuery("Show profit margin");

  assert.deepEqual(result, {
    query: {
      measures: ["orders.profit_margin"],
    },
  });
});

test("maps count all orders to a Cube query", async () => {
  const result = await generateCubeQuery("Count all orders");

  assert.deepEqual(result, {
    query: {
      measures: ["orders.count"],
    },
  });
});

test("rejects unknown measures or dimensions", async () => {
  const result = await generateCubeQuery("Show employee salary");

  assert.deepEqual(result, {
    error: "Unknown measure or dimension",
  });
});
