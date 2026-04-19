// src/pages/ReportsPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Users, ClipboardList, Package, DollarSign, Download, Printer } from 'lucide-react';
import { useOverviewReport, useInventoryReport, useBillingReport, useStaffReport } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';

const ReportsPage = () => {
  const { formatCurrency } = useSettings();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  const { data: overviewData, isLoading: loadingOverview } = useOverviewReport();
  const { data: inventoryData, isLoading: loadingInventory } = useInventoryReport();
  const { data: billingData, isLoading: loadingBilling } = useBillingReport(dateRange);
  const { data: staffData, isLoading: loadingStaff } = useStaffReport();

  const overview = overviewData?.data as any;
  const inventory = inventoryData?.data as any;
  const billing = billingData?.data as any;
  const staff = staffData?.data as any;

  const isLoading = loadingOverview || loadingInventory || loadingBilling || loadingStaff;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-muted-foreground">Hospital analytics and performance reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Print</Button>
          <Button><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="staff">Staff Reports</SelectItem>
            <SelectItem value="inventory">Inventory Reports</SelectItem>
            <SelectItem value="billing">Billing Reports</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview */}
      {(reportType === 'overview') && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Total Staff', value: overview?.totalUsers, sub: `${overview?.activeUsers} active`, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
            { title: 'Total Patients', value: overview?.totalPatients, sub: 'Active patients', icon: BarChart3, color: 'text-info', bg: 'bg-info/10' },
            { title: 'Pending Tasks', value: overview?.pendingTasks, sub: `${overview?.completedTasks} completed`, icon: ClipboardList, color: 'text-warning', bg: 'bg-warning/10' },
            { title: 'Total Invoices', value: overview?.totalInvoices, sub: `${overview?.paidInvoices} paid`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
          ].map(card => (
            <Card key={card.title} className="stat-card">
              <CardContent className="p-0">
                {isLoading ? <Skeleton className="h-20 w-full" /> : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="mt-1 text-3xl font-bold font-display">{card.value ?? '—'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Inventory */}
      {reportType === 'inventory' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {isLoading ? <Skeleton className="h-32 w-full sm:col-span-3" /> : (
            <>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-primary">{inventory?.totalItems ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Items</p>
              </CardContent></Card>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-destructive">{inventory?.lowStockCount ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Low Stock</p>
              </CardContent></Card>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-success">{formatCurrency(inventory?.totalValue ?? 0)}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Value</p>
              </CardContent></Card>
            </>
          )}
          {inventory?.byCategory && (
            <Card className="sm:col-span-3">
              <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-3">
                  {Object.entries(inventory.byCategory as Record<string, number>).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm font-medium">{cat}</span>
                      <span className="text-sm text-muted-foreground">{count} items</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Billing */}
      {reportType === 'billing' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {isLoading ? <Skeleton className="h-32 w-full sm:col-span-3" /> : (
            <>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-success">{formatCurrency(billing?.totalRevenue ?? 0)}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
              </CardContent></Card>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-warning">{formatCurrency(billing?.pendingAmount ?? 0)}</p>
                <p className="text-sm text-muted-foreground mt-1">Pending Amount</p>
              </CardContent></Card>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-primary">{billing?.totalInvoices ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Invoices</p>
              </CardContent></Card>
            </>
          )}
        </div>
      )}

      {/* Staff */}
      {reportType === 'staff' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {isLoading ? <Skeleton className="h-32 w-full sm:col-span-3" /> : (
            <>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-primary">{staff?.totalStaff ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Staff</p>
              </CardContent></Card>
              <Card><CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-success">{staff?.activeStaff ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Active Staff</p>
              </CardContent></Card>
            </>
          )}
          {staff?.byDesignation && (
            <Card className="sm:col-span-3">
              <CardHeader><CardTitle>By Designation</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-3">
                  {Object.entries(staff.byDesignation as Record<string, number>).map(([des, count]) => (
                    <div key={des} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm font-medium capitalize">{des.replace('_', ' ')}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
