from app.models.trace import AgentTrace, TraceSummary
from app.repositories.trace_repository import TraceRepository


class TraceService:
    def __init__(self, repository: TraceRepository) -> None:
        self.repository = repository

    def ingest(self, trace: AgentTrace) -> AgentTrace:
        return self.repository.upsert(trace)

    def list_summaries(self) -> list[TraceSummary]:
        return [self._to_summary(trace) for trace in self.repository.list()]

    def get(self, run_id: str) -> AgentTrace | None:
        return self.repository.get(run_id)

    @staticmethod
    def _to_summary(trace: AgentTrace) -> TraceSummary:
        tool_call_count = sum(len(span.tool_calls) for span in trace.spans)
        return TraceSummary(
            runId=trace.run_id,
            name=trace.name,
            status=trace.status,
            startedAt=trace.started_at,
            endedAt=trace.ended_at,
            durationMs=trace.duration_ms,
            metrics=trace.metrics,
            spanCount=len(trace.spans),
            toolCallCount=tool_call_count,
        )
