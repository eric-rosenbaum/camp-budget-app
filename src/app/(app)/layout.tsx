import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { requireUser } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar
        userEmail={user.email}
        userName={user.user_metadata?.name}
      />
      <main className="flex-1 overflow-auto">
        <div className="flex items-center gap-2 border-b px-4 py-2 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-medium">Camp Budgeting</span>
        </div>
        <div className="p-6">{children}</div>
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
