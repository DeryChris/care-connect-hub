import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardList, Package, Building2,
  CalendarDays, TrendingUp, AlertTriangle, Activity
} from 'lucide-react';
import { mockUsers, mockTasks, mockInventory, mockDepartments } from '@/lib/mock-data';

const Dashboard = () => {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const lowStockCount = mockInventory.filter(i => i.quantity <= i.min_quantity).length;
  const totalInventoryValue = mockInventory.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const pendingTasks = mockTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const activeStaff = mockUsers.filter(u => u.is_active).length;

  // Perfect donut proportions - THICKER strokeWidth with VIVID colors
  const patientsByDept = [
    { name: 'Cardiology', count: 25, color: '#10b981' },
    { name: 'Orthopedics', count: 18, color: '#3b82f6' },
    { name: 'Neurology', count: 22, color: '#8b5cf6' },
    { name: 'Pediatrics', count: 30, color: '#f97316' },
    { name: 'Emergency', count: 15, color: '#ec4899' },
  ];
  const totalPatients = patientsByDept.reduce((sum, dept) => sum + dept.count, 0);

  const stats = [
    { label: 'Active Staff', value: activeStaff, icon: Users, color: 'text-primary', bg: 'bg-primary/10', link: '/users' },
    { label: 'Pending Tasks', value: pendingTasks, icon: ClipboardList, color: 'text-warning', bg: 'bg-warning/10', link: '/tasks' },
    { label: 'Inventory Value', value: `$${totalInventoryValue.toLocaleString()}`, icon: TrendingUp, color: 'text-success-foreground', bg: 'bg-success', link: '/inventory' },
    { label: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', link: '/inventory' },
  ];

  const recentActivities = [
    { text: 'New user Robert Taylor registered', time: '2 hours ago', icon: Users },
    { text: 'Lab equipment calibration task created', time: '5 hours ago', icon: ClipboardList },
    { text: 'Surgical Gloves stock is low', time: '1 day ago', icon: AlertTriangle },
    { text: 'Dr. Sarah Wilson updated patient records', time: '1 day ago', icon: Activity },
    { text: 'Inventory audit task assigned to Michael', time: '2 days ago', icon: Package },
  ];

  const quickLinks = [
    { label: 'Users', icon: Users, to: '/users', desc: 'Manage staff' },
    { label: 'Departments', icon: Building2, to: '/departments', desc: 'Clinical depts' },
    { label: 'Tasks', icon: ClipboardList, to: '/tasks', desc: 'View tasks' },
    { label: 'Inventory', icon: Package, to: '/inventory', desc: 'Stock management' },
    { label: 'Appointments', icon: CalendarDays, to: '/appointments', desc: 'Coming soon' },
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
                    <p className="mt-1 text-2xl font-bold font-display text-foreground">{stat.value}</p>
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
        {/* Recent Activity - TOP PRIORITY per TODO */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <activity.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
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

      {/* Department & Task Overview - Side by side per TODO */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Departments</h3>
              <Link to="/departments"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="space-y-3">
              {mockDepartments.filter(d => d.is_active).slice(0, 4).map(dept => (
                <div key={dept.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.description}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {dept.staff_count} staff
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Pending Tasks</h3>
              <Link to="/tasks"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="space-y-3">
              {mockTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.assigned_to_name || 'Unassigned'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                    task.priority === 'high' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* THICKER VIVID PIE CHART WITH COLORS */}
      <Card className="max-w-sm mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Patients by Department</h3>
              <p className="text-sm text-muted-foreground">Hospital patient distribution</p>
            </div>
            <Link to="/patients">
              <Button variant="ghost" size="sm" className="h-8 px-3">
                View Patients
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center space-y-3">
            {/* ULTRA THICK VIVID DONUT - strokeWidth 28 */}
            <div className="relative w-36 h-36">
              {/* Subtle shadows */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-300/20 rounded-full blur-sm" />
              
              <svg viewBox="0 0 160 160" className="w-full h-full absolute inset-0">
                {/* Background */}
                <circle cx="80" cy="80" r="65" fill="none" stroke="hsl(var(--card))" strokeWidth="14" />
                
                {/* Pediatrics 30/110 = 98° - VIVID ORANGE */}
                <circle cx="80" cy="80" r="65" fill="none" stroke="#f97316" strokeWidth="28" strokeLinecap="round" 
                  strokeDasharray="98 360" strokeDashoffset="-5" pathLength="1" className="drop-shadow-sm" />
                
                {/* Emergency 15/110 = 49° - VIVID PINK */}
                <circle cx="80" cy="80" r="65" fill="none" stroke="#ec4899" strokeWidth="28" strokeLinecap="round" 
                  strokeDasharray="49 360" strokeDashoffset="-103" pathLength="1" className="drop-shadow-sm" />
                
                {/* Cardiology 25/110 = 82° - VIVID GREEN */}
                <circle cx="80" cy="80" r="65" fill="none" stroke="#10b981" strokeWidth="28" strokeLinecap="round" 
                  strokeDasharray="82 360" strokeDashoffset="-152" pathLength="1" className="drop-shadow-sm" />
                
                {/* Orthopedics 18/110 = 59° - VIVID BLUE */}
                <circle cx="80" cy="80" r="65" fill="none" stroke="#3b82f6" strokeWidth="28" strokeLinecap="round" 
                  strokeDasharray="59 360" strokeDashoffset="-234" pathLength="1" className="drop-shadow-sm" />
                
                {/* Neurology 22/110 = 72° - VIVID PURPLE */}
                <circle cx="80" cy="80" r="65" fill="none" stroke="#8b5cf6" strokeWidth="28" strokeLinecap="round" 
                  strokeDasharray="72 360" strokeDashoffset="-293" pathLength="1" className="drop-shadow-sm" />
              </svg>
              
              {/* CLEAN CENTER NUMBER */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-foreground drop-shadow-lg">{totalPatients}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Patients</div>
              </div>
            </div>

            {/* CENTERED LEGEND */}
            <div className="flex flex-wrap justify-center gap-4 px-2 text-sm">
              {patientsByDept.map((dept, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: dept.color }} />
                  <span className="font-medium text-foreground whitespace-nowrap">{dept.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
