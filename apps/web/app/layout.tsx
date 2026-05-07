import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Watch",
  description: "Open-source observability for AI agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_36rem)]">
          <header className="border-b border-border/70 bg-background/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="font-semibold tracking-tight">
                Agent Watch
              </Link>
              <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/traces" className="transition-colors hover:text-foreground">
                  Traces
                </Link>
                <a
                  href="http://localhost:8000/docs"
                  className="transition-colors hover:text-foreground"
                >
                  API Docs
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
