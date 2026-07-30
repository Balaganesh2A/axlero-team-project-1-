// Central schema definitions for Cube.dev measures and dimensions.
export const measures = [
  "orders.total_sales",
  "orders.total_profit",
  "orders.total_quantity",
  "orders.total_cost",
  "orders.average_order_value",
  "orders.profit_margin",
  "orders.count",
] as const;

export const dimensions = [
  "orders.category",
  "orders.region",
  "orders.country",
  "orders.order_date",
  "orders.customer_name",
  "orders.product_name",
  "orders.order_id",
] as const;

export type Measure = (typeof measures)[number];
export type Dimension = (typeof dimensions)[number];
