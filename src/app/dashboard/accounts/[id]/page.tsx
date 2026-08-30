import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/topbar";
import { customerNav } from "@/lib/nav";
import StatusBadge from "@/components/status-badge";
import Amount from "@/components/amount";
import { formatMoney } from "@/lib/money";
import { formatDateTime, maskAccountNumber } from "@/lib/display";
import { formatIban } from "@/lib/references";import CloseAccountForm from "./close-form";
import RenameForm from "./rename-form";

const NAV = customerNav("/dashboard/accounts");

export default async function AccountDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) notFound();
  if (account.userId !== user.id) notFound();

  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const accountName = account.nickname || (account.type === "CHECKING" ? "Checking Account" : "Savings Account");

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container">
        <Link href="/dashboard/accounts" className="muted" style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
          &larr; Accounts
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 28 }}>
          <div>
            <h1>{accountName}</h1>
            <p className="mono muted" style={{ marginTop: 4, fontSize: 13 }}>{maskAccountNumber(account.accountNumber)}</p>
            {account.iban && (
              <p className="mono muted" style={{ marginTop: 2, fontSize: 13 }}>
                IBAN: {formatIban(account.iban)}
              </p>
            )}
          </div>
          <StatusBadge status={account.status} />
        </div>

        <div className="grid" style={{ marginBottom: 28 }}>
          <div className="card stat-card">
            <div className="stat-label">Available balance</div>
            <div className="stat-value" style={{ color: account.balanceCents >= 0 ? "var(--slate-900)" : "var(--red-600)" }}>
              {formatMoney(account.balanceCents, account.currency)}
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Account type</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{account.type === "CHECKING" ? "Checking" : "Savings"}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Currency</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{account.currency}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">BIC / SWIFT</div>
            <div className="stat-value" style={{ fontSize: 16 }}>{account.bic || "—"}</div>
          </div>
        </div>

        {account.status !== "CLOSED" && (
          <div className="grid" style={{ marginBottom: 36 }}>
            <div className="card">
              <h2 style={{ marginBottom: 14 }}>Rename account</h2>
              <RenameForm accountId={account.id} currentNickname={account.nickname} />
            </div>
            <div className="card">
              <h2 style={{ marginBottom: 8 }}>Close account</h2>
              <p className="muted" style={{ marginBottom: 14 }}>
                Permanently close this account. The balance must be zero.
              </p>
              <CloseAccountForm accountId={account.id} balanceCents={account.balanceCents} />
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-title">
            <h2>Transaction history</h2>
            <Link href={`/dashboard/transactions?account=${account.id}`} className="btn secondary" style={{ fontSize: 13, padding: "7px 14px" }}>View all</Link>
          </div>
          <div className="card table-wrap">
            {transactions.length === 0 ? (
              <div className="empty">No transactions on this account yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="muted">{formatDateTime(t.createdAt)}</td>
                      <td>
                        {t.description}
                        {t.failureReason && (
                          <span className="muted" style={{ display: "block", fontSize: 12 }}>{t.failureReason}</span>
                        )}
                      </td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="text-right">
                        <Amount type={t.type} cents={t.amountCents} currency={account.currency} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
    </>
  );
}
