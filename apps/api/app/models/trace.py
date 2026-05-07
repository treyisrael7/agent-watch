from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

TraceStatus = Literal["queued", "running", "succeeded", "failed", "cancelled"]
SpanStatus = Literal["pending", "running", "ok", "error", "cancelled"]
ToolCallStatus = Literal["pending", "running", "success", "error"]
SpanKind = Literal["agent", "llm", "tool", "workflow", "retrieval", "custom"]


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class TraceMetric(CamelModel):
    name: str
    value: float
    unit: str | None = None


class ToolCall(CamelModel):
    id: str
    span_id: str = Field(alias="spanId")
    name: str
    status: ToolCallStatus
    input: Any | None = None
    output: Any | None = None
    error: str | None = None
    started_at: datetime = Field(alias="startedAt")
    ended_at: datetime | None = Field(default=None, alias="endedAt")
    duration_ms: float | None = Field(default=None, alias="durationMs")


class AgentSpan(CamelModel):
    id: str
    run_id: str = Field(alias="runId")
    parent_span_id: str | None = Field(default=None, alias="parentSpanId")
    name: str
    kind: SpanKind
    status: SpanStatus
    started_at: datetime = Field(alias="startedAt")
    ended_at: datetime | None = Field(default=None, alias="endedAt")
    duration_ms: float | None = Field(default=None, alias="durationMs")
    attributes: dict[str, Any] | None = None
    tool_calls: list[ToolCall] = Field(default_factory=list, alias="toolCalls")


class AgentTrace(CamelModel):
    run_id: str = Field(alias="runId")
    name: str
    status: TraceStatus
    started_at: datetime = Field(alias="startedAt")
    ended_at: datetime | None = Field(default=None, alias="endedAt")
    duration_ms: float | None = Field(default=None, alias="durationMs")
    input: Any | None = None
    output: Any | None = None
    error: str | None = None
    metadata: dict[str, Any] | None = None
    metrics: list[TraceMetric] = Field(default_factory=list)
    spans: list[AgentSpan] = Field(default_factory=list)


class TraceSummary(CamelModel):
    run_id: str = Field(alias="runId")
    name: str
    status: TraceStatus
    started_at: datetime = Field(alias="startedAt")
    ended_at: datetime | None = Field(default=None, alias="endedAt")
    duration_ms: float | None = Field(default=None, alias="durationMs")
    metrics: list[TraceMetric] = Field(default_factory=list)
    span_count: int = Field(alias="spanCount")
    tool_call_count: int = Field(alias="toolCallCount")
