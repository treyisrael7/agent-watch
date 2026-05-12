import { Card, CardContent, CardHeader, CardTitle } from "@agent-watch/ui";
import { TraceTable } from "@/components/trace-table";
import { getTraceSummaries } from "@/lib/api";

function formatMs(value?: number) {
  if (value == null) {
    return "0ms";
  }

  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value}ms`;
}

export default async function TracesPage() {
  const traces = await getTraceSummaries();
  const failedCount = traces.filter((trace) => trace.status === "failed").length;
  const warningCount = traces.filter(
    (trace) => trace.status === "warning" || trace.status === "unstable",
  ).length;
  const averageLatency =
    traces.length > 0
      ? Math.round(
          traces.reduce((sum, trace) => sum + (trace.latencyMs ?? trace.durationMs ?? 0), 0) /
            traces.length,
        )
      : 0;
  const averageUncertainty =
    traces.length > 0
      ? traces.reduce((sum, trace) => sum + trace.uncertaintyScore, 0) / traces.length
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Trace registry</p>
        <h1 className="text-3xl font-semibold tracking-tight">Agent Traces</h1>
        <p className="text-muted-foreground">
          Inspect recent agent runs, latency, uncertainty, span counts, and captured metrics.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Runs</CardTitle>
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
            <CardTitle className="text-sm text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold">{failedCount}</CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-3xl font-semibold">{formatMs(averageLatency)}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              avg uncertainty {Math.round(averageUncertainty * 100)}%
            </div>
          </CardContent>
        </Card>
      </section>

      <TraceTable traces={traces} />
    </div>
  );
}
