import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/topbar";
import { adminNav } from "@/lib/nav";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

const ADMIN_NAV = adminNav("/admin");

export default async function AdminDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [totalAccounts, totalUsers, totalTransactions, totalTransfers, accounts] = await Promise.all([
    prisma.account.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.transaction.count(),
    prisma.transfer.count(),
    prisma.account.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const totalBalance = await prisma.account.aggregate({ _sum: { balanceCents: true } });
  const balance = totalBalance._sum.balanceCents ?? 0n;

  return (
    <>
      <Topbar links={ADMIN_NAV} role="admin" />
      <main className="container">
        <div style={{ marginBottom: 32 }}>
          <h1>Admin Dashboard</h1>
          <p className="muted" style={{ marginTop: 4 }}>System overview and management.</p>
        </div>

        <div className="grid" style={{ marginBottom: 36 }}>
          <div className="card stat-card">
            <div className="stat-label">Total balance</div>
            <div className="stat-value">{formatMoney(balance)}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Customers</div>
            <div className="stat-value">{totalUsers}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Accounts</div>
            <div className="stat-value">{totalAccounts}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{totalTransactions}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Transfers</div>
            <div className="stat-value">{totalTransfers}</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            <h2>Quick actions</h2>
          </div>
          <div className="grid">
            <Link href="/admin/accounts" className="card" style={{ textDecoration: "none" }}>
              <h2 style={{ marginBottom: 6 }}>Manage accounts</h2>
              <p className="muted">Fund, debit, freeze, or unfreeze customer accounts.</p>
            </Link>
            <Link href="/admin/transfers" className="card" style={{ textDecoration: "none" }}>
              <h2 style={{ marginBottom: 6 }}>Review transfers</h2>
              <p className="muted">Block or reverse transfers as needed.</p>
            </Link>
            <Link href="/admin/reconciliation" className="card" style={{ textDecoration: "none" }}>
              <h2 style={{ marginBottom: 6 }}>Reconciliation</h2>
              <p className="muted">Run system-wide balance reconciliation checks.</p>
            </Link>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            <h2>Recent accounts</h2>
            <Link href="/admin/accounts" className="btn secondary" style={{ fontSize: 13, padding: "7px 14px" }}>View all</Link>
          </div>
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Number</th>
                  <th>Status</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/admin/accounts/${a.id}`} style={{ color: "var(--blue-600)", fontWeight: 600 }}>
                        {a.nickname || (a.type === "CHECKING" ? "Checking" : "Savings")}
                      </Link>
                    </td>
                    <td className="mono muted" style={{ fontSize: 12 }}>{a.accountNumber}</td>
                    <td><span className={`badge badge-${a.status === "ACTIVE" || a.status === "RECEIVE_ONLY" ? "ok" : a.status === "FROZEN" ? "warn" : "muted"}`}>{a.status === "RECEIVE_ONLY" ? "ACTIVE" : a.status}</span></td>
                    <td className="text-right mono" style={{ fontWeight: 700 }}>{formatMoney(a.balanceCents, a.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <footer className="footer">Inland Green Bank &mdash; Admin Console</footer>
    </>
  );
}
