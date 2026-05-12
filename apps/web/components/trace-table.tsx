import type { TraceSummary } from "@agent-watch/types";
import { Card, CardContent } from "@agent-watch/ui";
import Link from "next/link";
import { MetricPill } from "./metric-pill";
import { StatusBadge } from "./status-badge";

function formatMs(value?: number) {
  if (value == null) {
    return "Open";
  }

  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value}ms`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

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
    <div className="overflow-hidden rounded-xl border border-border bg-card/70 shadow-2xl shadow-black/20">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-secondary/50 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Run</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Latency</th>
            <th className="px-4 py-3 font-medium">Uncertainty</th>
            <th className="px-4 py-3 font-medium">Activity</th>
            <th className="px-4 py-3 font-medium">Metrics</th>
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => (
            <tr
              key={trace.runId}
              className="border-t border-border/80 transition-colors hover:bg-secondary/30"
            >
              <td className="px-4 py-4">
                <Link href={`/traces/${trace.runId}`} className="font-medium hover:text-primary">
                  {trace.name}
                </Link>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{trace.runId}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatTime(trace.startedAt)}
                </div>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={trace.status} />
              </td>
              <td className="px-4 py-4 font-mono text-xs">
                {formatMs(trace.latencyMs ?? trace.durationMs)}
              </td>
              <td className="px-4 py-4">
                <div className="w-28">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>score</span>
                    <span>{Math.round(trace.uncertaintyScore * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, trace.uncertaintyScore * 100)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-muted-foreground">
                <span className="font-medium text-foreground">{trace.spanCount}</span> spans
                <span className="mx-2 text-border">/</span>
                <span className="font-medium text-foreground">{trace.toolCallCount}</span> tools
              </td>
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
