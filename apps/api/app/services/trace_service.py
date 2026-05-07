from app.models.trace import Trace
from app.repositories.in_memory_trace_repository import InMemoryTraceRepository


class TraceService:
    def __init__(self, repository: InMemoryTraceRepository) -> None:
        self.repository = repository

    def create(self, trace: Trace) -> Trace:
        return self.repository.upsert(trace)

    def list(self) -> list[Trace]:
        return self.repository.list()

    def get(self, run_id: str) -> Trace | None:
        return self.repository.get(run_id)
