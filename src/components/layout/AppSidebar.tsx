import {
  LayoutDashboard, Users, Building2, ClipboardList, Package,
  UserCog, CalendarDays, Stethoscope, FlaskConical, Scan,
  Pill, BedDouble, Receipt, BarChart3, Settings, Heart
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
];

const clinicalNav = [
  { title: 'Patients', url: '/patients', icon: Heart, placeholder: true },
  { title: 'Appointments', url: '/appointments', icon: CalendarDays, placeholder: true },
  { title: 'OPD', url: '/opd', icon: Stethoscope, placeholder: true },
  { title: 'IPD', url: '/ipd', icon: BedDouble, placeholder: true },
  { title: 'Doctors & Staff', url: '/users?filter=doctor', icon: Users },
  { title: 'Departments', url: '/departments', icon: Building2 },
];

const supportNav = [
  { title: 'Laboratory', url: '/laboratory', icon: FlaskConical, placeholder: true },
  { title: 'Radiology', url: '/radiology', icon: Scan, placeholder: true },
  { title: 'Pharmacy', url: '/pharmacy', icon: Pill, placeholder: true },
  { title: 'Billing', url: '/billing', icon: Receipt, placeholder: true },
  { title: 'Reports', url: '/reports', icon: BarChart3, placeholder: true },
];

const managementNav = [
  { title: 'Task Management', url: '/tasks', icon: ClipboardList },
  { title: 'Inventory', url: '/inventory', icon: Package },
];

const adminNav = [
  { title: 'User Management', url: '/users', icon: UserCog },
  { title: 'Settings', url: '/settings', icon: Settings, placeholder: true },
];

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: boolean;
}

const NavGroup = ({ label, items, collapsed }: { label: string; items: NavItem[]; collapsed: boolean }) => {
  const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url || location.pathname.startsWith(item.url.split('?')[0] + '/');
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.url === '/dashboard'}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/50 ${
                      item.placeholder ? 'opacity-50 cursor-not-allowed' : ''
                    } ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm' : 'text-sidebar-foreground'}`}
                    activeClassName=""
                    onClick={item.placeholder ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                    {!collapsed && item.placeholder && (
                      <span className="ml-auto text-[10px] rounded bg-sidebar-accent px-1.5 py-0.5">Soon</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { isAdmin } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Heart className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold text-sidebar-foreground">HMIS</span>
        )}
      </div>
      <SidebarContent className="px-2 py-2">
        <NavGroup label="Main" items={mainNav} collapsed={collapsed} />
        <NavGroup label="Clinical" items={clinicalNav} collapsed={collapsed} />
        <NavGroup label="Support" items={supportNav} collapsed={collapsed} />
        <NavGroup label="Management" items={managementNav} collapsed={collapsed} />
        {isAdmin && <NavGroup label="Admin" items={adminNav} collapsed={collapsed} />}
      </SidebarContent>
    </Sidebar>
  );
}
