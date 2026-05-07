import { JsonBlock } from "@/components/json-block";
import { MetricPill } from "@/components/metric-pill";
import { StatusBadge } from "@/components/status-badge";
import { getTrace } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@agent-watch/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

type TraceDetailPageProps = {
  params: Promise<{
    runId: string;
  }>;
};

export default async function TraceDetailPage({ params }: TraceDetailPageProps) {
  const { runId } = await params;
  const trace = await getTrace(runId);

  if (!trace) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link href="/traces" className="text-sm text-muted-foreground hover:text-foreground">
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

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {trace.durationMs ? `${trace.durationMs}ms` : "Open"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spans</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{trace.spans.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tool Calls</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {trace.spans.reduce((count, span) => count + (span.toolCalls?.length ?? 0), 0)}
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

      <Card>
        <CardHeader>
          <CardTitle>Spans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trace.spans.map((span) => (
            <div key={span.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium">{span.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {span.kind} · {span.id}
                  </p>
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs">{span.status}</span>
              </div>
              {span.toolCalls && span.toolCalls.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {span.toolCalls.map((toolCall) => (
                    <div key={toolCall.id} className="rounded-md bg-secondary/40 p-3 text-sm">
                      <div className="font-medium">{toolCall.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {toolCall.status} · {toolCall.durationMs ?? 0}ms
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
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
      </section>
    </div>
  );
}
