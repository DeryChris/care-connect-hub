import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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

const navLinks = [
  {
    title: "Main",
    links: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/patients", label: "Patients", icon: Users, permissions: ["role:admin", "designation:doctor", "designation:nurse", "designation:receptionist"] },
      { to: "/appointments", label: "Appointments", icon: Calendar, permissions: ["role:admin", "designation:doctor", "designation:receptionist"] },
    ],
  },
  {
    title: "Clinical",
    links: [
        { to: "/laboratory", label: "Laboratory", icon: FlaskConical, permissions: ["designation:lab_technician", "role:admin"] },
        { to: "/pharmacy", label: "Pharmacy", icon: Pill, permissions: ["designation:pharmacist", "role:admin"] },
    ],
  },
  {
    title: "Management",
    links: [
      { to: "/departments", label: "Departments", icon: Building, permissions: ["role:admin"] },
      { to: "/users", label: "Staff", icon: Users, permissions: ["role:admin"] },
      { to: "/inventory", label: "Inventory", icon: Boxes, permissions: ["role:admin", "designation:pharmacist"] },
      { to: "/tasks", label: "Tasks", icon: ClipboardList },
      { to: "/reports", label: "Reports", icon: FileText, permissions: ["role:admin"] },
      { to: "/approvals", label: "Approvals", icon: BadgeCheck, permissions: ["role:admin", "designation:doctor"] },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/documents", label: "Documents", icon: File },
      { to: "/knowledge", label: "Knowledge Base", icon: Book },
      { to: "/wiki", label: "Wiki", icon: GitPullRequest },
    ],
  },
];

const NavGroup = ({ title, links, isCollapsed }: { title: string; links: any[]; isCollapsed: boolean }) => {
  const { userHasPermission } = useAuth();

  const visibleLinks = links.filter(link => 
    !link.permissions || link.permissions.some(userHasPermission)
  );

  if (visibleLinks.length === 0) return null;

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