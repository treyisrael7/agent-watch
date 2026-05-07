from app.models.trace import AgentTrace


class TraceRepository:
    """In-memory repository for the MVP; replace with durable storage when needed."""

    def __init__(self) -> None:
        self._traces: dict[str, AgentTrace] = {}

    def upsert(self, trace: AgentTrace) -> AgentTrace:
        self._traces[trace.run_id] = trace
        return trace

    def list(self) -> list[AgentTrace]:
        return sorted(self._traces.values(), key=lambda trace: trace.started_at, reverse=True)

    def get(self, run_id: str) -> AgentTrace | None:
        return self._traces.get(run_id)
