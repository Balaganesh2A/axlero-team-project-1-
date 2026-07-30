"use client";

import { useEffect, useState } from "react";

type MetricKey = "revenue" | "sales" | "profit";

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
  { key: "revenue", label: "Revenue", question: "Show revenue", icon: "💰" },
  { key: "sales", label: "Sales", question: "Show sales", icon: "📈" },
  { key: "profit", label: "Profit", question: "Show profit", icon: "🧾" },
];

const TREND_DATA = [
  { label: "Feb", value: 34000 },
  { label: "Mar", value: 41000 },
  { label: "Apr", value: 37000 },
  { label: "May", value: 45000 },
  { label: "Jun", value: 48000 },
  { label: "Jul", value: 50000 },
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
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{metric.icon}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{metric.label}</span>
      </div>

      {metric.status === "loading" && (
        <div className="mt-5 h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
      )}

      {metric.status === "error" && (
        <p className="mt-5 text-sm text-red-500">Couldn&apos;t load {metric.label.toLowerCase()}.</p>
      )}

      {metric.status === "ready" && (
        <>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{metric.value}</p>
          <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
        </>
      )}
    </div>
  );
}

function TrendChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...TREND_DATA.map((point) => point.value));

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Revenue trend</h3>
      <p className="text-sm text-slate-500">Illustrative monthly view</p>

      <div className="mt-6 flex h-48 items-end gap-3 border-b border-slate-200 pb-2">
        {TREND_DATA.map((point, index) => {
          const heightPercent = (point.value / maxValue) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={point.label}
              className="relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && (
                <div className="absolute -top-2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-sm">
                  ₹{point.value.toLocaleString("en-IN")}
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-colors ${
                  isHovered ? "bg-sky-600" : "bg-sky-500/70"
                }`}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-3 text-xs text-slate-400">
        {TREND_DATA.map((point) => (
          <span key={point.label} className="flex-1 text-center">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Record<MetricKey, MetricState>>(createInitialMetrics);

  useEffect(() => {
    let cancelled = false;

    async function loadMetric(def: MetricDef) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: "dashboard-metrics", message: def.question }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Request failed");
        }

        if (cancelled) return;

        setMetrics((current) => ({
          ...current,
          [def.key]: {
            ...current[def.key],
            value: extractHeadline(data.answer),
            detail: data.answer,
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
  }, []);

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-[620px] w-full flex-col overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:h-[calc(100vh-4rem)]">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Live metrics from your assistant, plus a quick look at recent trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {METRIC_DEFS.map((def) => (
          <MetricCard key={def.key} metric={metrics[def.key]} />
        ))}
      </div>

      <div className="mt-6">
        <TrendChart />
      </div>
    </div>
  );
}
