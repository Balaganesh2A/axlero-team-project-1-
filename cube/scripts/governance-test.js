const questions = [
  { name: "Total Revenue", query: { measures: ["orders.totalSales"] } },
  { name: "Revenue by Region", query: { measures: ["orders.totalSales"], dimensions: ["orders.region"] } },
  { name: "Order Count", query: { measures: ["orders.orderCount"] } },
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
