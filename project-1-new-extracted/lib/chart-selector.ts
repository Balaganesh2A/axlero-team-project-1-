type ChartType = "line" | "bar" | "pie" | "kpi" | "table";

export function selectChartType(query: {
  timeDimensions?: any[];
  dimensions?: string[];
  measures?: string[];
}): ChartType {
  const hasTime = query.timeDimensions?.length ?? 0> 0;
  const hasDimensions = query.dimensions?.length ?? 0> 0;
  const measureCount = query.measures?.length ?? 0;

  if (hasTime) return "line"; // trend over time
  if (!hasDimensions && measureCount === 1) return "kpi"; // single number
  if (hasDimensions && measureCount >= 1) return "bar"; // category comparison
  return "table"; // fallback for anything complex
}
