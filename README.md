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
- `packages/sdk`: TypeScript developer SDK for sending traces
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

Start the FastAPI backend from the root:

```bash
pnpm dev:api
```

The API runs on `http://localhost:8000`.

In a second terminal, start the web dashboard:

```bash
pnpm dev:web
```

The dashboard runs on `http://localhost:3000`. You can also start both apps together with `pnpm dev`.

## Customer Support Demo Agent

With the backend running, send three refund-support traces to Agent Watch:

```bash
pnpm demo:customer-support
```

The example uses `@agent-watch/sdk`, posts to `http://localhost:8000/api/traces` by default, and includes:

- a successful grounded refund answer
- a refund lookup tool failure
- an unstable answer that is overconfident despite contradictory evidence

To send only one scenario:

```bash
pnpm demo:customer-support:success
pnpm demo:customer-support:tool-failure
pnpm demo:customer-support:unstable
```

Override the ingestion endpoint with `AGENT_WATCH_TRACE_URL` if needed:

```powershell
$env:AGENT_WATCH_TRACE_URL = "http://localhost:8000/api/traces"
pnpm demo:customer-support
```

After running the demo, open `http://localhost:3000/traces`. You should see three customer support runs with `success`, `failed`, and `unstable` statuses. Each run includes retrieval, tool call, decision, and LLM spans with automatically generated run/span IDs and latency values.

## Trace Ingestion

Send a trace run to the API:

```bash
curl -X POST http://localhost:8000/api/traces \
  -H "Content-Type: application/json" \
  -d @apps/api/examples/trace.json
```

Then open `http://localhost:3000/traces` to view the dashboard.

## TypeScript SDK

Create and send traces from TypeScript with `@agent-watch/sdk`:

```ts
import { AgentWatch } from "@agent-watch/sdk";

const watcher = new AgentWatch({
  endpoint: "http://localhost:8000/api/traces",
  apiKey: "dev-key",
});

const trace = watcher.startTrace({
  agentName: "customer-support-agent",
  userInput: "Can I get a refund?",
});

trace.addSpan({
  type: "retrieval",
  name: "Retrieve refund policy",
  input: "refund policy",
  output: "Refunds are allowed within 30 days.",
});

const result = await trace.end({
  status: "success",
  finalOutput: "The customer is eligible for a refund.",
  uncertaintyScore: 0.14,
});

if (!result.ok) {
  console.warn("Trace could not be sent.", result.error);
}
```
