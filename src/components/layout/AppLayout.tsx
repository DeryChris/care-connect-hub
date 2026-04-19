// src/components/layout/AppLayout.tsx
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const { isAuthenticated, initialising } = useAuth();

  if (initialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading Care Connect Hub…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      {/* overflow-x-hidden prevents horizontal scroll on mobile when sidebar slides */}
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          {/* 
            Responsive padding:
            - Mobile (default): p-3 — compact, nothing cut off
            - sm (640px+): p-4
            - md (768px+): p-6 — comfortable desktop padding
          */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t border-border bg-card px-4 py-3 shrink-0">
            <div className="flex flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
              <span className="text-center sm:text-left">Care Connect Hub v1.0 — Hospital & Knowledge Management System</span>
              <div className="flex gap-3">
                <span className="hover:text-foreground cursor-pointer">Support</span>
                <span className="hover:text-foreground cursor-pointer">Privacy</span>
                <span className="hover:text-foreground cursor-pointer">Terms</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}