export type MetricKey = "revenue" | "sales" | "profit";

export type MetricUnit = "currency" | "percent";

export type Metric = {
  key: MetricKey;
  label: string;
  value: number;
  unit: MetricUnit;
  summary: string;
};

export type TrendPoint = {
  label: string;
  value: number;
};

const METRICS: Record<MetricKey, Metric> = {
  revenue: {
    key: "revenue",
    label: "Revenue",
    value: 50000,
    unit: "currency",
    summary: "Revenue is ₹50,000",
  },
  sales: {
    key: "sales",
    label: "Sales",
    value: 10,
    unit: "percent",
    summary: "Sales increased by 10%",
  },
  profit: {
    key: "profit",
    label: "Profit",
    value: 20000,
    unit: "currency",
    summary: "Profit is ₹20,000",
  },
};

const REVENUE_TREND: TrendPoint[] = [
  { label: "Feb", value: 34000 },
  { label: "Mar", value: 41000 },
  { label: "Apr", value: 37000 },
  { label: "May", value: 45000 },
  { label: "Jun", value: 48000 },
  { label: "Jul", value: 50000 },
];

export function isMetricKey(value: string): value is MetricKey {
  return value === "revenue" || value === "sales" || value === "profit";
}

export function getMetric(key: MetricKey): Metric {
  return METRICS[key];
}

export function getAllMetrics(): Metric[] {
  return Object.values(METRICS);
}

export function getRevenueTrend(): TrendPoint[] {
  return REVENUE_TREND;
}
