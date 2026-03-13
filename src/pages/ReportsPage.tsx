import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, PieChart, TrendingUp, Users, Calendar, 
  Activity, ClipboardList, Package, DollarSign, Download, Printer
} from 'lucide-react';
import { mockPatients, mockAppointments, mockLaboratoryTests, mockPharmacyItems, mockTasks, mockUsers } from '@/lib/mock-data';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  // Calculate stats
  const totalPatients = mockPatients.length;
  const activePatients = mockPatients.filter(p => p.is_active).length;
  const todayAppointments = mockAppointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length;
  const upcomingAppointments = mockAppointments.filter(a => a.appointment_date >= new Date().toISOString().split('T')[0]).length;
  const completedAppointments = mockAppointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = mockAppointments.filter(a => a.status === 'cancelled').length;
  
  const totalLabTests = mockLaboratoryTests.length;
  const completedLabTests = mockLaboratoryTests.filter(t => t.status === 'completed').length;
  const pendingLabTests = mockLaboratoryTests.filter(t => t.status === 'pending').length;
  
  const pharmacyValue = mockPharmacyItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const lowStockItems = mockPharmacyItems.filter(i => i.quantity <= i.min_quantity).length;
  
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = mockTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  const reportCards = [
    { title: 'Total Patients', value: totalPatients, subtext: `${activePatients} active`, icon: Users, color: 'bg-primary/10 text-primary' },
    { title: "Today's Appointments", value: todayAppointments, subtext: `${upcomingAppointments} upcoming`, icon: Calendar, color: 'bg-info/10 text-info' },
    { title: 'Lab Tests', value: totalLabTests, subtext: `${completedLabTests} completed`, icon: Activity, color: 'bg-warning/10 text-warning' },
    { title: 'Pharmacy Value', value: `$${pharmacyValue.toLocaleString()}`, subtext: `${lowStockItems} low stock`, icon: DollarSign, color: 'bg-success/10 text-success' },
  ];

  const appointmentStatusData = [
    { label: 'Completed', value: completedAppointments, color: 'bg-success' },
    { label: 'Scheduled', value: upcomingAppointments, color: 'bg-info' },
    { label: 'Cancelled', value: cancelledAppointments, color: 'bg-muted' },
  ];

  const labStatusData = [
    { label: 'Completed', value: completedLabTests, color: 'bg-success' },
    { label: 'Pending', value: pendingLabTests, color: 'bg-warning' },
    { label: 'Processing', value: mockLaboratoryTests.filter(t => t.status === 'processing').length, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-muted-foreground">View and analyze hospital data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />Print
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />Export
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
            <SelectItem value="patients">Patient Reports</SelectItem>
            <SelectItem value="appointments">Appointment Reports</SelectItem>
            <SelectItem value="laboratory">Laboratory Reports</SelectItem>
            <SelectItem value="pharmacy">Pharmacy Reports</SelectItem>
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
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Appointment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentStatusData.map((item) => {
                const total = completedAppointments + upcomingAppointments + cancelledAppointments;
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Laboratory Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Laboratory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {labStatusData.map((item) => {
                const total = completedLabTests + pendingLabTests + mockLaboratoryTests.filter(t => t.status === 'processing').length;
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Task Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Tasks</span>
                <span className="font-bold">{totalTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold text-success">{completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending/In Progress</span>
                <span className="font-bold text-warning">{pendingTasks}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Completion Rate</span>
                  <span className="font-medium">{totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full bg-success transition-all" 
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['doctor', 'nurse', 'pharmacist', 'lab_technician'].map((role) => {
                const count = mockUsers.filter(u => u.designation === role && u.is_active).length;
                const label = role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
                return (
                  <div key={role} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{label}s</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Active Staff</span>
                  <span className="font-bold">{mockUsers.filter(u => u.is_active).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// import { Badge } from '@/components/ui/badge';

export default ReportsPage;

