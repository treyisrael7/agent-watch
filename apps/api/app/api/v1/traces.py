from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_trace_service
from app.models.trace import AgentTrace, TraceSummary
from app.services.trace_service import TraceService

router = APIRouter()


@router.post("", response_model=AgentTrace, status_code=status.HTTP_201_CREATED)
def ingest_trace(
    trace: AgentTrace,
    trace_service: Annotated[TraceService, Depends(get_trace_service)],
) -> AgentTrace:
    return trace_service.ingest(trace)


@router.get("", response_model=list[TraceSummary])
def list_traces(
    trace_service: Annotated[TraceService, Depends(get_trace_service)],
) -> list[TraceSummary]:
    return trace_service.list_summaries()


@router.get("/{run_id}", response_model=AgentTrace)
def get_trace(
    run_id: str,
    trace_service: Annotated[TraceService, Depends(get_trace_service)],
) -> AgentTrace:
    trace = trace_service.get(run_id)
    if trace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trace not found")
    return trace
