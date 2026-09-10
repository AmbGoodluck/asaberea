import "./admin.css";
import AdminProvider from "@/components/admin/AdminProvider";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "ASA Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <AdminProvider>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </div>
  );
}
