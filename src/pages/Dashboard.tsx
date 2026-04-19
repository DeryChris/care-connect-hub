// src/pages/Dashboard.tsx
// Replaces all mockX.filter() calculations with useDashboardStats() from the API.
// The UI — stat cards, pie chart, activity feed, quick links — is unchanged.

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardList, TrendingUp, AlertTriangle,
  Activity, Package, CalendarDays, Building2,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';

const DEPT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899'];

const Dashboard = () => {
  const { user } = useAuth();
  const { formatCurrency } = useSettings();
  const { data, isLoading } = useDashboardStats();
  const stats_data = data?.data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stats = [
    { label: 'Active Staff', value: stats_data?.activeStaff ?? 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10', link: '/users' },
    { label: 'Pending Tasks', value: stats_data?.pendingTasks ?? 0, icon: ClipboardList, color: 'text-warning', bg: 'bg-warning/10', link: '/tasks' },
    { label: 'Inventory Value', value: formatCurrency(stats_data?.totalInventoryValue ?? 0), icon: TrendingUp, color: 'text-success-foreground', bg: 'bg-success', link: '/inventory' },
    { label: 'Low Stock Items', value: stats_data?.lowStockCount ?? 0, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', link: '/inventory' },
  ];

  const patientsByDept: { name: string; count: number }[] = stats_data?.patientsByDepartment ?? [];
  const totalPatients = patientsByDept.reduce((s: number, d: any) => s + d.count, 0);

  const quickLinks = [
    { label: 'Users', icon: Users, to: '/users', desc: 'Manage staff' },
    { label: 'Departments', icon: Building2, to: '/departments', desc: 'Clinical depts' },
    { label: 'Tasks', icon: ClipboardList, to: '/tasks', desc: 'View tasks' },
    { label: 'Inventory', icon: Package, to: '/inventory', desc: 'Stock management' },
    { label: 'Appointments', icon: CalendarDays, to: '/appointments', desc: 'Schedule' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="stat-card group cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {isLoading
                      ? <Skeleton className="mt-1 h-8 w-16" />
                      : <p className="mt-1 text-2xl font-bold font-display text-foreground">{stat.value}</p>
                    }
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} transition-transform group-hover:scale-110`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))
                : (stats_data?.recentActivities ?? []).map((activity: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
              }
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.label} to={link.to}>
                  <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Departments</h3>
              <Link to="/departments"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="space-y-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
                : (stats_data?.departments ?? []).slice(0, 4).map((dept: any) => (
                    <div key={dept.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">{dept.description}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {dept.staff_count} staff
                      </span>
                    </div>
                  ))
              }
            </div>
          </CardContent>
        </Card>

        {/* Patients by Department Pie Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Patients by Department</h3>
                <p className="text-sm text-muted-foreground mt-0.5">OPD visit distribution</p>
              </div>
              <Link to="/patients">
                <Button variant="ghost" size="sm" className="h-8 px-3">View Patients</Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-36 w-36 rounded-full" />
                <div className="w-full space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <svg viewBox="0 0 140 140" className="w-36 h-36">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeDasharray="377 377" />
                    {patientsByDept.map((dept, index) => {
                      const percent = totalPatients > 0 ? dept.count / totalPatients : 0;
                      const startAngle = -90 + index * (360 / Math.max(patientsByDept.length, 1));
                      return (
                        <circle key={dept.name} cx="70" cy="70" r="60" fill="none"
                          stroke={DEPT_COLORS[index % DEPT_COLORS.length]}
                          strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${377 * percent} ${377}`}
                          transform={`rotate(${startAngle} 70 70)`}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-foreground">{totalPatients}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Visits</div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 w-full max-w-xs">
                  {patientsByDept.map((dept, index) => {
                    const percent = totalPatients > 0 ? Math.round((dept.count / totalPatients) * 100) : 0;
                    return (
                      <div key={dept.name} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: DEPT_COLORS[index % DEPT_COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground truncate">{dept.name}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-sm">{dept.count}</span>
                          <span className="text-xs text-muted-foreground">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
