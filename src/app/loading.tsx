export default function Loading() {
  return (
    <div style={{
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 800,
          margin: "0 auto 20px",
          boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
          animation: "pulse 2s ease-in-out infinite",
        }}>IG</div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  );
}
