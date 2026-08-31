import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { RLS_SERVICE, withRls } from "@/lib/rls";
import Topbar from "@/components/topbar";
import { adminNav } from "@/lib/nav";
import Amount from "@/components/amount";
import { formatDateTime, maskAccountNumber } from "@/lib/display";
import TransactionFilters from "./transaction-filters";

const ADMIN_NAV = adminNav("/admin/transactions");

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.type) where.type = params.type;
  if (params.status) where.status = params.status;

  const transactions = await withRls(RLS_SERVICE, (tx) =>
    tx.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { account: { select: { accountNumber: true, userId: true } } },
    })
  );

  return (
    <>
      <Topbar links={ADMIN_NAV} role="admin" />
      <main className="container">
        <div style={{ marginBottom: 32 }}>
          <h1>Transactions</h1>
          <p className="muted" style={{ marginTop: 4 }}>All system transactions across every account.</p>
        </div>

        <TransactionFilters
          currentType={params.type}
          currentStatus={params.status}
        />

        <div className="section">
          <div className="card table-wrap">
            {transactions.length === 0 ? (
              <div className="empty">No transactions found.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Account</th>
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
                      <td className="mono muted" style={{ fontSize: 12 }}>{maskAccountNumber(t.account?.accountNumber ?? "")}</td>
                      <td><span className="badge badge-accent">{t.type}</span></td>
                      <td><span className={`badge badge-${t.status === "COMPLETED" ? "ok" : t.status === "FAILED" ? "danger" : "warn"}`}>{t.status}</span></td>
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
