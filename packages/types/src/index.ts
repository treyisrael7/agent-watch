export type TraceStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export type SpanStatus = "pending" | "running" | "ok" | "error" | "cancelled";

export type ToolCallStatus = "pending" | "running" | "success" | "error";

export type MetricName =
  | "duration_ms"
  | "prompt_tokens"
  | "completion_tokens"
  | "total_tokens"
  | "cost_usd"
  | "tool_calls";

export type TraceMetric = {
  name: MetricName | string;
  value: number;
  unit?: string;
};

export type ToolCall = {
  id: string;
  spanId: string;
  name: string;
  status: ToolCallStatus;
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
};

export type AgentSpan = {
  id: string;
  runId: string;
  parentSpanId?: string;
  name: string;
  kind: "agent" | "llm" | "tool" | "workflow" | "retrieval" | "custom";
  status: SpanStatus;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  attributes?: Record<string, unknown>;
  toolCalls?: ToolCall[];
};

export type AgentTrace = {
  runId: string;
  name: string;
  status: TraceStatus;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  input?: unknown;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
  metrics: TraceMetric[];
  spans: AgentSpan[];
};

export type TraceSummary = Pick<
  AgentTrace,
  "runId" | "name" | "status" | "startedAt" | "endedAt" | "durationMs" | "metrics"
> & {
  spanCount: number;
  toolCallCount: number;
};
