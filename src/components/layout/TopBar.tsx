import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Clock, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import GlobalSearch from '@/components/GlobalSearch';
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
  '/patients': 'Patients',
  '/patients/create': 'Add Patient',
  '/appointments': 'Appointments',
  '/appointments/create': 'New Appointment',
  '/laboratory': 'Laboratory',
  '/laboratory/create': 'New Test Order',
  '/pharmacy': 'Pharmacy',
  '/pharmacy/create': 'Add Medicine',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/opd': 'OPD',
  '/ipd': 'IPD',
  '/radiology': 'Radiology',
  '/billing': 'Billing',
  '/knowledge': 'Knowledge Base',
  '/knowledge/create': 'New Article',
  '/wiki': 'Internal Wiki',
  '/documents': 'Document Management',
};

export function TopBar() {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle = routeTitles[location.pathname] ||
    (location.pathname.includes('/edit') ? 'Edit' : 'HMIS');

  const toggleDarkMode = () => {
    updateSettings('darkMode', !settings.darkMode);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card px-4 shadow-sm">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="flex-1 flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground flex-1">{pageTitle}</h2>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
          <Clock className="h-3.5 w-3.5" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Dark/Light Mode Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          className="text-muted-foreground hover:text-foreground"
          title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {settings.darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-medium">
            {user?.name?.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-red-600">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

