import { getMetric } from "./analytics.ts";

export const responses = {
  revenue: getMetric("revenue").summary,
  sales: getMetric("sales").summary,
  profit: getMetric("profit").summary,
  default: "I couldn't understand your question.",
} as const;

const keywordPatterns: Array<{ keywords: RegExp[]; response: keyof typeof responses }> = [
  {
    keywords: [/revenue/, /income/, /earnings/],
    response: "revenue",
  },
  {
    keywords: [/sales/, /orders/, /market/, /growth/],
    response: "sales",
  },
  {
    keywords: [/profit/, /margin/, /costs?/],
    response: "profit",
  },
];

export function getBotResponse(message: string): string {
  const normalized = message.toLowerCase().trim();

  if (!normalized) {
    return responses.default;
  }

  for (const pattern of keywordPatterns) {
    if (pattern.keywords.some((keyword) => keyword.test(normalized))) {
      return responses[pattern.response];
    }
  }

  return responses.default;
}
