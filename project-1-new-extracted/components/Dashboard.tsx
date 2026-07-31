"use client";

import { useEffect, useState } from "react";

type MetricKey = "sales"  | "profit"  | "orders"  | "margin";

type MetricStatus = "loading" | "ready" | "error";

type MetricState = {
  label: string;
  icon: string;
  value: string;
  detail: string;
  status: MetricStatus;
};

type MetricDef = {
  key: MetricKey;
  label: string;
  question: string;
  icon: string;
};

const METRIC_DEFS: MetricDef[] = [
  { key: "sales", label: "Total Sales", question: "orders.total_sales", icon: "💰" },
  { key: "profit", label: "Total Profit", question: "orders.total_profit", icon: "📈" },
  { key: "orders", label: "Total Orders", question: "orders.count", icon: "📦" },
  { key: "margin", label: "Profit Margin", question: "orders.profit_margin",icon: "📊" },
];


function extractHeadline(answer: string): string {
  const match = answer.match(/₹[\d,]+|\d+%/);
  return match ? match[0] : answer;
}

function createInitialMetrics(): Record<MetricKey, MetricState> {
  return METRIC_DEFS.reduce(
    (acc, def) => {
      acc[def.key] = { label: def.label, icon: def.icon, value: "", detail: "", status: "loading" };
      return acc;
    },
    {} as Record<MetricKey, MetricState>
  );
}

function MetricCard({ metric }: { metric: MetricState }) {
  return (
    <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-2xl">{metric.icon}</span>
        <span className="text-xs uppercase tracking-tight text-slate-400 truncate">{metric.label}</span>
      </div>

      {metric.status === "loading" && (
        <div className="mt-5 h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
      )}

      {metric.status === "error" && (
        <p className="mt-5 text-sm text-red-500">Couldn&apos;t load {metric.label.toLowerCase()}.</p>
      )}

      {metric.status === "ready" && (
        <>
          <p className="mt-4 text-2xl font-semibold text-slate-900">{metric.value}</p>
          
        </>
      )}
    </div>
  );
}


async function fetchCubeGrouped(measure: string, dimension: string) {
  const res = await fetch("http://localhost:4000/cubejs-api/v1/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: { measures: [measure], dimensions: [dimension] },
    }),
  });
  const json = await res.json();
  return (json.data ?? []).map((row: any) => ({
    label: row[dimension],
    value: Number(row[measure]),
  }));
}

function ProfitByRegionChart({
  selectedValue,
  onSelect,
}: {
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) {
  const [data, setData] = useState<{ label: string; value: number }[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCubeGrouped("orders.total_profit", "orders.region").then(setData);
  }, []);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Profit by Region</h3>
      <div className="mt-6 flex h-48 items-end gap-3 border-b border-slate-200 pb-2">
        {data.map((d, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedValue === d.label;
          return (
            <div
              key={d.label}
              className="relative flex h-full flex-1 flex-col items-center justify-end cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(d.label)}
            >
              {isHovered && (
                <div className="absolute -top-2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white">
                  ₹{d.value.toLocaleString("en-IN")}
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-colors ${
                  isSelected ? "bg-emerald-700" : isHovered ? "bg-emerald-600" : "bg-emerald-500/70"
                }`}
                style={{ height: `${(d.value / maxValue) * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3 text-xs text-slate-400">
        {data.map((d, index) => (
          <span
            key={d.label}
            className={`flex-1 text-center cursor-pointer ${
              selectedValue === d.label ? "font-semibold text-emerald-700" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onSelect(d.label)}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SalesByCategoryChart({
  selectedValue,
  onSelect,
}: {
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) {
  const [data, setData] = useState<{ label: string; value: number }[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCubeGrouped("orders.total_sales", "orders.category").then(setData);
  }, []);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Sales by Category</h3>
      <div className="mt-6 flex h-48 items-end gap-3 border-b border-slate-200 pb-2">
        {data.map((d, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedValue === d.label;
          return (
            <div
              key={d.label}
              className="relative flex h-full flex-1 flex-col items-center justify-end cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(d.label)}
            >
              {isHovered && (
                <div className="absolute -top-2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white">
                  ₹{d.value.toLocaleString("en-IN")}
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-colors ${
                  isSelected ? "bg-sky-700" : isHovered ? "bg-sky-600" : "bg-sky-500/70"
                }`}
                style={{ height: `${(d.value / maxValue) * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3 text-xs text-slate-400">
        {data.map((d, index) => (
          <span
            key={d.label}
            className={`flex-1 text-center cursor-pointer ${
              selectedValue === d.label ? "font-semibold text-sky-700" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onSelect(d.label)}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}


function SalesBySegmentChart({
  selectedValue,
  onSelect,
}: {
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) {
  const [data, setData] = useState<{ label: string; value: number }[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const colors = ["#3b82f6", "#10b981", "#f59e0b"];

  useEffect(() => {
    fetchCubeGrouped("orders.total_sales", "orders.segment").then(setData);
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let cumulativeAngle = 0;
  const slices = data.map((d) => {
    const startAngle = (cumulativeAngle / total) * 2 * Math.PI;
    cumulativeAngle += d.value;
    const endAngle = (cumulativeAngle / total) * 2 * Math.PI;

    const cx = 100, cy = 100, r = 90;
    const x1 = cx + r * Math.sin(startAngle);
    const y1 = cy - r * Math.cos(startAngle);
    const x2 = cx + r * Math.sin(endAngle);
    const y2 = cy - r * Math.cos(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return {
      ...d,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Sales by Segment</h3>
      <div className="mt-6 flex items-center gap-6">
        <svg viewBox="0 0 200 200" className="h-40 w-40">
          {slices.map((s, index) => (
            <path
              key={s.label}
              d={s.path}
              fill={colors[index % colors.length]}
              opacity={
                selectedValue
                  ? selectedValue === s.label ? 1 : 0.35
                  : hoveredIndex === null || hoveredIndex === index ? 1 : 0.5
              }
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(s.label)}
              className="cursor-pointer transition-opacity"
            />
          ))}
        </svg>
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          {data.map((d, index) => (
            <div
              key={d.label}
              className={`flex items-center gap-2 cursor-pointer ${
                selectedValue === d.label
                  ? "font-semibold text-slate-900"
                  : hoveredIndex === index
                  ? "font-semibold text-slate-900"
                  : ""
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(d.label)}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              {d.label}: ₹{d.value.toLocaleString("en-IN")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function Dashboard() {
  const [metrics, setMetrics] = useState<Record<MetricKey, MetricState>>(createInitialMetrics);
  const [selectedFilter, setSelectedFilter] = useState<{ dimension: string; value: string } | null>(null);
  useEffect(() => {
    let cancelled = false;

    async function fetchCubeMeasure(measure: string, filter?: { dimension: string; value: string }) {
  const query: any = { measures: [measure] };
  if (filter) {
    query.filters = [{ member: filter.dimension, operator: "equals", values: [filter.value] }];
  }
  const res = await fetch("http://localhost:4000/cubejs-api/v1/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data?.[0]?.[measure];
}

async function loadMetric(def: MetricDef) {
  try {
    const rawValue = await fetchCubeMeasure(def.question, selectedFilter ?? undefined);
    if (cancelled) return;

    const formatted =
      def.key === "margin"
        ? `${(Number(rawValue)*100).toFixed(1)}%`
        :  def.key === "orders"
        ? Number(rawValue).toLocaleString("en-IN")
        : `₹${Number(rawValue).toLocaleString("en-IN")}`;

    setMetrics((current) => ({
      ...current,
      [def.key]: {
        ...current[def.key],
        value: formatted,
        detail: def.label,
        status: "ready",
      },
    }));
  } catch {
    if (cancelled) return;
    setMetrics((current) => ({
      ...current,
      [def.key]: { ...current[def.key], status: "error" },
    }));
  }
}

METRIC_DEFS.forEach((def) => {
  void loadMetric(def);
});


    return () => {
      cancelled = true;
    };
  }, [selectedFilter]);

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-[620px] w-full flex-col overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:h-[calc(100vh-4rem)]">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Live metrics from your assistant, plus a quick look at recent trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {METRIC_DEFS.map((def) => (
          <MetricCard key={def.key} metric={metrics[def.key]} />
        ))}
      </div>

      <div className="mt-6">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
  <ProfitByRegionChart
  selectedValue={selectedFilter?.dimension === "orders.region" ? selectedFilter.value : null}
  onSelect={(value) =>
    setSelectedFilter((current) =>
      current?.value === value ? null : { dimension: "orders.region", value }
    )
  }
/>
<SalesByCategoryChart
  selectedValue={selectedFilter?.dimension === "orders.category" ? selectedFilter.value : null}
  onSelect={(value) =>
    setSelectedFilter((current) =>
      current?.value === value ? null : { dimension: "orders.category", value }
    )
  }
/>
</div>
<div className="mt-6">
  <SalesBySegmentChart
  selectedValue={selectedFilter?.dimension === "orders.segment" ? selectedFilter.value : null}
  onSelect={(value) =>
    setSelectedFilter((current) =>
      current?.value === value ? null : { dimension: "orders.segment", value }
    )
  }
/>
</div>
      </div>
    </div>
  );
}
