// Dashboard layout — shared sidebar + header across all /dashboard/* routes
import { DashboardSidebar } from "@/components/ui/DashboardSidebar";
import { DashboardHeader } from "@/components/ui/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <DashboardSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
