import type { AgentTrace, TraceSummary } from "@agent-watch/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiTraceStatus = "success" | "failed" | "warning" | "unstable";
type ApiSpanType = "llm_call" | "tool_call" | "retrieval" | "decision" | "error";

type ApiTraceSummary = {
  run_id: string;
  agent_name: string;
  status: ApiTraceStatus;
  started_at: string;
  completed_at?: string | null;
  latency_ms?: number | null;
  uncertainty_score: number;
  span_count: number;
};

type ApiTraceSpan = {
  span_id: string;
  type: ApiSpanType;
  name: string;
  input?: unknown;
  output?: unknown;
  started_at: string;
  ended_at?: string | null;
  latency_ms?: number | null;
  metadata?: Record<string, unknown>;
};

type ApiTrace = ApiTraceSummary & {
  user_input: string;
  final_output?: string | null;
  spans: ApiTraceSpan[];
};

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const mockTraces: AgentTrace[] = [
  {
    runId: "run_demo_001",
    name: "Research Agent",
    status: "success",
    startedAt: "2026-05-06T22:00:00Z",
    endedAt: "2026-05-06T22:00:08Z",
    durationMs: 8120,
    latencyMs: 8120,
    uncertaintyScore: 0.12,
    input: "Summarize the latest agent observability practices.",
    output: "Trace ingestion, span timelines, tool call auditing, and uncertainty metrics.",
    metadata: {
      environment: "local",
      model: "gpt-5.5",
      fallback: true,
    },
    metrics: [
      { name: "duration_ms", value: 8120, unit: "ms" },
      { name: "total_tokens", value: 2448 },
      { name: "tool_calls", value: 1 },
      { name: "cost_usd", value: 0.018, unit: "usd" },
    ],
    spans: [
      {
        id: "span_plan",
        runId: "run_demo_001",
        name: "Plan research task",
        kind: "decision",
        status: "success",
        startedAt: "2026-05-06T22:00:00Z",
        endedAt: "2026-05-06T22:00:01Z",
        durationMs: 1000,
        attributes: {
          planner: "research-agent",
          steps: ["retrieve sources", "synthesize", "write summary"],
        },
      },
      {
        id: "span_search",
        runId: "run_demo_001",
        name: "Search documentation",
        kind: "retrieval",
        status: "success",
        startedAt: "2026-05-06T22:00:01Z",
        endedAt: "2026-05-06T22:00:05Z",
        durationMs: 4200,
        attributes: {
          source: "docs_index",
          top_k: 5,
          result_count: 5,
        },
        toolCalls: [
          {
            id: "tool_docs_search",
            spanId: "span_search",
            name: "docs.search",
            status: "success",
            input: { query: "agent observability tracing spans" },
            output: { results: 5 },
            startedAt: "2026-05-06T22:00:01Z",
            endedAt: "2026-05-06T22:00:05Z",
            durationMs: 4200,
          },
        ],
      },
      {
        id: "span_summarize",
        runId: "run_demo_001",
        name: "Synthesize final answer",
        kind: "llm",
        status: "success",
        startedAt: "2026-05-06T22:00:05Z",
        endedAt: "2026-05-06T22:00:08Z",
        durationMs: 2920,
        attributes: {
          model: "gpt-5.5",
          prompt_tokens: 1516,
          completion_tokens: 932,
        },
      },
    ],
  },
  {
    runId: "run_eval_014",
    name: "Code Review Agent",
    status: "warning",
    startedAt: "2026-05-06T22:13:19Z",
    endedAt: "2026-05-06T22:13:27Z",
    durationMs: 7860,
    latencyMs: 7860,
    uncertaintyScore: 0.41,
    input: "Review a pull request for regression risk.",
    output: "Found two medium-confidence risks and one missing test.",
    metadata: {
      repository: "agent-watch",
      branch: "dashboard-polish",
      fallback: true,
    },
    metrics: [
      { name: "duration_ms", value: 7860, unit: "ms" },
      { name: "total_tokens", value: 3890 },
      { name: "tool_calls", value: 3 },
    ],
    spans: [
      {
        id: "span_diff",
        runId: "run_eval_014",
        name: "Read pull request diff",
        kind: "tool",
        status: "success",
        startedAt: "2026-05-06T22:13:19Z",
        endedAt: "2026-05-06T22:13:22Z",
        durationMs: 3100,
        attributes: { files_changed: 8, additions: 312, deletions: 46 },
      },
      {
        id: "span_reasoning",
        runId: "run_eval_014",
        name: "Assess regression risk",
        kind: "decision",
        status: "warning",
        startedAt: "2026-05-06T22:13:22Z",
        endedAt: "2026-05-06T22:13:27Z",
        durationMs: 4760,
        attributes: { confidence: "medium", findings: 2 },
      },
    ],
  },
  {
    runId: "run_failed_023",
    name: "Browser Automation Agent",
    status: "failed",
    startedAt: "2026-05-06T22:21:02Z",
    endedAt: "2026-05-06T22:21:06Z",
    durationMs: 4480,
    latencyMs: 4480,
    uncertaintyScore: 0.76,
    input: "Book a meeting from the scheduling page.",
    output: null,
    error: "DOM target disappeared during interaction.",
    metadata: {
      browser: "chromium",
      retry_count: 2,
      fallback: true,
    },
    metrics: [
      { name: "duration_ms", value: 4480, unit: "ms" },
      { name: "tool_calls", value: 4 },
    ],
    spans: [
      {
        id: "span_click",
        runId: "run_failed_023",
        name: "Click available slot",
        kind: "tool",
        status: "error",
        startedAt: "2026-05-06T22:21:03Z",
        endedAt: "2026-05-06T22:21:06Z",
        durationMs: 3020,
        attributes: { selector: "[data-slot='10:30']", retryable: true },
      },
    ],
  },
];

function formatDurationMetric(latencyMs?: number | null) {
  return latencyMs == null ? [] : [{ name: "duration_ms", value: latencyMs, unit: "ms" }];
}

function normalizeSpan(runId: string, span: ApiTraceSpan): AgentTrace["spans"][number] {
  const kind = span.type === "llm_call" ? "llm" : span.type === "tool_call" ? "tool" : span.type;

  const normalizedSpan: AgentTrace["spans"][number] = {
    id: span.span_id,
    runId,
    name: span.name,
    kind,
    status: span.type === "error" ? "error" : "success",
    startedAt: span.started_at,
  };

  if (span.ended_at != null) {
    normalizedSpan.endedAt = span.ended_at;
  }

  if (span.latency_ms != null) {
    normalizedSpan.durationMs = span.latency_ms;
  }

  if (span.metadata != null) {
    normalizedSpan.attributes = span.metadata;
  }

  if (span.type === "tool_call") {
    const toolCall = {
      id: `${span.span_id}_tool`,
      spanId: span.span_id,
      name: span.name,
      status: "success" as const,
      input: span.input,
      output: span.output,
      startedAt: span.started_at,
    };

    normalizedSpan.toolCalls = [
      {
        ...toolCall,
        ...(span.ended_at != null ? { endedAt: span.ended_at } : {}),
        ...(span.latency_ms != null ? { durationMs: span.latency_ms } : {}),
      },
    ];
  }

  return normalizedSpan;
}

function normalizeSummary(trace: ApiTraceSummary): TraceSummary {
  return {
    runId: trace.run_id,
    name: trace.agent_name,
    status: trace.status,
    startedAt: trace.started_at,
    ...(trace.completed_at != null ? { endedAt: trace.completed_at } : {}),
    ...(trace.latency_ms != null
      ? { durationMs: trace.latency_ms, latencyMs: trace.latency_ms }
      : {}),
    uncertaintyScore: trace.uncertainty_score,
    spanCount: trace.span_count,
    toolCallCount: 0,
    metrics: formatDurationMetric(trace.latency_ms),
  };
}

function normalizeTrace(trace: ApiTrace): AgentTrace {
  const spans = trace.spans.map((span) => normalizeSpan(trace.run_id, span));
  const toolCallCount = spans.reduce((count, span) => count + (span.toolCalls?.length ?? 0), 0);

  return {
    ...normalizeSummary({ ...trace, span_count: trace.spans.length }),
    input: trace.user_input,
    output: trace.final_output,
    metadata: {
      source: "fastapi",
      completed_at: trace.completed_at,
      span_count: trace.spans.length,
      tool_call_count: toolCallCount,
    },
    metrics: [
      ...formatDurationMetric(trace.latency_ms),
      { name: "tool_calls", value: toolCallCount },
      { name: "uncertainty_score", value: trace.uncertainty_score },
    ],
    spans,
  };
}

function summarizeTrace(trace: AgentTrace): TraceSummary {
  return {
    runId: trace.runId,
    name: trace.name,
    status: trace.status,
    startedAt: trace.startedAt,
    ...(trace.endedAt != null ? { endedAt: trace.endedAt } : {}),
    ...(trace.durationMs != null ? { durationMs: trace.durationMs } : {}),
    ...(trace.latencyMs != null ? { latencyMs: trace.latencyMs } : {}),
    uncertaintyScore: trace.uncertaintyScore,
    metrics: trace.metrics,
    spanCount: trace.spans.length,
    toolCallCount: trace.spans.reduce((count, span) => count + (span.toolCalls?.length ?? 0), 0),
  };
}

export async function getTraceSummaries(): Promise<TraceSummary[]> {
  const traces = await fetchJson<ApiTraceSummary[]>("/api/v1/traces");

  if (!traces) {
    return mockTraces.map(summarizeTrace);
  }

  return traces.map(normalizeSummary);
}

export async function getTrace(runId: string): Promise<AgentTrace | null> {
  const trace = await fetchJson<ApiTrace>(`/api/v1/traces/${runId}`);

  if (!trace) {
    return mockTraces.find((mockTrace) => mockTrace.runId === runId) ?? null;
  }

  return normalizeTrace(trace);
}
