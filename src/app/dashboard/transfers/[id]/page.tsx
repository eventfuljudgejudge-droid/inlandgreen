import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/topbar";
import { customerNav } from "@/lib/nav";
import StatusBadge from "@/components/status-badge";
import { formatMoney } from "@/lib/money";
import { formatDateTime, maskAccountNumber } from "@/lib/display";

const NAV = customerNav("/dashboard/transactions");

export default async function TransferDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const transfer = await prisma.transfer.findUnique({
    where: { id },
    include: {
      senderAccount: { select: { id: true, accountNumber: true, type: true, userId: true } },
      recipientAccount: { select: { id: true, accountNumber: true, type: true, userId: true } },
    },
  });
  if (!transfer) notFound();
  const isInternational = transfer.type === "INTERNATIONAL";

  if (user.role !== "ADMIN") {
    const isSender = transfer.senderAccount.userId === user.id;
    const isRecipient = transfer.recipientAccount?.userId === user.id;
    if (!isSender && !isRecipient) notFound();
  }

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container">
        <Link href="/dashboard" className="muted" style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
          &larr; Overview
        </Link>

        <h1>Transfer details</h1>

        <div className="card" style={{ maxWidth: 600, marginTop: 20 }}>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">Status</div>
              <div><StatusBadge status={transfer.status} /></div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Reference</div>
              <div className="mono detail-value">{transfer.reference}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Amount</div>
              <div className="balance" style={{ fontSize: 28, marginTop: 4 }}>{formatMoney(transfer.amountCents)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 8, borderTop: "1px solid var(--border-light)" }}>
              <div className="detail-row">
                <div className="detail-label">From</div>
                <div className="detail-value">{transfer.senderAccount.type === "CHECKING" ? "Checking" : "Savings"}</div>
                <div className="mono muted" style={{ fontSize: 12 }}>{maskAccountNumber(transfer.senderAccount.accountNumber)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">To</div>
                {isInternational ? (
                  <>
                    <div className="detail-value">{transfer.recipientName || "External recipient"}</div>
                    {transfer.recipientIban && <div className="mono muted" style={{ fontSize: 12 }}>IBAN {transfer.recipientIban}</div>}
                    {transfer.recipientBic && <div className="mono muted" style={{ fontSize: 12 }}>BIC {transfer.recipientBic}</div>}
                    {transfer.recipientBankName && <div className="mono muted" style={{ fontSize: 12 }}>{transfer.recipientBankName}</div>}
                  </>
                ) : (
                  <>
                    <div className="detail-value">{transfer.recipientAccount?.type === "CHECKING" ? "Checking" : "Savings"}</div>
                    <div className="mono muted" style={{ fontSize: 12 }}>{transfer.recipientAccount ? maskAccountNumber(transfer.recipientAccount.accountNumber) : "—"}</div>
                  </>
                )}
              </div>
            </div>
            {isInternational && transfer.convertedAmountCents && transfer.recipientCurrency && transfer.currency !== transfer.recipientCurrency && (
              <div className="detail-row">
                <div className="detail-label">FX applied</div>
                <div className="detail-value">
                  {formatMoney(transfer.amountCents, transfer.currency)}{" "}&rarr;{" "}
                  {formatMoney(transfer.convertedAmountCents, transfer.recipientCurrency)}
                  {transfer.fxRate && <span className="muted" style={{ marginLeft: 6 }}>(rate {transfer.fxRate.toString()})</span>}
                </div>
              </div>
            )}
            {transfer.description && (
              <div className="detail-row">
                <div className="detail-label">Description</div>
                <div className="detail-value">{transfer.description}</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">Created</div>
              <div className="detail-value">{formatDateTime(transfer.createdAt)}</div>
            </div>
            {transfer.completedAt && (
              <div className="detail-row">
                <div className="detail-label">Completed</div>
                <div className="detail-value">{formatDateTime(transfer.completedAt)}</div>
              </div>
            )}
            {transfer.failureReason && (
              <div className="detail-row">
                <div className="detail-label">Failure reason</div>
                <div className="notice notice-error" style={{ marginBottom: 0 }}>{transfer.failureReason}</div>
              </div>
            )}
            {transfer.blockedReason && (
              <div className="detail-row">
                <div className="detail-label">Blocked reason</div>
                <div className="notice notice-warn" style={{ marginBottom: 0 }}>{transfer.blockedReason}</div>
              </div>
            )}
            {transfer.reversalReason && (
              <div className="detail-row">
                <div className="detail-label">Reversal reason</div>
                <div className="notice notice-error" style={{ marginBottom: 0 }}>{transfer.reversalReason}</div>
              </div>
            )}
            {transfer.reversalReference && (
              <div className="detail-row">
                <div className="detail-label">Reversal reference</div>
                <div className="mono detail-value">{transfer.reversalReference}</div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
    </>
  );
}
