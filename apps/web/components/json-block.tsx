export function JsonBlock({ value }: { value: unknown }) {
  if (value == null) {
    return <p className="text-sm text-muted-foreground">No data captured.</p>;
  }

  return (
    <pre className="max-h-[28rem] overflow-auto rounded-lg border border-border bg-black/40 p-4 text-xs leading-relaxed text-teal-100/80 shadow-inner shadow-black/40">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
