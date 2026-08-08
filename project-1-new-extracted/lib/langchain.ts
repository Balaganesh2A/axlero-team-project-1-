import { cubeQuerySystemPrompt } from "./prompts.ts";
import { parseCubeQuery } from "./parser.ts";
import { validateCubeQuery } from "./validator.ts";

// Main orchestration module for Cube.dev query generation.
// This project does not connect to a live LLM service, so the module uses the
// prompt and parser pipeline in a deterministic way that mirrors the intended flow.
export async function generateCubeQuery(question: string) {
  const parsed = parseCubeQuery(question);
  const validated = validateCubeQuery(parsed);

  return validated;
}

// --- Plain-English answer formatting ---

const MEASURE_LABELS: Record<string, { label: string; format: "currency" | "percent" | "number" }> = {
  "orders.total_sales": { label: "total sales", format: "currency" },
  "orders.total_profit": { label: "total profit", format: "currency" },
  "orders.profit_margin": { label: "profit margin", format: "percent" },
  "orders.total_quantity": { label: "total quantity sold", format: "number" },
  "orders.average_order_value": { label: "average order value", format: "currency" },
  "orders.count": { label: "total orders", format: "number" },
};

const DIMENSION_LABELS: Record<string, string> = {
  "orders.category": "category",
  "orders.region": "region",
  "orders.country": "country",
  "orders.order_date": "date",
  "orders.customer_name": "customer",
  "orders.product_name": "product",
  "orders.order_id": "order ID",
};

function formatValue(rawValue: string | number, format: "currency" | "percent" | "number"): string {
  const num = typeof rawValue === "string" ? parseFloat(rawValue) : rawValue;

  if (Number.isNaN(num)) return String(rawValue);

  if (format === "currency") {
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (format === "percent") {
    return `${num.toFixed(1)}%`;
  }
  return num.toLocaleString("en-IN");
}

export function formatAnswer(
  query: { measures?: string[]; dimensions?: string[] } | undefined,
  data: Record<string, string | number>[]
): string {
  if (!query?.measures?.length || !data?.length) {
    return "I couldn't find data for that question.";
  }

  const measureKey = query.measures[0];
  const measureInfo = MEASURE_LABELS[measureKey] ?? { label: measureKey, format: "number" as const };
  const dimensionKey = query.dimensions?.[0];

  if (!dimensionKey) {
    const value = data[0][measureKey];
    return `Your ${measureInfo.label} is ${formatValue(value, measureInfo.format)}.`;
  }

  const dimensionLabel = DIMENSION_LABELS[dimensionKey] ?? dimensionKey;
  const lines = data.map((row) => {
    const dimValue = row[dimensionKey];
    const measureValue = row[measureKey];
    return `${dimValue}: ${formatValue(measureValue, measureInfo.format)}`;
  });

  return `Here's ${measureInfo.label} by ${dimensionLabel}:\n${lines.join("\n")}`;
}

export { cubeQuerySystemPrompt };