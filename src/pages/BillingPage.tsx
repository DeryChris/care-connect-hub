// src/pages/BillingPage.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Receipt, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useBillingInvoices, useBillingSummary, useRecordPayment } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';
import { BillingStatus, BillingType } from '@/lib/constants';

const BILLING_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-warning text-warning-foreground' },
  { value: 'paid', label: 'Paid', color: 'bg-success text-success-foreground' },
  { value: 'partial', label: 'Partial', color: 'bg-info text-info-foreground' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
  { value: 'refunded', label: 'Refunded', color: 'bg-destructive/10 text-destructive' },
];

const BillingPage = () => {
  const { formatCurrency } = useSettings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const { data, isLoading } = useBillingInvoices({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });
  const { data: summaryData } = useBillingSummary();

  const invoices = data?.data ?? [];
  const summary = summaryData?.data;
  const recordPayment = useRecordPayment();

  const getStatusBadge = (status: BillingStatus) => {
    const s = BILLING_STATUSES.find(x => x.value === status);
    return <Badge className={s?.color || ''}>{s?.label || status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="text-sm text-muted-foreground">Manage invoices and payments</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(summary?.totalRevenue ?? 0), icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending Amount', value: formatCurrency(summary?.pendingAmount ?? 0), icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Total Invoices', value: summary?.totalInvoices ?? 0, icon: Receipt, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending Invoices', value: summary?.pendingCount ?? 0, icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
        ].map(stat => (
          <Card key={stat.label} className="stat-card"><CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold font-display">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by patient or invoice..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {BILLING_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              : invoices.map(inv => {
                  const balance = inv.total - inv.amount_paid;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                      <TableCell className="font-medium">{inv.patient_name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{inv.billing_type}</Badge></TableCell>
                      <TableCell className="font-medium">{formatCurrency(inv.total)}</TableCell>
                      <TableCell className="text-success">{formatCurrency(inv.amount_paid)}</TableCell>
                      <TableCell className={balance > 0 ? 'text-destructive font-medium' : ''}>{formatCurrency(balance)}</TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-right">
                        {(inv.status === 'pending' || inv.status === 'partial') && (
                          <Button variant="outline" size="sm" onClick={() => { setPaymentDialog(inv.id); setPaymentAmount(''); }}>
                            Record Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
            }
            {!isLoading && invoices.length === 0 && (
              <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No invoices found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Payment Amount *</Label>
              <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(null)}>Cancel</Button>
            <Button onClick={() => {
              if (paymentDialog && paymentAmount) {
                recordPayment.mutate({ id: paymentDialog, amount: parseFloat(paymentAmount) }, {
                  onSuccess: () => setPaymentDialog(null),
                });
              }
            }} disabled={!paymentAmount || recordPayment.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingPage;
