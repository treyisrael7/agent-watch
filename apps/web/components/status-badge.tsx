import type { TraceStatus } from "@agent-watch/types";
import { Badge } from "@agent-watch/ui";

const statusVariant: Record<TraceStatus, "default" | "secondary" | "destructive" | "outline"> = {
  queued: "outline",
  running: "secondary",
  succeeded: "default",
  failed: "destructive",
  cancelled: "outline",
};

export function StatusBadge({ status }: { status: TraceStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
