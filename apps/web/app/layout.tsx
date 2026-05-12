import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Watch",
  description: "Open-source observability for AI agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="min-h-screen bg-background text-foreground">
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_28rem),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.1),_transparent_24rem)]" />
          <div className="grid min-h-screen lg:grid-cols-[17rem_1fr]">
            <aside className="border-b border-border/70 bg-black/30 px-6 py-5 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
              <div className="flex h-full flex-col gap-8">
                <Link href="/" className="group flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-mono text-sm text-primary shadow-[0_0_30px_rgba(45,212,191,0.18)]">
                    AW
                  </span>
                  <span>
                    <span className="block font-semibold tracking-tight">Agent Watch</span>
                    <span className="block text-xs text-muted-foreground">Trace observability</span>
                  </span>
                </Link>

                <nav className="grid gap-2 text-sm">
                  <Link
                    href="/"
                    className="rounded-lg border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/traces"
                    className="rounded-lg border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                  >
                    Traces
                  </Link>
                  <a
                    href="http://localhost:8000/docs"
                    className="rounded-lg border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                  >
                    API Docs
                  </a>
                </nav>

                <div className="mt-auto rounded-xl border border-border/80 bg-card/60 p-4 text-xs text-muted-foreground shadow-2xl shadow-black/20">
                  <div className="mb-2 flex items-center gap-2 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_rgba(45,212,191,0.8)]" />
                    Backend target
                  </div>
                  <code>localhost:8000</code>
                </div>
              </div>
            </aside>

            <main className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
