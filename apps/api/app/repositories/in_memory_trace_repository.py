from datetime import UTC, datetime

from app.models.trace import Trace, TraceSpan


class InMemoryTraceRepository:
    """Simple process-local trace storage for the MVP."""

    def __init__(self, seed_data: list[Trace] | None = None) -> None:
        self._traces: dict[str, Trace] = {}
        for trace in seed_data or _seed_traces():
            self.upsert(trace)

    def upsert(self, trace: Trace) -> Trace:
        self._traces[trace.run_id] = trace
        return trace

    def list(self) -> list[Trace]:
        return sorted(self._traces.values(), key=lambda trace: trace.started_at, reverse=True)

    def get(self, run_id: str) -> Trace | None:
        return self._traces.get(run_id)


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value).replace(tzinfo=UTC)


def _seed_traces() -> list[Trace]:
    return [
        Trace(
            run_id="run_support_refund_001",
            agent_name="Support Resolution Agent",
            status="success",
            started_at=_dt("2026-05-07T13:21:04"),
            completed_at=_dt("2026-05-07T13:21:11"),
            latency_ms=7340,
            user_input="Customer says they were double-charged for invoice INV-2048.",
            final_output="Refund request confirmed and escalated with invoice evidence attached.",
            uncertainty_score=0.08,
            spans=[
                TraceSpan(
                    span_id="span_refund_intent",
                    type="decision",
                    name="Classify customer intent",
                    input={"message": "I was charged twice for invoice INV-2048."},
                    output={"intent": "billing_refund", "confidence": 0.96},
                    started_at=_dt("2026-05-07T13:21:04"),
                    ended_at=_dt("2026-05-07T13:21:05"),
                    latency_ms=820,
                    metadata={"policy_version": "billing-v3"},
                ),
                TraceSpan(
                    span_id="span_refund_lookup",
                    type="tool_call",
                    name="Lookup invoice",
                    input={"invoice_id": "INV-2048"},
                    output={"duplicate_charge": True, "amount_usd": 49.0},
                    started_at=_dt("2026-05-07T13:21:05"),
                    ended_at=_dt("2026-05-07T13:21:08"),
                    latency_ms=2810,
                    metadata={"tool": "billing_api.get_invoice"},
                ),
                TraceSpan(
                    span_id="span_refund_response",
                    type="llm_call",
                    name="Draft customer response",
                    input={"tone": "concise", "facts": ["duplicate charge", "$49.00"]},
                    output={"message": "I found the duplicate charge and started the refund review."},
                    started_at=_dt("2026-05-07T13:21:08"),
                    ended_at=_dt("2026-05-07T13:21:11"),
                    latency_ms=3710,
                    metadata={"model": "gpt-5.5", "prompt_tokens": 724, "completion_tokens": 96},
                ),
            ],
        ),
        Trace(
            run_id="run_research_summary_017",
            agent_name="Research Briefing Agent",
            status="warning",
            started_at=_dt("2026-05-07T12:08:40"),
            completed_at=_dt("2026-05-07T12:08:54"),
            latency_ms=14320,
            user_input="Summarize practical approaches to evaluating autonomous coding agents.",
            final_output="Produced a briefing but flagged that two retrieved sources were weakly relevant.",
            uncertainty_score=0.34,
            spans=[
                TraceSpan(
                    span_id="span_eval_retrieval",
                    type="retrieval",
                    name="Retrieve evaluation references",
                    input={"query": "autonomous coding agent evaluation methods"},
                    output={"documents": 6, "low_relevance_documents": 2},
                    started_at=_dt("2026-05-07T12:08:40"),
                    ended_at=_dt("2026-05-07T12:08:46"),
                    latency_ms=6020,
                    metadata={"index": "agent-watch-demo", "top_k": 6},
                ),
                TraceSpan(
                    span_id="span_eval_synthesis",
                    type="llm_call",
                    name="Synthesize briefing",
                    input={"documents": 6, "format": "executive_summary"},
                    output={"sections": ["benchmarks", "human review", "production telemetry"]},
                    started_at=_dt("2026-05-07T12:08:46"),
                    ended_at=_dt("2026-05-07T12:08:54"),
                    latency_ms=8300,
                    metadata={"model": "gpt-5.5", "temperature": 0.2},
                ),
            ],
        ),
        Trace(
            run_id="run_deploy_triage_043",
            agent_name="Deploy Triage Agent",
            status="failed",
            started_at=_dt("2026-05-07T10:44:19"),
            completed_at=_dt("2026-05-07T10:44:25"),
            latency_ms=6410,
            user_input="Find why the production deploy failed after the migration step.",
            final_output="Could not complete triage because log access returned an authorization error.",
            uncertainty_score=0.79,
            spans=[
                TraceSpan(
                    span_id="span_deploy_logs",
                    type="tool_call",
                    name="Fetch deployment logs",
                    input={"deployment_id": "deploy_9f21"},
                    output=None,
                    started_at=_dt("2026-05-07T10:44:19"),
                    ended_at=_dt("2026-05-07T10:44:23"),
                    latency_ms=4040,
                    metadata={"tool": "deployments.get_logs", "http_status": 403},
                ),
                TraceSpan(
                    span_id="span_deploy_error",
                    type="error",
                    name="Handle log access failure",
                    input={"http_status": 403},
                    output={"error": "missing deployment:read scope"},
                    started_at=_dt("2026-05-07T10:44:23"),
                    ended_at=_dt("2026-05-07T10:44:25"),
                    latency_ms=2370,
                    metadata={"retryable": False},
                ),
            ],
        ),
        Trace(
            run_id="run_code_review_088",
            agent_name="Code Review Agent",
            status="unstable",
            started_at=_dt("2026-05-07T09:16:02"),
            completed_at=_dt("2026-05-07T09:16:15"),
            latency_ms=12980,
            user_input="Review the authentication middleware diff for regressions.",
            final_output="Found one likely regression but model confidence varied across retries.",
            uncertainty_score=0.52,
            spans=[
                TraceSpan(
                    span_id="span_review_diff",
                    type="llm_call",
                    name="Analyze middleware diff",
                    input={"files": ["auth/middleware.ts", "auth/session.ts"]},
                    output={"findings": 1, "confidence": 0.61},
                    started_at=_dt("2026-05-07T09:16:02"),
                    ended_at=_dt("2026-05-07T09:16:10"),
                    latency_ms=8160,
                    metadata={"model": "gpt-5.5", "attempt": 1},
                ),
                TraceSpan(
                    span_id="span_review_decision",
                    type="decision",
                    name="Determine review severity",
                    input={"finding_confidence": 0.61, "area": "auth"},
                    output={"severity": "medium", "needs_human_review": True},
                    started_at=_dt("2026-05-07T09:16:10"),
                    ended_at=_dt("2026-05-07T09:16:15"),
                    latency_ms=4820,
                    metadata={"variance": "high"},
                ),
            ],
        ),
    ]
