import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { withRls } from "@/lib/rls";
import Topbar from "@/components/topbar";
import { customerNav } from "@/lib/nav";
import StatementGenerator from "./statement-generator";

const NAV = customerNav("/dashboard/statements");

export default async function StatementsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const accounts = await withRls(user.id, (tx) =>
    tx.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    })
  );

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container">
        <div style={{ marginBottom: 32 }}>
          <h1>Statements</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Generate and download account statements for any date range.
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="card">
            <div className="empty">No accounts yet. Create an account to generate statements.</div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ gridColumn: "span 1" }}>
              <h2 style={{ marginBottom: 18 }}>Generate statement</h2>
              <StatementGenerator accounts={accounts.map((a) => ({
                id: a.id,
                accountNumber: a.accountNumber,
                type: a.type,
                nickname: a.nickname,
              }))} />
            </div>
            <div className="card">
              <h2 style={{ marginBottom: 12 }}>About statements</h2>
              <div className="detail-grid" style={{ gap: 14 }}>
                <div className="detail-row">
                  <span className="detail-label">Available formats</span>
                  <span className="detail-value">JSON, CSV, PDF (plain text)</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Maximum date range</span>
                  <span className="detail-value">365 days</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Default range</span>
                  <span className="detail-value">Current month</span>
                </div>
              </div>
              <div className="notice notice-info" style={{ marginTop: 18 }}>
                Statements are generated from the ledger and include opening/closing balances for the selected period.
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
    </>
  );
}
