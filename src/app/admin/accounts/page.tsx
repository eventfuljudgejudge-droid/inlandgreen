import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { RLS_SERVICE, withRls } from "@/lib/rls";
import Topbar from "@/components/topbar";
import { adminNav } from "@/lib/nav";
import { formatMoney } from "@/lib/money";
import { maskAccountNumber } from "@/lib/display";
import CreateCustomerSection from "./create-customer-section";

const ADMIN_NAV = adminNav("/admin/accounts");

export default async function AdminAccountsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const accounts = await withRls(RLS_SERVICE, (tx) =>
    tx.account.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    })
  );

  return (
    <>
      <Topbar links={ADMIN_NAV} role="admin" />
      <main className="container">
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>Accounts</h1>
            <p className="muted" style={{ marginTop: 4 }}>{accounts.length} accounts total</p>
          </div>
          <CreateCustomerSection />
        </div>

        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Nickname</th>
                <th>Account number</th>
                <th>Type</th>
                <th>Status</th>
                <th className="text-right">Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.user.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{a.user.email}</div>
                  </td>
                  <td>{a.nickname || "—"}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{maskAccountNumber(a.accountNumber)}</td>
                  <td><span className={`badge badge-${a.type === "CHECKING" ? "accent" : "ok"}`}>{a.type}</span></td>
                  <td><span className={`badge badge-${a.status === "ACTIVE" || a.status === "RECEIVE_ONLY" ? "ok" : a.status === "FROZEN" ? "warn" : "muted"}`}>{a.status === "RECEIVE_ONLY" ? "ACTIVE" : a.status}</span></td>
                  <td className="text-right mono" style={{ fontWeight: 700 }}>{formatMoney(a.balanceCents, a.currency)}</td>
                  <td>
                    <Link href={`/admin/accounts/${a.id}`} className="btn secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <footer className="footer">Inland Green Bank &mdash; Admin Console</footer>
    </>
  );
}
