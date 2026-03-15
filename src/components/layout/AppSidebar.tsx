import {
  LayoutDashboard, Users, Building2, ClipboardList, Package,
  UserCog, CalendarDays, Stethoscope, FlaskConical, Scan,
  Pill, BedDouble, Receipt, BarChart3, Settings, Heart, BookOpen, FileText
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  useSidebar,
  LayoutDashboard,
  Users,
  Calendar,
  FlaskConical,
  Pill,
  FileText,
  Settings,
  Building,
  ClipboardList,
  Boxes,
  Book,
  File,
  BadgeCheck,
  GitPullRequest,
} from "lucide-react";

const mainNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
];

const clinicalNav = [
  { title: 'Patients', url: '/patients', icon: Heart },
  { title: 'Appointments', url: '/appointments', icon: CalendarDays },
  { title: 'OPD', url: '/opd', icon: Stethoscope },
  { title: 'IPD', url: '/ipd', icon: BedDouble },
  { title: 'Doctors & Staff', url: '/users?filter=doctor', icon: Users },
  { title: 'Departments', url: '/departments', icon: Building2 },
];

const supportNav = [
  { title: 'Laboratory', url: '/laboratory', icon: FlaskConical },
  { title: 'Radiology', url: '/radiology', icon: Scan },
  { title: 'Pharmacy', url: '/pharmacy', icon: Pill },
  { title: 'Billing', url: '/billing', icon: Receipt },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
];

const managementNav = [
  { title: 'Task Management', url: '/tasks', icon: ClipboardList },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Documents', url: '/documents', icon: FileText },
  { title: 'Knowledge Base', url: '/knowledge', icon: BookOpen },
];

const adminNav = [
  { title: 'User Management', url: '/users', icon: UserCog },
  { title: 'Settings', url: '/settings', icon: Settings },
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
    <div className="px-3 py-2">
      {!isCollapsed && <h2 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground/80 uppercase">{title}</h2>}
      <div className="space-y-1">
        {visibleLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            title={isCollapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <link.icon className={`h-5 w-5 shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
            <span className={isCollapsed ? 'sr-only' : 'grow'}>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export const AppSidebar = () => {
  const { isCollapsed } = useSidebar();
  return (
    <aside className={`h-full border-r bg-background transition-all duration-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex h-16 items-center border-b px-6 justify-center">
        <h1 className={`text-lg font-bold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>CareConnect</h1>
        {isCollapsed && <BadgeCheck className="h-6 w-6 text-primary" />}
      </div>
      <nav className="flex-1 space-y-2 py-4">
        {navLinks.map(group => <NavGroup key={group.title} title={group.title} links={group.links} isCollapsed={isCollapsed} />)}
      </nav>
    </aside>
  );
};