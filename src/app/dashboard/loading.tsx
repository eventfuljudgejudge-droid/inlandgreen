export default function Loading() {
  return (
    <>
      <header style={{
        height: 62,
        background: "var(--slate-900)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 20,
      }}>
        <div style={{ width: 120, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ flex: 1 }} />
        {[80, 70, 65, 75, 60].map((w, i) => (
          <div key={i} style={{ width: w, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
        ))}
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px" }}>
        <div style={{ width: 200, height: 28, borderRadius: 6, background: "var(--slate-100)", marginBottom: 8 }} />
        <div style={{ width: 320, height: 16, borderRadius: 4, background: "var(--slate-100)", marginBottom: 36 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 36 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 100,
              borderRadius: "var(--radius-lg)",
              background: "var(--white)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
              animation: "skeleton-pulse 1.8s ease-in-out infinite",
            }} />
          ))}
        </div>
        <div style={{
          height: 300,
          borderRadius: "var(--radius-lg)",
          background: "var(--white)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
          animation: "skeleton-pulse 1.8s ease-in-out infinite",
        }} />
      </main>
      <style>{`@keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </>
  );
}
