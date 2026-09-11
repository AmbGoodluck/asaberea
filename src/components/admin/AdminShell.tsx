"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminProvider";

const tabs = [
  { href: "/admin", label: "Overview", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" },
  { href: "/admin/events", label: "Events", icon: "M7 2v3m10-3v3M3 9h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" },
  { href: "/admin/stats", label: "Stats", icon: "M4 20V10m6 10V4m6 16v-6m4 6H2" },
  { href: "/admin/spotlight", label: "Spotlight", icon: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 21l-4.9-2.8.9-5.5-4-3.9L9.5 8z" },
  { href: "/admin/leadership", label: "Leadership", icon: "M16 11a4 4 0 10-8 0M4 20a8 8 0 0116 0" },
  { href: "/admin/images", label: "Images", icon: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5" },
  { href: "/admin/inbox", label: "Inbox", icon: "M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" },
];

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="a-gate">
      <div className="a-gate-card">
        <span className="logo-mark" aria-hidden />
        {children}
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { status, email, signIn, signOut } = useAdmin();
  const pathname = usePathname();

  if (status === "no-backend") {
    return (
      <Gate>
        <h1>Portal not connected yet</h1>
        <p>The admin portal isn&apos;t hooked up to the website&apos;s account yet.</p>
        <div className="a-note">Ask your webmaster to finish the setup, then come back and sign in here.</div>
      </Gate>
    );
  }
  if (status === "loading") {
    return <Gate><h1>Loading...</h1></Gate>;
  }
  if (status === "signed-out") {
    return (
      <Gate>
        <h1>ASA Admin</h1>
        <p>Sign in with an authorized Google account to manage the website.</p>
        <button className="a-btn primary" onClick={signIn}>Sign in with Google</button>
      </Gate>
    );
  }
  if (status === "not-admin") {
    return (
      <Gate>
        <h1>Access restricted</h1>
        <p>The account {email} is not on the admin list. Ask an existing admin to add you.</p>
        <button className="a-btn ghost" onClick={signOut}>Sign out</button>
      </Gate>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand">
          <span className="logo-mark" aria-hidden />
          <b>ASA Admin</b>
        </div>
        <nav className="admin-nav">
          {tabs.map((t) => {
            const on = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={on ? "on" : ""}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="foot">
          <div className="who">{email}</div>
          <button className="a-btn ghost sm" onClick={signOut}>Sign out</button>
          <div style={{ marginTop: 12 }}>
            <Link href="/" className="a-btn ghost sm">View site</Link>
          </div>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
