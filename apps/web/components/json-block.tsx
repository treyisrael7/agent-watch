export function JsonBlock({ value }: { value: unknown }) {
  if (value == null) {
    return <p className="text-sm text-muted-foreground">No data captured.</p>;
  }

  return (
    <pre className="overflow-auto rounded-lg border border-border bg-black/30 p-4 text-xs text-muted-foreground">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
