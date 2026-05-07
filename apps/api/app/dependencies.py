from collections.abc import Generator

from app.repositories.trace_repository import TraceRepository
from app.services.trace_service import TraceService

trace_repository = TraceRepository()
trace_service = TraceService(trace_repository)


def get_trace_service() -> Generator[TraceService]:
    yield trace_service
