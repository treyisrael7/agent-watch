from collections.abc import Generator

from app.repositories.in_memory_trace_repository import InMemoryTraceRepository
from app.services.trace_service import TraceService

trace_repository = InMemoryTraceRepository()
trace_service = TraceService(trace_repository)


def get_trace_service() -> Generator[TraceService]:
    yield trace_service
