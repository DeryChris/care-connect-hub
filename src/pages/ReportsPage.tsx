import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, PieChart, TrendingUp, Users, Calendar, 
  Activity, ClipboardList, Package, DollarSign, Download, Printer
} from 'lucide-react';
import { mockUsers, mockTasks, mockInventory } from '@/lib/mock-data';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  // Calculate stats
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.is_active).length;
  const pendingTasks = mockTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const lowStockCount = mockInventory.filter(i => i.quantity <= i.min_quantity).length;
  const totalInventoryValue = mockInventory.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const reportCards = [
    { title: 'Total Staff', value: totalUsers, subtext: `${activeUsers} active`, icon: Users, color: 'bg-primary/10 text-primary' },
    { title: 'Pending Tasks', value: pendingTasks, subtext: `${completedTasks} completed`, icon: ClipboardList, color: 'bg-warning/10 text-warning' },
    { title: 'Low Stock Items', value: lowStockCount, subtext: `Total value: $${totalInventoryValue.toLocaleString()}`, icon: Package, color: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-muted-foreground">Hospital analytics and reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="staff">Staff Reports</SelectItem>
            <SelectItem value="tasks">Task Reports</SelectItem>
            <SelectItem value="inventory">Inventory Reports</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card, index) => (
          <Card key={index} className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              {/* Donut Chart Container */}
              <svg viewBox="0 0 120 120" className="w-32 h-32 mx-auto">
                {/* Background Ring */}
                <circle
                  cx="60" cy="60" r="52"
                  fill="none" stroke="#e5e7eb" strokeWidth="8"
                />
                {/* Completed (Green - 40%) */}
                <circle
                  cx="60" cy="60" r="52"
                  fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray="206.26 259.08"
                  pathLength="0.4"
                  transform="rotate(-90 60 60)"
                />
                {/* Pending/In Progress (Yellow - 60%) */}
                <circle
                  cx="60" cy="60" r="52"
                  fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray="155.45 309.89"
                  pathLength="0.6"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-foreground">
                  {mockTasks.length > 0 ? Math.round((completedTasks / mockTasks.length) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">Completed</div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="ml-auto font-medium">{completedTasks}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-sm text-muted-foreground">Pending/In Progress</span>
                <span className="ml-auto font-medium">{pendingTasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff by Designation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Staff by Role
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              {['doctor', 'nurse', 'pharmacist', 'lab_technician', 'admin_staff'].map(role => {
                const count = mockUsers.filter(u => u.designation === role && u.is_active).length;
                return (
                  <div key={role} className="flex justify-between items-center py-1">
                    <span className="capitalize text-sm text-muted-foreground">{role.replace('_', ' ')}s</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total Active Staff</span>
                  <Badge variant="default" className="text-lg font-bold px-3 py-1">
                    {activeUsers}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Lab Tests Completed Today</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Appointments Today</p>
                <p className="text-xl font-bold">28</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
                <p className="text-xl font-bold">$4,250</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;

