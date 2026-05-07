import type { TraceMetric } from "@agent-watch/types";

export function MetricPill({ metric }: { metric: TraceMetric }) {
  return (
    <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
      {metric.name}: <span className="font-medium text-foreground">{metric.value}</span>
      {metric.unit ? ` ${metric.unit}` : ""}
    </span>
  );
}
