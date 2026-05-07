from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_trace_service
from app.schemas.trace import (
    TraceCreate,
    TraceRead,
    TraceSummary,
    trace_from_model,
    trace_summary_from_model,
    trace_to_model,
)
from app.services.trace_service import TraceService

router = APIRouter(prefix="/traces", tags=["traces"])


@router.post("", response_model=TraceRead, status_code=status.HTTP_201_CREATED)
def create_trace(
    trace: TraceCreate,
    trace_service: Annotated[TraceService, Depends(get_trace_service)],
) -> TraceRead:
    created_trace = trace_service.create(trace_to_model(trace))
    return trace_from_model(created_trace)


@router.get("", response_model=list[TraceSummary])
def list_traces(
    trace_service: Annotated[TraceService, Depends(get_trace_service)],
) -> list[TraceSummary]:
    return [trace_summary_from_model(trace) for trace in trace_service.list()]


@router.get("/{run_id}", response_model=TraceRead)
def get_trace(
    run_id: str,
    trace_service: Annotated[TraceService, Depends(get_trace_service)],
) -> TraceRead:
    trace = trace_service.get(run_id)
    if trace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trace not found")
    return trace_from_model(trace)
