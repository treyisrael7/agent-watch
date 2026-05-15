import type {
  TraceIngestPayload,
  TraceIngestSpan,
  TraceIngestSpanType,
  TraceIngestStatus,
} from "@agent-watch/types";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type IdGenerator = (prefix: "run" | "span") => string;
type ResolvedClientOptions = Required<Pick<AgentWatchOptions, "fetch" | "idGenerator" | "now">> &
  Pick<AgentWatchOptions, "apiKey" | "endpoint">;

export type AgentWatchOptions = {
  endpoint: string;
  apiKey?: string;
  fetch?: FetchLike;
  idGenerator?: IdGenerator;
  now?: () => Date;
};

export type StartTraceOptions = {
  agentName: string;
  userInput: string;
};

export type AddSpanOptions = {
  type: TraceIngestSpanType;
  name: string;
  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;
};

export type EndTraceOptions = {
  status: TraceIngestStatus;
  finalOutput?: string;
  uncertaintyScore: number;
};

export type TraceEndResult = {
  ok: boolean;
  status?: number;
  payload: TraceIngestPayload;
  error?: Error;
};

export class AgentWatch {
  readonly #options: ResolvedClientOptions;

  constructor(options: AgentWatchOptions) {
    if (!options.endpoint) {
      throw new Error("AgentWatch requires an endpoint.");
    }

    this.#options = {
      endpoint: options.endpoint,
      ...(options.apiKey != null ? { apiKey: options.apiKey } : {}),
      fetch: options.fetch ?? getDefaultFetch(),
      idGenerator: options.idGenerator ?? createId,
      now: options.now ?? (() => new Date()),
    };
  }

  startTrace(options: StartTraceOptions): AgentWatchTrace {
    return new AgentWatchTrace({
      ...options,
      client: this.#options,
    });
  }
}

type AgentWatchTraceOptions = StartTraceOptions & {
  client: ResolvedClientOptions;
};

export class AgentWatchTrace {
  readonly #client: AgentWatchTraceOptions["client"];
  readonly #runId: string;
  readonly #agentName: string;
  readonly #userInput: string;
  readonly #startedAt: Date;
  readonly #spans: TraceIngestSpan[] = [];
  #ended = false;

  constructor(options: AgentWatchTraceOptions) {
    this.#client = options.client;
    this.#runId = this.#client.idGenerator("run");
    this.#agentName = options.agentName;
    this.#userInput = options.userInput;
    this.#startedAt = this.#client.now();
  }

  get runId(): string {
    return this.#runId;
  }

  addSpan(options: AddSpanOptions): TraceIngestSpan {
    if (this.#ended) {
      throw new Error("Cannot add spans after the trace has ended.");
    }

    const startedAt = this.#client.now();
    const endedAt = this.#client.now();
    const latencyMs = durationMs(startedAt, endedAt);
    const span: TraceIngestSpan = {
      span_id: this.#client.idGenerator("span"),
      type: options.type,
      name: options.name,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      latency_ms: latencyMs,
      metadata: options.metadata ?? {},
    };

    if ("input" in options) {
      span.input = options.input;
    }

    if ("output" in options) {
      span.output = options.output;
    }

    this.#spans.push(span);
    return span;
  }

  async end(options: EndTraceOptions): Promise<TraceEndResult> {
    if (this.#ended) {
      throw new Error("Trace has already ended.");
    }

    this.#ended = true;

    const completedAt = this.#client.now();
    const payload = this.#buildPayload(options, completedAt);

    try {
      const response = await this.#client.fetch(this.#client.endpoint, {
        method: "POST",
        headers: this.#headers(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          payload,
          error: new Error(`Agent Watch trace upload failed with status ${response.status}.`),
        };
      }

      return { ok: true, status: response.status, payload };
    } catch (cause) {
      return {
        ok: false,
        payload,
        error: cause instanceof Error ? cause : new Error("Agent Watch trace upload failed."),
      };
    }
  }

  #buildPayload(options: EndTraceOptions, completedAt: Date): TraceIngestPayload {
    const payload: TraceIngestPayload = {
      run_id: this.#runId,
      agent_name: this.#agentName,
      status: options.status,
      started_at: this.#startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      latency_ms: durationMs(this.#startedAt, completedAt),
      user_input: this.#userInput,
      uncertainty_score: options.uncertaintyScore,
      spans: this.#spans,
    };

    if (options.finalOutput != null) {
      payload.final_output = options.finalOutput;
    }

    return payload;
  }

  #headers(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.#client.apiKey != null) {
      headers.Authorization = `Bearer ${this.#client.apiKey}`;
      headers["X-Agent-Watch-Api-Key"] = this.#client.apiKey;
    }

    return headers;
  }
}

function getDefaultFetch(): FetchLike {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("AgentWatch requires a fetch implementation in this runtime.");
  }

  return globalThis.fetch.bind(globalThis);
}

function createId(prefix: "run" | "span"): string {
  const randomId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}_${randomId}`;
}

function durationMs(startedAt: Date, endedAt: Date): number {
  return Math.max(0, Math.round(endedAt.getTime() - startedAt.getTime()));
}
