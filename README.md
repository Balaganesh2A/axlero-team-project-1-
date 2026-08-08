# MetricMind

An agentic semantic BI engine — ask a business question in plain English, get a governed, hallucination-free answer backed by a real semantic layer (not a text-to-SQL guess).

Built by a 6-person team at Axlero Solutions over a 4-week sprint.

## Why this exists

Most "ask your data a question" tools let an LLM freestyle SQL, which means the same question can silently return different numbers on different runs. MetricMind instead routes every question through a defined semantic layer (Cube.dev) with fixed measures and dimensions — the LLM's job is to map the question onto that layer, not to invent SQL. That's the core pitch: **governed AI you can trust**, not just a cool demo.

## Architecture

```
Snowflake  →  dbt (staging models)  →  Cube.dev (semantic layer)
                                             ↓
                                   FastAPI backend (/ask, /query)
                                             ↓
                              Next.js chat + dashboard UI (LangChain)
```

- **Snowflake** — raw + cleaned order data lives here (`AXLERO_DEV.STAGING.STG_SUPERSTORE_ORDERS_CLEANED`)
- **dbt** (`/axlero_dbt`) — staging models + tests that clean and validate the raw data before anything downstream touches it
- **Cube.dev** (`/cube`) — defines the governed measures (`total_sales`, `profit_margin`, etc.) and dimensions (`category`, `region`, `order_date`, ...) that both the API and the LLM query against. Includes a query-limit guard (max 5,000 rows) and a governance audit script that checks the same question returns identical results every time.
- **FastAPI backend** (`/cube/backend`) — translates natural-language questions into Cube queries and returns both the answer and the underlying SQL for transparency
- **Next.js UI** (`/project-1-new-extracted`) — chat interface + dashboard with dynamic charts, filters, and a "view SQL" transparency panel

## Repo layout

| Folder | Owns |
|---|---|
| `axlero_dbt/` | dbt project — staging models, source definitions, tests |
| `cube/` | Cube.dev semantic layer, FastAPI backend, governance docs/tests |
| `project-1-new-extracted/` | Next.js frontend — chat UI, dashboard, LangChain orchestration |

## Running locally

Run the three services **in this order**, each in its own terminal tab, and leave all three running simultaneously.

### Prerequisites
- Docker Desktop installed and running (menu bar whale icon showing "running," not just open). On Apple Silicon: https://desktop.docker.com/mac/main/arm64/Docker.dmg
- Node.js + npm
- Python 3 + `uvicorn` available (via conda/pip)

### 1. dbt
```bash
cd axlero_dbt
pip install -r requirements.txt
dbt run
dbt test
```

### 2. Cube.dev (semantic layer)
```bash
cd cube
cp .env.example .env   # only if .env doesn't already exist — fill in Snowflake + Cube credentials
docker compose up      # NOTE: "docker compose" (space), not "docker-compose" (hyphen) on modern Docker Desktop
```
Wait for `Cube API server (...) is listening on 4000` in the logs. Playground is at http://localhost:4000.

### 3. FastAPI backend
```bash
cd cube/backend
ls                      # confirm main.py is present — if missing, see Troubleshooting below
uvicorn main:app --reload
```
Should print `Uvicorn running on http://127.0.0.1:8000`. Sanity check: visit http://127.0.0.1:8000 in a browser — you should see `{"message":"FastAPI Backend is running!"}`.

### 4. Frontend
```bash
cd project-1-new-extracted
npm install
npm run dev             # :3000
```
Visit http://localhost:3000. If dashboard cards say "Couldn't load ..." — Cube and/or the backend aren't running. Check steps 2 and 3 first.


## Governance

- Query results are checked for consistency across repeated runs (`cube/docs/governance_audit.md`, `cube/scripts/governance-test.js`)
- All Cube queries are capped at 5,000 rows via `queryRewrite` in `cube/cube.js`
- Every answer returned to the UI includes the underlying generated SQL for full transparency

## Team

Pod A (data & semantics): Snowflake, dbt, Cube.dev
Pod B (agentic AI & UI): Next.js, LangChain, agent orchestration