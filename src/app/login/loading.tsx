export default function LoginLoading() {
  return (
    <div className="auth-page">
      <div className="auth-hero" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            margin: "0 auto 20px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            animation: "pulse 2s ease-in-out infinite",
          }}>IG</div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
        </div>
      </div>
      <div className="auth-form-side" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--slate-400)", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    </div>
  );
}
