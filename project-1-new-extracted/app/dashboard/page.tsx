import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
        <Sidebar />
        <div className="flex-1">
          <Dashboard />
        </div>
      </div>
    </main>
  );
}
