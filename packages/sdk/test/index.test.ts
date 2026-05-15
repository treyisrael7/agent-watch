import { describe, expect, it, vi } from "vitest";
import { AgentWatch } from "../src/index";

function createClock(startMs = Date.UTC(2026, 4, 6, 22, 0, 0)) {
  let tick = 0;

  return () => new Date(startMs + tick++ * 1000);
}

function createIdGenerator() {
  let index = 0;

  return (prefix: "run" | "span") => `${prefix}_${++index}`;
}

describe("AgentWatch", () => {
  it("generates IDs, calculates latency, and sends traces to the endpoint", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 201 }));
    const watcher = new AgentWatch({
      endpoint: "http://localhost:8000/api/traces",
      apiKey: "dev-key",
      fetch: fetchMock,
      idGenerator: createIdGenerator(),
      now: createClock(),
    });

    const trace = watcher.startTrace({
      agentName: "customer-support-agent",
      userInput: "Can I get a refund?",
    });

    const span = trace.addSpan({
      type: "retrieval",
      name: "Retrieve refund policy",
      input: "refund policy",
      output: "Refunds are allowed within 30 days.",
    });

    const result = await trace.end({
      status: "success",
      finalOutput: "The customer is eligible for a refund.",
      uncertaintyScore: 0.14,
    });

    expect(trace.runId).toBe("run_1");
    expect(span.span_id).toBe("span_2");
    expect(span.latency_ms).toBe(1000);
    expect(result.ok).toBe(true);
    expect(result.payload.latency_ms).toBe(3000);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/traces",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer dev-key",
          "X-Agent-Watch-Api-Key": "dev-key",
        },
      }),
    );

    const request = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toEqual({
      run_id: "run_1",
      agent_name: "customer-support-agent",
      status: "success",
      started_at: "2026-05-06T22:00:00.000Z",
      completed_at: "2026-05-06T22:00:03.000Z",
      latency_ms: 3000,
      user_input: "Can I get a refund?",
      final_output: "The customer is eligible for a refund.",
      uncertainty_score: 0.14,
      spans: [
        {
          span_id: "span_2",
          type: "retrieval",
          name: "Retrieve refund policy",
          input: "refund policy",
          output: "Refunds are allowed within 30 days.",
          started_at: "2026-05-06T22:00:01.000Z",
          ended_at: "2026-05-06T22:00:02.000Z",
          latency_ms: 1000,
          metadata: {},
        },
      ],
    });
  });

  it("returns a failed result when fetch rejects", async () => {
    const watcher = new AgentWatch({
      endpoint: "http://localhost:8000/api/traces",
      fetch: vi.fn(async () => {
        throw new Error("connection refused");
      }),
      idGenerator: createIdGenerator(),
      now: createClock(),
    });

    const result = await watcher
      .startTrace({
        agentName: "customer-support-agent",
        userInput: "Can I get a refund?",
      })
      .end({
        status: "failed",
        uncertaintyScore: 0.8,
      });

    expect(result.ok).toBe(false);
    expect(result.error?.message).toBe("connection refused");
    expect(result.payload.run_id).toBe("run_1");
  });

  it("returns a failed result for non-2xx responses", async () => {
    const watcher = new AgentWatch({
      endpoint: "http://localhost:8000/api/traces",
      fetch: vi.fn(async () => new Response(null, { status: 500 })),
      idGenerator: createIdGenerator(),
      now: createClock(),
    });

    const result = await watcher
      .startTrace({
        agentName: "customer-support-agent",
        userInput: "Can I get a refund?",
      })
      .end({
        status: "failed",
        uncertaintyScore: 0.8,
      });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error?.message).toContain("status 500");
  });
});
