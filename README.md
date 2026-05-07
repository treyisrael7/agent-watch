# Agent Watch

Agent Watch is an open-source observability layer for AI agents.

The MVP lets a developer send agent trace events to a FastAPI backend and view runs, spans, tool calls, statuses, and metrics in a Next.js dashboard.

## Stack

- Turborepo + pnpm workspaces
- Next.js App Router, TypeScript, TailwindCSS, shadcn/ui-ready structure
- FastAPI, Pydantic, APIRouter, service and repository layers
- Shared TypeScript types and config packages

## Apps

- `apps/web`: dashboard UI
- `apps/api`: trace ingestion and read API

## Packages

- `packages/types`: shared TypeScript domain types
- `packages/ui`: shared React UI primitives
- `packages/config`: shared TypeScript, ESLint, and Tailwind config

## Getting Started

Install JavaScript dependencies:

```bash
corepack enable
pnpm install
```

Create and install the API environment:

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Run the monorepo from the root:

```bash
pnpm dev
```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:8000`.

## Trace Ingestion

Send a trace run to the API:

```bash
curl -X POST http://localhost:8000/api/v1/traces \
  -H "Content-Type: application/json" \
  -d @apps/api/examples/trace.json
```

Then open `http://localhost:3000/traces` to view the dashboard.
