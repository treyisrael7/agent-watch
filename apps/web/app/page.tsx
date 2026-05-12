import { TraceTable } from "@/components/trace-table";
import { getTraceSummaries } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@agent-watch/ui";
import Link from "next/link";

function formatMs(value?: number) {
  if (value == null) {
    return "0ms";
  }

  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value}ms`;
}

export default async function HomePage() {
  const traces = await getTraceSummaries();
  const totalLatency = traces.reduce(
    (sum, trace) => sum + (trace.latencyMs ?? trace.durationMs ?? 0),
    0,
  );
  const averageLatency = traces.length > 0 ? Math.round(totalLatency / traces.length) : 0;
  const averageUncertainty =
    traces.length > 0
      ? traces.reduce((sum, trace) => sum + trace.uncertaintyScore, 0) / traces.length
      : 0;
  const failedCount = traces.filter((trace) => trace.status === "failed").length;
  const warningCount = traces.filter(
    (trace) => trace.status === "warning" || trace.status === "unstable",
  ).length;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
            agent-watch://dashboard
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Observe agent runs from prompt to final output.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Monitor trace health, latency, uncertainty, and span-level metadata from the FastAPI
              ingestion backend. Mock traces appear automatically while the backend is unavailable.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/traces"
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_0_28px_rgba(45,212,191,0.24)] transition-colors hover:bg-primary/90"
            >
              View traces
            </Link>
            <a
              href="http://localhost:8000/docs"
              className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Open API docs
            </a>
          </div>
        </div>
        <Card className="border-primary/20 bg-card/80 shadow-2xl shadow-black/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Live Signal
              <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                {traces.length} runs
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Avg latency
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold">
                  {formatMs(averageLatency)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Uncertainty
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold">
                  {Math.round(averageUncertainty * 100)}%
                </div>
              </div>
            </div>
            <pre className="overflow-auto rounded-lg border border-border bg-black/40 p-4 text-xs text-muted-foreground">
              {`curl -X POST http://localhost:8000/api/v1/traces \\
  -H "Content-Type: application/json" \\
  -d @apps/api/examples/trace.json`}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total runs</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">{traces.length}</CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Warnings</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">{warningCount}</CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Failures</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">{failedCount}</CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Avg latency</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">
            {formatMs(averageLatency)}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Recent traces</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Latest agent runs</h2>
          </div>
          <Link
            href="/traces"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Open all traces
          </Link>
        </div>
        <TraceTable traces={traces.slice(0, 5)} />
      </section>
    </div>
  );
}
