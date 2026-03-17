import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Receipt, User, Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { mockBillingInvoices } from '@/lib/mock-data';
import { BillingInvoice, BillingStatus, BillingType } from '@/lib/constants';

const BILLING_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-warning text-warning-foreground' },
  { value: 'paid', label: 'Paid', color: 'bg-success text-success-foreground' },
  { value: 'partial', label: 'Partial', color: 'bg-info text-info-foreground' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
  { value: 'refunded', label: 'Refunded', color: 'bg-destructive/10 text-destructive' },
] as const;

const BILLING_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'ipd', label: 'IPD' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'other', label: 'Other' },
] as const;

const BillingPage = () => {
  const [invoices, setInvoices] = useState<BillingInvoice[]>(mockBillingInvoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = !search || 
        inv.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchType = typeFilter === 'all' || inv.billing_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [invoices, search, statusFilter, typeFilter]);

  const pendingAmount = invoices.filter(inv => inv.status === 'pending' || inv.status === 'partial')
    .reduce((sum, inv) => sum + (inv.total - inv.amount_paid), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const totalInvoices = invoices.length;

  const stats = [
    { label: 'Total Revenue', value: `$${paidAmount.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
    { label: 'Pending Amount', value: `$${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-warning' },
    { label: 'Total Invoices', value: totalInvoices, icon: Receipt, color: 'text-primary' },
    { label: 'Pending Invoices', value: invoices.filter(inv => inv.status === 'pending').length, icon: AlertCircle, color: 'text-muted-foreground' },
  ];

  const getStatusBadge = (status: BillingStatus) => {
    const statusObj = BILLING_STATUSES.find(s => s.value === status);
    return (
      <Badge className={statusObj?.color || ''}>
        {statusObj?.label || status}
      </Badge>
    );
  };

  const getTypeLabel = (type: BillingType) => {
    const typeObj = BILLING_TYPES.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage patient billing and invoices</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search patient or invoice..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {BILLING_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {BILLING_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      {invoice.invoice_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {invoice.patient_name}
                    </div>
                    <p className="text-xs text-muted-foreground">{invoice.patient_phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(invoice.billing_type)}</Badge>
                  </TableCell>
                  <TableCell>{invoice.items.length} items</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                  <TableCell className="text-success">{formatCurrency(invoice.amount_paid)}</TableCell>
                  <TableCell className={invoice.total - invoice.amount_paid > 0 ? 'text-warning' : ''}>
                    {formatCurrency(invoice.total - invoice.amount_paid)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {invoice.created_at}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;

