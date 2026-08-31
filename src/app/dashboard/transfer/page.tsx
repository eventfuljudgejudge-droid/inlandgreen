import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { withRls } from "@/lib/rls";
import Topbar from "@/components/topbar";
import { customerNav } from "@/lib/nav";
import { formatMoney } from "@/lib/money";
import TransferForm from "./transfer-form";
import { MAX_TRANSFER_AMOUNT_CENTS, DAILY_TRANSFER_LIMIT_CENTS } from "@/lib/ledger/transfer.config";

const NAV = customerNav("/dashboard/transfer");

export default async function TransferPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const accounts = await withRls(user.id, (tx) =>
    tx.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    })
  );

  const activeAccounts = accounts.filter((a) => a.status === "ACTIVE");

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container">
        <div style={{ marginBottom: 32 }}>
          <h1>Send money</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Send a local transfer to another account or an international wire to another bank.
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="card">
            <div className="empty">
              You need at least one account to send money.{" "}
              <a href="/dashboard/accounts" style={{ color: "var(--blue-600)", fontWeight: 600 }}>
                Create an account
              </a>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ gridColumn: "span 1" }}>
              <h2 style={{ marginBottom: 18 }}>Transfer details</h2>
              <TransferForm accounts={accounts.map(a => ({
                id: a.id,
                accountNumber: a.accountNumber,
                iban: a.iban ?? a.accountNumber,
                type: a.type,
                nickname: a.nickname,
                currency: a.currency,
                status: a.status,
                balanceCents: a.balanceCents.toString(),
              }))} />
            </div>

            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="stat-label">Your accounts</div>
                {accounts.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {a.nickname || (a.type === "CHECKING" ? "Checking" : "Savings")}
                        {a.status !== "ACTIVE" && (
                          <span className="status status-warn" style={{ marginLeft: 8 }}>{a.status.replace(/_/g, " ")}</span>
                        )}
                      </div>
                      <div className="mono muted" style={{ fontSize: 12 }}>{a.accountNumber}</div>
                    </div>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 14 }}>
                      {formatMoney(a.balanceCents, a.currency)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="notice notice-info">
                  <strong>Transfer limits</strong>
                  <div style={{ marginTop: 4 }}>
                    Single transfer: up to {formatMoney(MAX_TRANSFER_AMOUNT_CENTS)}<br />
                    Daily limit: {formatMoney(DAILY_TRANSFER_LIMIT_CENTS)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
    </>
  );
}
