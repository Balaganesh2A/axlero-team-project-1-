# Governance Audit — MetricMind Semantic BI Engine

## Purpose
This audit verifies that the semantic layer (Cube.dev) returns consistent,
deterministic results for the same query executed repeatedly. Consistency
here means the agent and dashboard can be trusted to return the same answer
for the same question every time, with no caching or aggregation drift.

## Method
Each test question is run 10 times against the Cube.dev `/cubejs-api/v1/load`
endpoint via `scripts/governance-test.js`. Results are compared for exact
equality across all 10 runs. A question is marked CONSISTENT only if all 10
results match; otherwise it is INCONSISTENT and results are logged for review.

## Test Results

| Question | Query Type | Result |
|------------------------------------|--------------------------------------|--------------|
| Total Revenue | Single measure | ✅ CONSISTENT |
| Revenue by Region | Measure + single dimension | ✅ CONSISTENT |
| Order Count | Single measure | ✅ CONSISTENT |
| Revenue by Category and Region | Measure + multi-dimension | ✅ CONSISTENT |
| Technology Revenue Only | Measure + filter | ✅ CONSISTENT |
| Monthly Revenue Trend | Measure + time dimension (granularity: month) | ✅ CONSISTENT |
| West Region Furniture Sales | Measure + dimension + multiple filters | ✅ CONSISTENT |


**7/7 test cases consistent (10 runs each, 70 total executions).**

## Findings
- No caching or non-determinism issues detected across simple aggregates,
  filtered queries, multi-dimension breakdowns, or time-series queries.
- Row-limit cap (10,000) confirmed not to affect aggregate query determinism.
- Multi-step diagnostic drill-down queries (category/subCategory) were
  validated separately via `scripts/test-harness.ts` (10/10 pass).

## Conclusion
The semantic layer is governance-compliant: query results are stable and
reproducible, satisfying the trust requirement for an agentic BI assistant
where users rely on consistent answers to repeated or rephrased questions.

*Last run: [2026-07-30,12:23]*


## Live Agent Governance Test — [08-08-2026]

Extended governance-test.js to test the full live agent pipeline 
(/api/chat), not just Cube.js directly. Each question is sent 10 times 
through the complete chain: natural language → generateCubeQuery (LLM) 
→ FastAPI → Cube.js → Snowflake → response.

### Results

**Cube-direct tests (existing):** 7/7 consistent
- Total Revenue ✅
- Revenue by Region ✅
- Order Count ✅
- Revenue by Category and Region ✅
- Technology Revenue Only ✅
- Monthly Revenue Trend ✅
- West Region Furniture Sales ✅

**Live agent tests (new):** 5/5 consistent
- "How did sales perform this week?" ✅
- "sales by category" ✅
- "sales by region" ✅
- "sales by west region" ✅
- "Show quantity" ✅

### Significance

All tests passed, including questions that exercise the newly added 
region-filter detection (detectFilters() in lib/parser.ts). This confirms 
the LLM-based query generation step is producing identical Cube queries 
across repeated runs for the same phrasing — i.e., no observed 
non-determinism in this test set.

### Notes / Caveats

- Test set is small (5 agent questions); broader phrasing variation 
  (typos, synonyms, indirect phrasing) has not yet been tested.
- Consistency here means "same answer 10x for identical input text" — 
  it does not test whether the LLM would produce the same query for 
  differently-worded questions with the same intent (e.g. "sales by 
  west region" vs "west region sales").
- Recommend expanding agentQuestions[] over time as new query types 
  are added, and re-running before any change to generateCubeQuery, 
  the Cube schema, or the prompt used for query generation.
