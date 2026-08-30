"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        margin: 0,
        padding: 24,
      }}>
        <div style={{
          maxWidth: 480,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: "48px 44px",
          boxShadow: "0 16px 32px -8px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
            margin: "0 auto 24px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}>IG</div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#0f172a",
            marginBottom: 8,
          }}>Something went wrong</h1>
          <p style={{
            color: "#94a3b8",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 28,
          }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
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
            <a
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
            </a>
          </div>
          {error.digest && (
            <p style={{
              marginTop: 20,
              fontSize: 11,
              color: "#cbd5e1",
              fontFamily: "monospace",
            }}>
              Error: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
