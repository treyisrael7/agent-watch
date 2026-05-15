export type TraceStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "success"
  | "failed"
  | "warning"
  | "unstable"
  | "cancelled";

export type SpanStatus =
  | "pending"
  | "running"
  | "ok"
  | "success"
  | "error"
  | "warning"
  | "cancelled";

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
  kind: "agent" | "llm" | "tool" | "workflow" | "retrieval" | "decision" | "error" | "custom";
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
  latencyMs?: number;
  uncertaintyScore: number;
  input?: unknown;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
  metrics: TraceMetric[];
  spans: AgentSpan[];
};

export type TraceSummary = Pick<
  AgentTrace,
  | "runId"
  | "name"
  | "status"
  | "startedAt"
  | "endedAt"
  | "durationMs"
  | "latencyMs"
  | "uncertaintyScore"
  | "metrics"
> & {
  spanCount: number;
  toolCallCount: number;
};

export type TraceIngestStatus = "success" | "failed" | "warning" | "unstable";

export type TraceIngestSpanType = "llm_call" | "tool_call" | "retrieval" | "decision" | "error";

export type TraceIngestSpan = {
  span_id: string;
  type: TraceIngestSpanType;
  name: string;
  input?: unknown;
  output?: unknown;
  started_at: string;
  ended_at?: string;
  latency_ms?: number;
  metadata: Record<string, unknown>;
};

export type TraceIngestPayload = {
  run_id: string;
  agent_name: string;
  status: TraceIngestStatus;
  started_at: string;
  completed_at?: string;
  latency_ms?: number;
  user_input: string;
  final_output?: string;
  uncertainty_score: number;
  spans: TraceIngestSpan[];
};
