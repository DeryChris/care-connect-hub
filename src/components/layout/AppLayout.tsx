// src/components/layout/AppLayout.tsx
// Reads `initialising` from AuthContext.
// Shows a spinner while the /auth/refresh call is in-flight.
// Only redirects to /login AFTER initialising is false AND user is null.
// This is what prevents the flash-to-login on hard page refresh.

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const { isAuthenticated, initialising } = useAuth();

  // Session check in progress — show a full-screen spinner.
  // Without this, isAuthenticated is false for ~200ms and we'd redirect.
  if (initialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 no-theme-transition animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading Care Connect Hub…</p>
        </div>
      </div>
    );
  }

  // Session check done — no valid session found.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t border-border bg-card px-4 py-3">
            <div className="flex flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
              <span>Care Connect Hub v1.0 — Hospital & Knowledge Management System</span>
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