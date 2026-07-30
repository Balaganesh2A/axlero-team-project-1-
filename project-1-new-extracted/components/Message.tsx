"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { selectChartType } from "../lib/chart-selector";

type MessageProps = {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  chartData?: any[];
  chartQuery?: {
    measures?: string[];
    dimensions?: string[];
    timeDimensions?: any[];
  };
  debug?: { query: object; sql: string };
};

export default function Message({
  text,
  sender,
  timestamp,
  chartData,
  chartQuery,
  debug,
}: MessageProps) {
  const isUser = sender === "user";
  const [showDebug, setShowDebug] = useState(false);
  const chartType = chartQuery ? selectChartType(chartQuery) : null;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[min(90%,40rem)] flex-col gap-2 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
          {isUser ? "User" : "Bot"}
        </span>

        <div
          className={`max-w-full rounded-[1.6rem] px-4 py-3 text-[15px] leading-6 shadow-sm transition-all ${
            isUser
              ? "rounded-br-[0.35rem] bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white"
              : "rounded-bl-[0.35rem] border border-slate-200 bg-white text-slate-900 shadow-slate-200"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{text}</p>
        </div>

        {chartData && chartData.length > 0 && chartType && chartType !== "table" && (
          <div className="mt-1 w-full max-w-full rounded-[1rem] border border-slate-200 bg-white p-3">
            <ResponsiveContainer width="100%" height={220}>
              {chartType === "line" ? (
                <LineChart data={chartData}>
                  <XAxis dataKey={Object.keys(chartData[0])[0]} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={Object.keys(chartData[0])[1]}
                    stroke="#2563eb"
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <XAxis dataKey={Object.keys(chartData[0])[0]} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey={Object.keys(chartData[0])[1]} fill="#2563eb" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {debug && (
          <div className="mt-1 w-full">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-[11px] text-slate-500 underline"
              type="button"
            >
              {showDebug ? "Hide" : "View"} SQL/API Call
            </button>
            {showDebug && (
              <div className="mt-1 rounded-[0.75rem] bg-slate-100 p-3 text-[11px] font-mono">
                <p className="mb-1 font-semibold">Cube Query:</p>
                <pre className="mb-2 whitespace-pre-wrap">
                  {JSON.stringify(debug.query, null, 2)}
                </pre>
                <p className="mb-1 font-semibold">SQL:</p>
                <pre className="whitespace-pre-wrap">{debug.sql}</pre>
              </div>
            )}
          </div>
        )}

        <span className="text-[11px] text-slate-500">{timestamp}</span>
      </div>
    </div>
  );
}
