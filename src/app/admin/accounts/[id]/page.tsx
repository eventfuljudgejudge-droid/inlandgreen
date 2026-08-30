import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/topbar";
import { adminNav } from "@/lib/nav";
import StatusBadge from "@/components/status-badge";
import Amount from "@/components/amount";
import { formatMoney } from "@/lib/money";
import { formatDateTime, maskAccountNumber } from "@/lib/display";
import { formatIban } from "@/lib/references";
import FundForm from "./fund-form";
import DebitForm from "./debit-form";
import FreezeForm from "./freeze-form";
import ReconcileForm from "./reconcile-form";

const ADMIN_NAV = adminNav("/admin/accounts");

export default async function AdminAccountDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const account = await prisma.account.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!account) notFound();

  const transactions = await prisma.transaction.findMany({
    where: { accountId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <>
      <Topbar links={ADMIN_NAV} role="admin" />
      <main className="container">
        <Link href="/admin/accounts" className="muted" style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
          &larr; All accounts
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 28 }}>
          <div>
            <h1>{account.nickname || (account.type === "CHECKING" ? "Checking Account" : "Savings Account")}</h1>
            <p className="mono muted" style={{ marginTop: 4, fontSize: 13 }}>{account.accountNumber}</p>
            {account.iban && (
              <p className="mono muted" style={{ marginTop: 2, fontSize: 13 }}>IBAN: {formatIban(account.iban)} · BIC: {account.bic || "—"}</p>
            )}
            <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
              Owner: <strong style={{ color: "var(--slate-700)" }}>{account.user.name}</strong> ({account.user.email})
            </p>
          </div>
          <StatusBadge status={account.status} />
        </div>

        <div className="grid" style={{ marginBottom: 28 }}>
          <div className="card stat-card">
            <div className="stat-label">Available balance</div>
            <div className="stat-value">{formatMoney(account.balanceCents, account.currency)}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Account type</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{account.type}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Currency</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{account.currency}</div>
          </div>
        </div>

        <div className="grid" style={{ marginBottom: 36 }}>
          <div className="card">
            <h2 style={{ marginBottom: 14 }}>Fund account</h2>
            <p className="muted" style={{ marginBottom: 14 }}>Credit funds to this account.</p>
            <FundForm accountId={account.id} currency={account.currency} />
          </div>
          <div className="card">
            <h2 style={{ marginBottom: 14 }}>Debit account</h2>
            <p className="muted" style={{ marginBottom: 14 }}>Debit funds from this account.</p>
            <DebitForm accountId={account.id} balanceCents={account.balanceCents} currency={account.currency} />
          </div>
        </div>

        <div className="grid" style={{ marginBottom: 36 }}>
          <div className="card">
            <h2 style={{ marginBottom: 14 }}>
              {account.status === "FROZEN"
                ? "Unfreeze account"
                : account.status === "RECEIVE_ONLY"
                  ? "Manage account status"
                  : "Freeze account"}
            </h2>
            <p className="muted" style={{ marginBottom: 14 }}>
              {account.status === "FROZEN"
                ? "Restore this account to active status."
                : account.status === "RECEIVE_ONLY"
                  ? "This account can receive funds but cannot send money."
                  : "Prevent all activity on this account."}
            </p>
            <FreezeForm accountId={account.id} currentStatus={account.status} />
          </div>
          <div className="card">
            <h2 style={{ marginBottom: 14 }}>Reconcile balance</h2>
            <p className="muted" style={{ marginBottom: 14 }}>Repair the cached balance to match the authoritative ledger.</p>
            <ReconcileForm accountId={account.id} />
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            <h2>Transaction history</h2>
          </div>
          <div className="card table-wrap">
            {transactions.length === 0 ? (
              <div className="empty">No transactions on this account yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="muted" style={{ whiteSpace: "nowrap" }}>{formatDateTime(t.createdAt)}</td>
                      <td className="mono muted" style={{ fontSize: 11 }}>{t.reference}</td>
                      <td>
                        {t.description}
                        {t.failureReason && (
                          <span className="muted" style={{ display: "block", fontSize: 11 }}>{t.failureReason}</span>
                        )}
                      </td>
                      <td><StatusBadge status={t.type} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="text-right">
                        <Amount type={t.type} cents={t.amountCents} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <footer className="footer">Inland Green Bank &mdash; Admin Console</footer>
    </>
  );
}
