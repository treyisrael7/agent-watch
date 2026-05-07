import { Card, CardContent, CardHeader, CardTitle } from "@agent-watch/ui";
import { TraceTable } from "@/components/trace-table";
import { getTraceSummaries } from "@/lib/api";

export default async function TracesPage() {
  const traces = await getTraceSummaries();
  const failedCount = traces.filter((trace) => trace.status === "failed").length;
  const runningCount = traces.filter((trace) => trace.status === "running").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">Agent Traces</h1>
        <p className="text-muted-foreground">
          Inspect recent agent runs, span counts, tool call counts, and captured metrics.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Runs</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{traces.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Running</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{runningCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{failedCount}</CardContent>
        </Card>
      </section>

      <TraceTable traces={traces} />
    </div>
  );
}
