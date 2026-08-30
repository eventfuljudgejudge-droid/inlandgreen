"use client";

import { useState } from "react";

type AccountInfo = {
  id: string;
  accountNumber: string;
  type: string;
  nickname: string | null;
};

export default function StatementGenerator({ accounts }: { accounts: AccountInfo[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [from, setFrom] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [to, setTo] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [format, setFormat] = useState<"json" | "csv" | "pdf">("json");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ format, from, to });
      const res = await fetch(`/api/accounts/${accountId}/statement?${params.toString()}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to generate statement.");
      }

      if (format === "json") {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        downloadBlob(blob, `statement-${accountId}-${from}.json`);
      } else if (format === "csv") {
        const text = await res.text();
        const blob = new Blob([text], { type: "text/csv" });
        downloadBlob(blob, `statement-${accountId}-${from}.csv`);
      } else {
        const text = await res.text();
        const blob = new Blob([text], { type: "text/plain" });
        downloadBlob(blob, `statement-${accountId}-${from}.txt`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGenerate}>
      {error && <div className="notice notice-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="form" style={{ gap: 16 }}>
        <label>
          Account
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nickname || (a.type === "CHECKING" ? "Checking" : "Savings")} — {a.accountNumber}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
          </label>
          <label>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
          </label>
        </div>
        <label>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value as "json" | "csv" | "pdf")}>
            <option value="json">JSON</option>
            <option value="csv">CSV (spreadsheet)</option>
            <option value="pdf">PDF (plain text)</option>
          </select>
        </label>
        <button className="btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Generating..." : "Download statement"}
        </button>
      </div>
    </form>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
