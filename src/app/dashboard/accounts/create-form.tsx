"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateAccountForm() {
  const router = useRouter();
  const [type, setType] = useState<"CHECKING" | "SAVINGS">("CHECKING");
  const [currency, setCurrency] = useState("EUR");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          currency,
          nickname: nickname.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create account.");
      }
      toast.success("Account opened successfully.");
      setNickname("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="notice notice-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="form" style={{ gap: 16 }}>
        <label>
          Account type
          <select id="type" value={type} onChange={(e) => setType(e.target.value as "CHECKING" | "SAVINGS")}>
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
          </select>
        </label>
        <label>
          Currency
          <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </label>
        <label>
          Nickname (optional)
          <input
            id="nickname"
            type="text"
            maxLength={50}
            placeholder="e.g. Primary Checking"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={loading} style={{ maxWidth: 180 }}>
          {loading ? "Opening..." : "Open account"}
        </button>
      </div>
    </form>
  );
}
