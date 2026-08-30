import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import Topbar from "@/components/topbar";
import SettingsPage from "@/components/profile-settings";
import { customerNav } from "@/lib/nav";

const NAV = customerNav("/dashboard/settings");

export default async function DashboardSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <Topbar links={NAV} role="customer" />
      <main className="container settings-container">
        <div style={{ marginBottom: 32 }}>
          <h1>Settings</h1>
          <p className="muted" style={{ marginTop: 4 }}>Manage your profile information.</p>
        </div>
        <SettingsPage
          initialName={user.name}
          initialUsername={user.username}
          initialAvatarUrl={user.avatarUrl}
          initialEmail={user.email}
          role={user.role}
        />
      </main>
      <footer className="footer">Inland Green Bank &mdash; Member FDIC. Equal Housing Lender.</footer>
    </>
  );
}
