import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { withRls } from "@/lib/rls";
import Topbar from "@/components/topbar";
import { customerNav } from "@/lib/nav";
import Amount from "@/components/amount";
import StatusBadge from "@/components/status-badge";
import { formatDateTime, maskAccountNumber } from "@/lib/display";
import TransactionFilters from "./transaction-filters";

const NAV = customerNav("/dashboard/transactions");

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; type?: string; status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const accountIds = (
    await withRls(user.id, (tx) =>
      tx.account.findMany({
        where: { userId: user.id },
        select: { id: true },
      })
    )
  ).map((a) => a.id);

  if (accountIds.length === 0) {
    return (
      <>
        <Topbar links={NAV} role="customer" />
        <main className="container">
          <h1 style={{ marginBottom: 32 }}>Activity</h1>
          <div className="card empty">No accounts or transactions yet.</div>
        </main>
        <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
      </>
    );
  }

  const where: Record<string, unknown> = { accountId: { in: accountIds } };
  if (params.account) where.accountId = params.account;
  if (params.type) where.type = params.type;
  if (params.status) where.status = params.status;

  const transactions = await withRls(user.id, (tx) =>
    tx.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { account: { select: { accountNumber: true, type: true, nickname: true, currency: true } } },
    })
  );

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container">
        <div style={{ marginBottom: 32 }}>
          <h1>Activity</h1>
          <p className="muted" style={{ marginTop: 4 }}>Your complete transaction history.</p>
        </div>

        <TransactionFilters
          currentAccount={params.account}
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
                    <th>Description</th>
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
                      <td>
                        {t.description}
                        {t.failureReason && (
                          <span className="muted" style={{ display: "block", fontSize: 11 }}>{t.failureReason}</span>
                        )}
                      </td>
                      <td className="mono muted" style={{ fontSize: 12 }}>
                        {maskAccountNumber(t.account?.accountNumber ?? "")}
                      </td>
                      <td><StatusBadge status={t.type} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="text-right">
                        <Amount type={t.type} cents={t.amountCents} currency={t.account?.currency} />
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
