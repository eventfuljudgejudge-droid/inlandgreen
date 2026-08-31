"use client";

import { useState } from "react";
import { toast } from "sonner";
import { convertFx, currencyFromIban } from "@/lib/ledger/fx.config";

type AccountInfo = {
  id: string;
  accountNumber: string;
  iban: string;
  type: string;
  nickname: string | null;
  currency: string;
  status: string;
  balanceCents: string;
};

type RecipientInfo = {
  accountId: string;
  accountNumber: string;
  iban: string;
  bic: string;
  type: string;
  currency: string;
  holderName: string | null;
  frozen: boolean;
};

const BANK_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Inland Green Bank";

function normalizeIban(v: string) {
  return v.replace(/[\s-]/g, "").toUpperCase();
}

export default function TransferForm({ accounts }: { accounts: AccountInfo[] }) {
  const [transferType, setTransferType] = useState<"LOCAL" | "INTERNATIONAL">("LOCAL");
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? "");
  const [recipientName, setRecipientName] = useState("");
  const [recipientIban, setRecipientIban] = useState("");
  const [recipientBic, setRecipientBic] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [recipientCurrency, setRecipientCurrency] = useState("EUR");
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [recipientStatus, setRecipientStatus] = useState<"idle" | "checking" | "local" | "external" | "error">("idle");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.id === fromAccountId);
  const selectedCurrency = selectedAccount?.currency ?? "EUR";

  async function verifyRecipient() {
    const iban = normalizeIban(recipientIban);
    if (!fsm(/^[A-Z]{2}\d{2}[A-Z0-9]{6,}$/.test(iban))) return;
    setRecipientStatus("checking");
    setRecipient(null);
    setError(null);
    try {
      const res = await fetch(`/api/recipients/${encodeURIComponent(iban)}`);
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 404) {
          setRecipientStatus("external");
        } else {
          setRecipientStatus("error");
          setError(data.message || "Could not verify recipient.");
        }
        return;
      }
      const data = await res.json();
      setRecipient(data.recipient);
      setRecipientStatus("local");
      if (!recipientName.trim() && data.recipient.holderName) {
        setRecipientName(data.recipient.holderName);
      }
      if (!recipientBank.trim()) {
        setRecipientBank(BANK_NAME);
      }
    } catch {
      setRecipientStatus("error");
      setError("Could not verify recipient.");
    }
  }

  function fsm(ok: boolean) {
    if (!ok) {
      setRecipientStatus("error");
      setError("The IBAN you entered does not look valid.");
      return false;
    }
    return true;
  }

  function onIbanChange(v: string) {
    setRecipientIban(v);
    setRecipientStatus("idle");
    setRecipient(null);
    // Auto-detect destination currency from the IBAN country for international wire.
    const detected = currencyFromIban(normalizeIban(v));
    if (detected) setRecipientCurrency(detected);
  }

  function switchType(t: "LOCAL" | "INTERNATIONAL") {
    setTransferType(t);
    setRecipientStatus("idle");
    setRecipient(null);
    setError(null);
  }

  const fxPreview =
    transferType === "INTERNATIONAL" &&
    selectedCurrency !== recipientCurrency &&
    recipientCurrency &&
    amount.trim() &&
    /^\d+(\.\d{1,2})?$/.test(amount.trim())
      ? convertFx(selectedCurrency, recipientCurrency, BigInt(Math.round(parseFloat(amount) * 100)))
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (transferType === "LOCAL" && recipientStatus !== "local") {
      setError("Please verify the recipient first. We only support local transfers to Inland Green Bank accounts.");
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transferType,
          senderAccountId: fromAccountId,
          recipientIban: normalizeIban(recipientIban),
          recipientName: recipientName.trim(),
          recipientBic: normalizeIban(recipientBic),
          recipientBankName: recipientBank.trim() || undefined,
          recipientCurrency: transferType === "INTERNATIONAL" ? recipientCurrency : undefined,
          amount: amount.trim(),
          description: description.trim() || undefined,
          idempotencyKey,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const err = new Error(data.message || "Transfer failed.");
        (err as any).code = data.error;
        throw err;
      }
      setSuccess(transferType === "INTERNATIONAL" ? "International transfer sent successfully." : "Transfer completed successfully.");
      toast.success("Transfer sent", {
        description: transferType === "INTERNATIONAL" ? "International transfer completed successfully." : "Your transfer completed successfully.",
      });
      setAmount("");
      setDescription("");
      setRecipientIban("");
      setRecipientBic("");
      setRecipientBank("");
      setRecipientName("");
      setRecipient(null);
      setRecipientStatus("idle");
    } catch (err: any) {
      const code = err?.code;
      let friendly = err?.message || "Transfer failed. Please try again.";
      if (code === "ACCOUNT_FROZEN" || code === "RECEIVE_ONLY") {
        friendly = "Transfer failed. Your account is currently restricted — kindly reach the bank to resolve this before sending money.";
      } else if (code === "ACCOUNT_CLOSED") {
        friendly = "Transfer failed. This account is closed and cannot send money — kindly reach the bank.";
      } else if (code === "INSUFFICIENT_FUNDS") {
        friendly = "Transfer failed. You do not have enough funds for this transaction.";
      }
      setError(friendly);
      toast.error("Transfer failed", { description: friendly });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="notice notice-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="notice notice-info" style={{ marginBottom: 12 }}>{success}</div>}

      <div style={{ marginBottom: 16 }}>
        <div className="stat-label" style={{ marginBottom: 6 }}>Transfer type</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["LOCAL", "INTERNATIONAL"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchType(t)}
              className={transferType === t ? "btn" : "btn secondary"}
              style={{ flex: 1, padding: "10px 8px", fontSize: 13, fontWeight: 700 }}
            >
              {t === "LOCAL" ? "Local" : "International"}
            </button>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 6, fontSize: 12.5 }}>
          {transferType === "LOCAL"
            ? "Send to another Inland Green Bank account (verified recipient, same currency)."
            : "Send money to an account at another bank as a SWIFT wire transfer."}
        </div>
      </div>

      <div className="form" style={{ gap: 16 }}>
        <label>From account</label>
        <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nickname || (a.type === "CHECKING" ? "Checking" : "Savings")} — •••• {a.accountNumber.slice(-4)} ({a.currency}){a.status !== "ACTIVE" ? ` — ${a.status.replace(/_/g, " ")}` : ""}
            </option>
          ))}
        </select>

        {transferType === "INTERNATIONAL" && (
          <div className="notice notice-info" style={{ fontSize: 13, padding: "12px 14px" }}>
            <strong>SWIFT / international transfer</strong>
            <div style={{ marginTop: 4 }}>
              Your {selectedCurrency} account will be debited. The recipient&apos;s bank receives the converted amount.
            </div>
          </div>
        )}

        <div style={{ marginTop: 8, fontWeight: 700, color: "var(--slate-700)", fontSize: 14 }}>Recipient details</div>

        <label>
          Recipient name / payee
          <input
            type="text"
            placeholder="e.g. William Lee"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
            maxLength={100}
          />
        </label>

        <label>
          Recipient IBAN
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="e.g. DE26 IGB0 0000 3947 3304 48"
              value={recipientIban}
              onChange={(e) => onIbanChange(e.target.value)}
              onBlur={transferType === "LOCAL" ? verifyRecipient : undefined}
              required
              inputMode="text"
              style={{ flex: 1 }}
            />
            {transferType === "LOCAL" && (
              <button
                type="button"
                className="btn secondary"
                onClick={verifyRecipient}
                disabled={recipientStatus === "checking" || !recipientIban.trim()}
                style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: 13 }}
              >
                {recipientStatus === "checking" ? "Checking..." : "Verify"}
              </button>
            )}
          </div>
        </label>

        {transferType === "LOCAL" && recipientStatus === "local" && recipient && (
          <div className="notice notice-info" style={{ fontSize: 13, padding: "12px 14px" }}>
            <strong style={{ color: "var(--green-700)" }}>✔ Verified — Inland Green Bank account</strong>
            <div style={{ marginTop: 4 }}>
              {recipient.holderName ?? "Verified holder"} · {recipient.type} · {recipient.currency}
            </div>
            {recipient.frozen ? (
              <div style={{ marginTop: 6, color: "var(--amber-700)", fontWeight: 600 }}>
                This recipient&apos;s funds are frozen. They can receive money but cannot send it out.
              </div>
            ) : (
              <span style={{ fontSize: 12 }}>This recipient can send and receive money normally.</span>
            )}
          </div>
        )}

        {transferType === "LOCAL" && recipientStatus === "external" && (
          <div className="notice notice-error" style={{ fontSize: 13, padding: "12px 14px" }}>
            This IBAN belongs to an account at an <strong>external bank</strong>. Switch to an{" "}
            <strong>International</strong> transfer to send to external banks, or enter an Inland Green Bank IBAN.
          </div>
        )}

        <label>
          Recipient BIC / SWIFT
          <input
            type="text"
            placeholder={transferType === "LOCAL" ? "e.g. IGBNDEFF" : "e.g. NWBKGB2L"}
            value={recipientBic}
            onChange={(e) => setRecipientBic(e.target.value)}
            required
          />
        </label>

        <label>
          Recipient bank
          <input
            type="text"
            placeholder={transferType === "LOCAL" ? `e.g. ${BANK_NAME}` : "e.g. HSBC, Santander, Bank of America"}
            value={recipientBank}
            onChange={(e) => setRecipientBank(e.target.value)}
            required
            maxLength={100}
          />
        </label>

        {transferType === "INTERNATIONAL" && (
          <label>
            Destination currency
            <select value={recipientCurrency} onChange={(e) => setRecipientCurrency(e.target.value)}>
              {["EUR", "USD", "GBP"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="muted" style={{ fontSize: 12 }}>Auto-detected from the IBAN&apos;s country code — edit if needed.</span>
          </label>
        )}

        <label>
          Amount ({selectedCurrency})
          <input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            pattern="^\d+(\.\d{1,2})?$"
            title="Enter a positive amount with up to 2 decimal places"
            inputMode="decimal"
          />
        </label>

        {fxPreview && fxPreview.rate > 0 && (
          <div className="notice notice-info" style={{ fontSize: 13, padding: "12px 14px" }}>
            <strong>FX preview</strong>
            <div style={{ marginTop: 4 }}>
              ≈ {formatPreview(fxPreview.convertedCents)} {recipientCurrency} at rate 1 {selectedCurrency} = {fxPreview.rate.toFixed(4)} {recipientCurrency}
            </div>
          </div>
        )}

        <label>
          Reference (optional)
          <input
            type="text"
            placeholder="e.g. Invoice 1042"
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <button className="btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Sending..." : transferType === "INTERNATIONAL" ? "Send international transfer" : "Send transfer"}
        </button>
      </div>
    </form>
  );
}

function formatPreview(majorCents: bigint) {
  const n = Number(majorCents) / 100;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
