import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/topbar";
import { customerNav } from "@/lib/nav";
import { formatMoney } from "@/lib/money";
import { formatDateTime, maskAccountNumber } from "@/lib/display";
import Amount from "@/components/amount";
import StatusBadge from "@/components/status-badge";

const NAV = customerNav("/dashboard");

export default async function Dashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    where: { accountId: { in: accounts.map((a) => a.id) } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { account: { select: { accountNumber: true } } },
  });

  const total = accounts.reduce((sum, a) => sum + a.balanceCents, 0n);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container">
        <div className="hero-banner" style={{ marginBottom: 32 }}>
          <h1>{greeting()}, {user.name?.split(" ")[0]}</h1>
          <div className="hero-sub">Here&apos;s your account summary at a glance — balances, activity and quick actions.</div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-label">Total balance</div>
              <div className="hero-stat-value">{formatMoney(total)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Accounts</div>
              <div className="hero-stat-value">{accounts.length}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Recent transactions</div>
              <div className="hero-stat-value">{transactions.length}</div>
            </div>
          </div>
          <div className="hero-brands">
            <span className="hero-chip">Inland Green Bank</span>
            <span className="hero-chip">{user.role === "ADMIN" ? "Business" : "Personal"}</span>
          </div>
        </div>

        {accounts.length > 0 && (
          <div className="section" style={{ marginBottom: 36 }}>
            <div className="section-title">
              <h2>Quick actions</h2>
            </div>
            <div className="grid">
              <Link href="/dashboard/transfer" className="card" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none", color: "inherit" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius)", background: "linear-gradient(135deg, var(--blue-500), var(--blue-700))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px -3px rgba(37,99,235,0.5)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/send.svg" alt="" width={20} height={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Send money</div>
                  <div className="muted" style={{ fontSize: 13 }}>Transfer funds to another account</div>
                </div>
              </Link>
              <Link href="/dashboard/transactions" className="card" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none", color: "inherit" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius)", background: "linear-gradient(135deg, var(--red-500), var(--red-700))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px -3px rgba(220,38,38,0.5)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/receipt.svg" alt="" width={20} height={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>View activity</div>
                  <div className="muted" style={{ fontSize: 13 }}>Browse transaction history</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-title">
            <h2>Your accounts</h2>
            <Link href="/dashboard/accounts" className="btn secondary" style={{ fontSize: 13, padding: "7px 14px" }}>View all</Link>
          </div>
          <div className="grid">
            {accounts.length === 0 ? (
              <div className="card empty">No accounts yet. <Link href="/dashboard/accounts" style={{ color: "var(--blue-600)", fontWeight: 600 }}>Create one</Link></div>
            ) : (
              accounts.map((a) => (
                <Link href={`/dashboard/accounts/${a.id}`} key={a.id} className={`card account-card account-card-${a.type === "CHECKING" ? "checking" : "savings"}`}>
                  <span className="brand-chip" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/landmark.svg" alt="" width={22} height={22} />
                  </span>
                  <div className="account-card-header">
                    <span className="account-card-type">{a.nickname || (a.type === "CHECKING" ? "Checking Account" : "Savings Account")}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="account-card-currency">{a.currency}</span>
                      <StatusBadge status={a.status} />
                    </span>
                  </div>
                  <div className="account-card-number">{maskAccountNumber(a.accountNumber)}</div>
                  <div className="account-card-balance">{formatMoney(a.balanceCents, a.currency)}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="section">
            <div className="section-title">
              <h2>Recent activity</h2>
              <Link href="/dashboard/transactions" className="btn secondary" style={{ fontSize: 13, padding: "7px 14px" }}>View all</Link>
            </div>
            <div className="card table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Account</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="muted">{formatDateTime(t.createdAt)}</td>
                      <td>{t.description}</td>
                      <td className="mono muted" style={{ fontSize: 12 }}>{maskAccountNumber(t.account?.accountNumber ?? "")}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="text-right">
                        <Amount type={t.type} cents={t.amountCents} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
    </>
  );
}
