import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import Topbar from "@/components/topbar";
import { adminNav } from "@/lib/nav";
import ReconciliationClient from "./reconciliation-client";

const ADMIN_NAV = adminNav("/admin/reconciliation");

export default async function AdminReconciliationPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <Topbar links={ADMIN_NAV} role="admin" />
      <main className="container">
        <div style={{ marginBottom: 32 }}>
          <h1>Reconciliation</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Run system-wide reconciliation to verify ledger integrity across all accounts.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 12 }}>System reconciliation</h2>
          <p className="muted" style={{ marginBottom: 18 }}>
            This will check every account&apos;s cached balance against the authoritative ledger,
            scan for orphaned entries, duplicate references, and unbalanced transactions.
          </p>
          <ReconciliationClient />
        </div>

        <div className="card">
          <h2 style={{ marginBottom: 12 }}>What gets checked</h2>
          <div className="detail-grid" style={{ gap: 12 }}>
            <div className="detail-row">
              <span className="detail-label">Balance consistency</span>
              <span className="detail-value">Cached balance matches ledger-derived balance</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Orphan entries</span>
              <span className="detail-value">Ledger entries without a valid transaction link</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Duplicate references</span>
              <span className="detail-value">Multiple transactions sharing the same reference</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Unbalanced transactions</span>
              <span className="detail-value">Ledger transactions where debits do not equal credits</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">Inland Green Bank &mdash; Admin Console</footer>
    </>
  );
}
