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

  // Order count by ship mode
  { name: "Orders by Ship Mode", query: {
      measures: ["orders.orderCount"],
      dimensions: ["orders.shipMode"]
  }},
];


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

async function main() {
  for (const q of questions) {
    await runTest(q);
  }
}

main();
