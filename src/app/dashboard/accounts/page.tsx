import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { withRls } from "@/lib/rls";
import Topbar from "@/components/topbar";
import { customerNav } from "@/lib/nav";
import StatusBadge from "@/components/status-badge";
import { formatMoney } from "@/lib/money";
import { maskAccountNumber } from "@/lib/display";
import CreateAccountForm from "./create-form";

const NAV = customerNav("/dashboard/accounts");

export default async function AccountsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { accounts, total } = await withRls(user.id, async (tx) => {
    const accounts = await tx.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const total = accounts.reduce((sum, a) => sum + a.balanceCents, 0n);

    return { accounts, total };
  });

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 32 }}>
          <div>
            <h1>Accounts</h1>
            <p className="muted" style={{ marginTop: 4 }}>
              Total balance: <strong style={{ color: "var(--slate-800)" }}>{formatMoney(total)}</strong>
            </p>
          </div>
        </div>

        <div className="grid">
          {accounts.length === 0 ? (
            <div className="card empty">No accounts yet. Create one below to get started.</div>
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

        <div className="section">
          <div className="section-title">
            <h2>Open a new account</h2>
          </div>
          <div className="card" style={{ maxWidth: 520 }}>
            <CreateAccountForm />
          </div>
        </div>
      </main>
      <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
    </>
  );
}
