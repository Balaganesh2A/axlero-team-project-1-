const questions = [
  { name: "Total Revenue", query: { measures: ["orders.totalSales"] } },
  { name: "Revenue by Region", query: { measures: ["orders.totalSales"], dimensions: ["orders.region"] } },
  { name: "Order Count", query: { measures: ["orders.orderCount"] } },

  // Multi-dimension breakdown
  { name: "Revenue by Category and Region", query: {
      measures: ["orders.totalSales"],
      dimensions: ["orders.category", "orders.region"]
  }},

  // Filtered query
  { name: "Technology Revenue Only", query: {
      measures: ["orders.totalSales"],
      filters: [{ member: "orders.category", operator: "equals", values: ["Technology"] }]
  }},

  // Time-based (adjust dimension name to your actual date field)
  { name: "Monthly Revenue Trend", query: {
      measures: ["orders.totalSales"],
      timeDimensions: [{ dimension: "orders.orderDate", granularity: "month" }]
  }},

  // Combined filter + dimension
  { name: "West Region Furniture Sales", query: {
      measures: ["orders.totalSales"],
      dimensions: ["orders.subCategory"],
      filters: [
        { member: "orders.region", operator: "equals", values: ["West"] },
        { member: "orders.category", operator: "equals", values: ["Furniture"] }
      ]
  }},
]


async function runTest(question, times = 10) {
  const results = [];
  for (let i = 0; i < times; i++) {
    const res = await fetch("http://localhost:4000/cubejs-api/v1/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: question.query }),
    });
    const data = await res.json();
    results.push(JSON.stringify(data.data));
  }
  const allSame = results.every((r) => r === results[0]);
  console.log(`\n${question.name}: ${allSame ? "✅ CONSISTENT" : "❌ INCONSISTENT"}`);
  if (!allSame) console.log(results);
}

const agentQuestions = [
  "How did sales perform this week?",
  "sales by category",
  "sales by region",
  "sales by west region",
  "Show quantity",
];

async function runAgentTest(question) {
  const results = [];

  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "governance-test-session",
          message: question,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        results.push(`ERROR: ${data.error || res.status}`);
        continue;
      }

      results.push(data.answer);
    } catch (err) {
      results.push(`FETCH_ERROR: ${err.message}`);
    }
  }

  const allSame = results.every((r) => r === results[0]);

  console.log(`\n${allSame ? "✅ CONSISTENT" : "❌ INCONSISTENT"}: "${question}"`);

  if (!allSame) {
    console.log("Differing results across 10 runs:");
    results.forEach((r, i) => console.log(` [${i + 1}] ${r}`));
  }

  return { question, allSame, results };
}

async function mainAgentTest() {
  console.log("\n=== LIVE AGENT GOVERNANCE TEST ===");
  console.log("Testing /api/chat consistency (10 runs per question)\n");

  const summary = [];

  for (const q of agentQuestions) {
    const result = await runAgentTest(q);
    summary.push(result);
  }

  console.log("\n=== SUMMARY ===");
  const consistentCount = summary.filter((s) => s.allSame).length;
  console.log(`${consistentCount}/${summary.length} questions returned consistent answers`);

  const failed = summary.filter((s) => !s.allSame);
  if (failed.length > 0) {
    console.log("\nInconsistent questions:");
    failed.forEach((f) => console.log(` - "${f.question}"`));
  }
}

async function main() {
  for (const q of questions) {
    await runTest(q);
  }
}

async function runAll() {
  await main();
  await mainAgentTest();
}

runAll();
