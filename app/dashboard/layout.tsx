import { Sidebar } from "@/components/dashboard/sidebar";
import { EnvironmentBadge } from "@/components/dashboard/environment-badge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <EnvironmentBadge />
    </div>
  );
}
