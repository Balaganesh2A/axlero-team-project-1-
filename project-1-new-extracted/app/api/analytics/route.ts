import { getAllMetrics, getMetric, getRevenueTrend, isMetricKey } from "@/lib/analytics";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const metricParam = url.searchParams.get("metric")?.trim();

    if (metricParam) {
      if (!isMetricKey(metricParam)) {
        return Response.json(
          { error: "metric must be one of: revenue, sales, profit" },
          { status: 400 }
        );
      }

      return Response.json({ metric: getMetric(metricParam) });
    }

    return Response.json({
      metrics: getAllMetrics(),
      trend: getRevenueTrend(),
    });
  } catch (error) {
    console.error("[ANALYTICS API ERROR]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
