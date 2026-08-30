"use client";

import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <header style={{
        background: "#020817",
        padding: "0 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 64,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <span style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
          }}>IG</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.3px" }}>Inland Green Bank</span>
        </Link>
      </header>
      <main style={{
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: 1160,
        margin: "0 auto",
        padding: "80px 32px",
        textAlign: "center",
      }}>
        <div style={{
          maxWidth: 480,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: "48px 44px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#0f172a",
            marginBottom: 8,
          }}>Unable to load dashboard</h1>
          <p style={{
            color: "#94a3b8",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 28,
          }}>
            We couldn&apos;t load your dashboard data. This is usually a temporary issue.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: 0,
                borderRadius: 8,
                padding: "12px 22px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: 0,
                borderRadius: 8,
                padding: "12px 22px",
                background: "#f1f5f9",
                color: "#1d4ed8",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
