import type { TraceSummary } from "@agent-watch/types";
import { Card, CardContent } from "@agent-watch/ui";
import Link from "next/link";
import { MetricPill } from "./metric-pill";
import { StatusBadge } from "./status-badge";

export function TraceTable({ traces }: { traces: TraceSummary[] }) {
  if (traces.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No traces yet. Start the API and post `apps/api/examples/trace.json` to begin.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Run</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Spans</th>
            <th className="px-4 py-3 font-medium">Tool Calls</th>
            <th className="px-4 py-3 font-medium">Metrics</th>
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => (
            <tr key={trace.runId} className="border-t border-border">
              <td className="px-4 py-4">
                <Link href={`/traces/${trace.runId}`} className="font-medium hover:underline">
                  {trace.name}
                </Link>
                <div className="text-xs text-muted-foreground">{trace.runId}</div>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={trace.status} />
              </td>
              <td className="px-4 py-4">{trace.spanCount}</td>
              <td className="px-4 py-4">{trace.toolCallCount}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {trace.metrics.slice(0, 3).map((metric) => (
                    <MetricPill key={metric.name} metric={metric} />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
