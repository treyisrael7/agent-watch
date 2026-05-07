import type { AgentTrace, TraceSummary } from "@agent-watch/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getTraceSummaries(): Promise<TraceSummary[]> {
  return (await fetchJson<TraceSummary[]>("/api/v1/traces")) ?? [];
}

export async function getTrace(runId: string): Promise<AgentTrace | null> {
  return fetchJson<AgentTrace>(`/api/v1/traces/${runId}`);
}
