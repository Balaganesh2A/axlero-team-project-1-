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

  const dimensions = detectDimensions(normalized);
   const filters = detectFilters(normalized);
   const measure = detectMeasure(normalized)

  if (!measure) {
    return { error: "Unknown measure or dimension" };
  }

  const query: CubeQueryResult["query"] = {
    measures: [measure],
  };

  if (dimensions.length > 0) query.dimensions = dimensions;
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

function detectDimensions(question: string): string[] {
  const dimensions: string[] = [];
  if (/(category|categories)/.test(question)) dimensions.push("orders.category");
  if (/(region|regions)/.test(question)) dimensions.push("orders.region");
  if (/(country|countries)/.test(question)) dimensions.push("orders.country");
  if (/(date|day|month|year)/.test(question)) dimensions.push("orders.order_date");
  if (/(customer|buyer)/.test(question)) dimensions.push("orders.customer_name");
  if (/(product|item)/.test(question)) dimensions.push("orders.product_name");
  if (/(order id|order number)/.test(question)) dimensions.push("orders.order_id");
  
  return dimensions;
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
