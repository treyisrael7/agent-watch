import { Card, CardContent, CardHeader, CardTitle } from "@agent-watch/ui";
import Link from "next/link";

const features = [
  "Trace ingestion for full agent runs",
  "Span timelines for agent, LLM, workflow, and tool work",
  "Tool call auditing with inputs, outputs, and errors",
  "Status and metric summaries for local debugging",
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
            Open-source observability for AI agents
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight">
              Watch every agent run, span, tool call, status, and metric.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Agent Watch gives developers a simple local dashboard and ingestion API for debugging
              AI agent behavior before it becomes production telemetry.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/traces"
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Send a trace</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-black/40 p-4 text-xs text-muted-foreground">
              {`curl -X POST http://localhost:8000/api/v1/traces \\
  -H "Content-Type: application/json" \\
  -d @apps/api/examples/trace.json`}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature}>
            <CardContent className="p-5 text-sm text-muted-foreground">{feature}</CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
