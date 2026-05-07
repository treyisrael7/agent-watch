from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal

TraceStatus = Literal["success", "failed", "warning", "unstable"]
SpanType = Literal["llm_call", "tool_call", "retrieval", "decision", "error"]


@dataclass(slots=True)
class TraceSpan:
    span_id: str
    type: SpanType
    name: str
    input: Any | None
    output: Any | None
    started_at: datetime
    ended_at: datetime | None
    latency_ms: int | None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class Trace:
    run_id: str
    agent_name: str
    status: TraceStatus
    started_at: datetime
    completed_at: datetime | None
    latency_ms: int | None
    user_input: str
    final_output: str | None
    uncertainty_score: float
    spans: list[TraceSpan] = field(default_factory=list)
