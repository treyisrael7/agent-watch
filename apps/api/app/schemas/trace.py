from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.trace import SpanType, Trace, TraceSpan, TraceStatus


class TraceSpanBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    span_id: str = Field(min_length=1, max_length=100)
    type: SpanType
    name: str = Field(min_length=1, max_length=200)
    input: Any | None = None
    output: Any | None = None
    started_at: datetime
    ended_at: datetime | None = None
    latency_ms: int | None = Field(default=None, ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_timing(self) -> "TraceSpanBase":
        if self.ended_at is not None and self.ended_at < self.started_at:
            raise ValueError("ended_at must be greater than or equal to started_at")
        return self


class TraceSpanCreate(TraceSpanBase):
    pass


class TraceSpanRead(TraceSpanBase):
    pass


class TraceBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run_id: str = Field(min_length=1, max_length=100)
    agent_name: str = Field(min_length=1, max_length=120)
    status: TraceStatus
    started_at: datetime
    completed_at: datetime | None = None
    latency_ms: int | None = Field(default=None, ge=0)
    user_input: str = Field(min_length=1, max_length=20_000)
    final_output: str | None = Field(default=None, max_length=50_000)
    uncertainty_score: float = Field(ge=0, le=1)
    spans: list[TraceSpanCreate] = Field(default_factory=list)

    @field_validator("spans")
    @classmethod
    def validate_unique_span_ids(cls, spans: list[TraceSpanCreate]) -> list[TraceSpanCreate]:
        span_ids = [span.span_id for span in spans]
        if len(span_ids) != len(set(span_ids)):
            raise ValueError("span_id values must be unique within a trace")
        return spans

    @model_validator(mode="after")
    def validate_timing(self) -> "TraceBase":
        if self.completed_at is not None and self.completed_at < self.started_at:
            raise ValueError("completed_at must be greater than or equal to started_at")
        return self


class TraceCreate(TraceBase):
    pass


class TraceRead(TraceBase):
    spans: list[TraceSpanRead] = Field(default_factory=list)


class TraceSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run_id: str
    agent_name: str
    status: TraceStatus
    started_at: datetime
    completed_at: datetime | None = None
    latency_ms: int | None = None
    uncertainty_score: float
    span_count: int


def span_to_model(span: TraceSpanCreate) -> TraceSpan:
    return TraceSpan(
        span_id=span.span_id,
        type=span.type,
        name=span.name,
        input=span.input,
        output=span.output,
        started_at=span.started_at,
        ended_at=span.ended_at,
        latency_ms=span.latency_ms,
        metadata=span.metadata,
    )


def trace_to_model(trace: TraceCreate) -> Trace:
    return Trace(
        run_id=trace.run_id,
        agent_name=trace.agent_name,
        status=trace.status,
        started_at=trace.started_at,
        completed_at=trace.completed_at,
        latency_ms=trace.latency_ms,
        user_input=trace.user_input,
        final_output=trace.final_output,
        uncertainty_score=trace.uncertainty_score,
        spans=[span_to_model(span) for span in trace.spans],
    )


def span_from_model(span: TraceSpan) -> TraceSpanRead:
    return TraceSpanRead(
        span_id=span.span_id,
        type=span.type,
        name=span.name,
        input=span.input,
        output=span.output,
        started_at=span.started_at,
        ended_at=span.ended_at,
        latency_ms=span.latency_ms,
        metadata=span.metadata,
    )


def trace_from_model(trace: Trace) -> TraceRead:
    return TraceRead(
        run_id=trace.run_id,
        agent_name=trace.agent_name,
        status=trace.status,
        started_at=trace.started_at,
        completed_at=trace.completed_at,
        latency_ms=trace.latency_ms,
        user_input=trace.user_input,
        final_output=trace.final_output,
        uncertainty_score=trace.uncertainty_score,
        spans=[span_from_model(span) for span in trace.spans],
    )


def trace_summary_from_model(trace: Trace) -> TraceSummary:
    return TraceSummary(
        run_id=trace.run_id,
        agent_name=trace.agent_name,
        status=trace.status,
        started_at=trace.started_at,
        completed_at=trace.completed_at,
        latency_ms=trace.latency_ms,
        uncertainty_score=trace.uncertainty_score,
        span_count=len(trace.spans),
    )
