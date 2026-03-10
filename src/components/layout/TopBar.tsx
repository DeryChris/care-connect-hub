import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/users/create': 'Add User',
  '/departments': 'Departments',
  '/tasks': 'Task Management',
  '/tasks/create': 'Add Task',
  '/inventory': 'Inventory',
  '/inventory/create': 'Add Item',
};

export function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle = routeTitles[location.pathname] ||
    (location.pathname.includes('/edit') ? 'Edit' : 'HMIS');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card px-4 shadow-sm">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="flex-1">
        <h2 className="font-display text-lg font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
          <Clock className="h-3.5 w-3.5" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
