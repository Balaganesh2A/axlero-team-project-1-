import { dimensions, measures } from "./schema.ts";

export interface CubeQueryResult {
  query?: {
    measures?: string[];
    dimensions?: string[];
    filters?: { member: string; operator: string; values: string[] }[];
  };
  error?: string;
}

// Parse a natural language question into a Cube.dev query object.
// This implementation uses deterministic keyword matching so it can run
// without a live LLM or network dependency.
export function parseCubeQuery(question: string): CubeQueryResult {
  const normalized = question.trim().toLowerCase();

  if (!normalized) {
    return { error: "Unknown measure or dimension" };
  }

  const measure = detectMeasure(normalized);
  const dimension = detectDimension(normalized);
  const filters = detectFilters(normalized);

  if (!measure) {
    return { error: "Unknown measure or dimension" };
  }

  const query: CubeQueryResult["query"] = {
    measures: [measure],
  };

  if (dimension) query.dimensions = [dimension];
  if (filters.length > 0) query.filters = filters;

  return { query };
}

function detectMeasure(question: string): string | null {
  if (/(sales|revenue)/.test(question)) return "orders.total_sales";
  if (/(profit margin|margin)/.test(question)) return "orders.profit_margin";
  if (/(profit|earnings)/.test(question)) return "orders.total_profit";
  if (/(quantity|sold)/.test(question)) return "orders.total_quantity";
  if (/(average order value|average)/.test(question)) return "orders.average_order_value";
  if (/(count|total orders|all orders|orders)/.test(question)) return "orders.count";

  return null;
}

function detectDimension(question: string): string | null {
  if (/(category|categories)/.test(question)) return "orders.category";
  if (/(region|regions)/.test(question)) return "orders.region";
  if (/(country|countries)/.test(question)) return "orders.country";
  if (/(date|day|month|year)/.test(question)) return "orders.order_date";
  if (/(customer|buyer)/.test(question)) return "orders.customer_name";
  if (/(product|item)/.test(question)) return "orders.product_name";
  if (/(order id|order number)/.test(question)) return "orders.order_id";

  return null;
}

function detectFilters(question: string): { member: string; operator: string; values: string[] }[] {
  const filters: { member: string; operator: string; values: string[] }[] = [];

  const regions = ["west", "east", "central", "south", "north"];
  for (const region of regions) {
    if (new RegExp(`\\b${region}\\b`).test(question)) {
      filters.push({
        member: "orders.region",
        operator: "equals",
        values: [region.charAt(0).toUpperCase() + region.slice(1)],
      });
    }
  }

  return filters;
}
