import { JsonBlock } from "@/components/json-block";
import { MetricPill } from "@/components/metric-pill";
import { StatusBadge } from "@/components/status-badge";
import { getTrace } from "@/lib/api";
import type { AgentSpan } from "@agent-watch/types";
import { Card, CardContent, CardHeader, CardTitle } from "@agent-watch/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

type TraceDetailPageProps = {
  params: Promise<{
    runId: string;
  }>;
};

function formatMs(value?: number) {
  if (value == null) {
    return "Open";
  }

  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value}ms`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function spanOffsetPercent(traceStartedAt: string, span: AgentSpan, totalDuration: number) {
  const elapsed = new Date(span.startedAt).getTime() - new Date(traceStartedAt).getTime();

  if (totalDuration <= 0) {
    return 0;
  }

  return Math.min(92, Math.max(0, (elapsed / totalDuration) * 100));
}

function spanWidthPercent(span: AgentSpan, totalDuration: number) {
  if (!span.durationMs || totalDuration <= 0) {
    return 6;
  }

  return Math.min(100, Math.max(6, (span.durationMs / totalDuration) * 100));
}

export default async function TraceDetailPage({ params }: TraceDetailPageProps) {
  const { runId } = await params;
  const trace = await getTrace(runId);

  if (!trace) {
    notFound();
  }

  const toolCallCount = trace.spans.reduce(
    (count, span) => count + (span.toolCalls?.length ?? 0),
    0,
  );
  const totalDuration = trace.latencyMs ?? trace.durationMs ?? 0;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/traces"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Back to traces
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{trace.name}</h1>
          <StatusBadge status={trace.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {trace.runId} started {new Date(trace.startedAt).toLocaleString()}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Latency</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">
            {formatMs(trace.latencyMs ?? trace.durationMs)}
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Spans</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">
            {trace.spans.length}
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Tool Calls</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">{toolCallCount}</CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Uncertainty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-3xl font-semibold">
              {Math.round(trace.uncertaintyScore * 100)}%
            </div>
            <div className="mt-3 h-2 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary shadow-[0_0_18px_rgba(45,212,191,0.6)]"
                style={{ width: `${Math.max(4, trace.uncertaintyScore * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trace.metrics.length > 0 ? (
              trace.metrics.map((metric) => <MetricPill key={metric.name} metric={metric} />)
            ) : (
              <p className="text-sm text-muted-foreground">No metrics captured.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {trace.spans.map((span) => (
            <div key={span.id} className="relative rounded-xl border border-border bg-black/20 p-4">
              <div className="absolute bottom-0 left-6 top-0 w-px bg-border" />
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full border border-primary bg-background shadow-[0_0_18px_rgba(45,212,191,0.7)]" />
                    <h2 className="font-medium">{span.name}</h2>
                  </div>
                  <p className="pl-6 font-mono text-xs text-muted-foreground">
                    {span.kind} / {span.id} / {formatTime(span.startedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs capitalize">
                    {span.status}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatMs(span.durationMs)}
                  </span>
                </div>
              </div>

              <div className="ml-6 mt-4 h-2 rounded-full bg-secondary/70">
                <div
                  className="h-full rounded-full bg-primary/80"
                  style={{
                    marginLeft: `${spanOffsetPercent(trace.startedAt, span, totalDuration)}%`,
                    width: `${spanWidthPercent(span, totalDuration)}%`,
                  }}
                />
              </div>

              {span.toolCalls && span.toolCalls.length > 0 ? (
                <div className="ml-6 mt-4 grid gap-2">
                  {span.toolCalls.map((toolCall) => (
                    <div
                      key={toolCall.id}
                      className="rounded-md border border-border bg-secondary/30 p-3 text-sm"
                    >
                      <div className="font-medium">{toolCall.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {toolCall.status} · {formatMs(toolCall.durationMs)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {span.attributes ? (
                <div className="ml-6 mt-4">
                  <JsonBlock value={span.attributes} />
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonBlock value={trace.input} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonBlock value={trace.output} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonBlock value={trace.metadata} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
