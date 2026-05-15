# Agent Watch SDK

TypeScript SDK for sending agent traces to the Agent Watch FastAPI backend.

## Usage

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

trace.addSpan({
  type: "tool_call",
  name: "Check order status",
  input: { orderId: "123" },
  output: { status: "delivered", daysSinceDelivery: 12 },
});

const result = await trace.end({
  status: "success",
  finalOutput: "The customer is eligible for a refund.",
  uncertaintyScore: 0.14,
});

if (!result.ok) {
  console.warn("Trace was captured locally but could not be sent.", result.error);
}
```

The SDK generates `runId` and `spanId` values, records timestamps, calculates latency, and sends the trace when `trace.end()` is called.
