import type { TraceStatus } from "@agent-watch/types";
import { Badge } from "@agent-watch/ui";

const statusVariant: Record<TraceStatus, "default" | "secondary" | "destructive" | "outline"> = {
  queued: "outline",
  running: "secondary",
  succeeded: "default",
  success: "default",
  failed: "destructive",
  warning: "secondary",
  unstable: "outline",
  cancelled: "outline",
};

export function StatusBadge({ status }: { status: TraceStatus }) {
  return (
    <Badge
      className="capitalize shadow-[0_0_24px_rgba(45,212,191,0.12)]"
      variant={statusVariant[status]}
    >
      {status}
    </Badge>
  );
}
