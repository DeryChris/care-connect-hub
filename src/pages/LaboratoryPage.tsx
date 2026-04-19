// src/pages/LaboratoryPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input as DInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, FlaskConical, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LAB_TEST_STATUSES } from '@/lib/constants';
import { useLabTests, useUpdateLabStatus, useUpdateLabResults, useDeleteLabTest } from '@/hooks';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  sample_collected: 'bg-warning/10 text-warning',
  processing: 'bg-info/10 text-info',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const resultColors: Record<string, string> = {
  normal: 'bg-success text-success-foreground',
  abnormal: 'bg-warning text-warning-foreground',
  critical: 'bg-destructive text-destructive-foreground',
};

const LaboratoryPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resultsDialog, setResultsDialog] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState({ result: '', result_value: '', result_unit: '', reference_range: '', result_status: 'normal' as 'normal' | 'abnormal' | 'critical' });

  const { data, isLoading } = useLabTests({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const tests = data?.data ?? [];
  const updateStatus = useUpdateLabStatus();
  const updateResults = useUpdateLabResults();
  const deleteTest = useDeleteLabTest();

  const pendingCount = tests.filter(t => t.status === 'pending').length;
  const processingCount = tests.filter(t => t.status === 'processing' || t.status === 'sample_collected').length;
  const completedCount = tests.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laboratory</h1>
          <p className="text-sm text-muted-foreground">Manage lab tests and results</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-muted-foreground' },
          { label: 'Processing', value: processingCount, icon: FlaskConical, color: 'text-info' },
          { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-success' },
        ].map(stat => (
          <Card key={stat.label}><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patient or test..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {LAB_TEST_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              : tests.map(test => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.patient_name}</TableCell>
                    <TableCell className="text-sm">{test.test_name}</TableCell>
                    <TableCell><Badge variant="outline">{test.category}</Badge></TableCell>
                    <TableCell className="text-sm">{test.ordered_by_name}</TableCell>
                    <TableCell>
                      {test.result_status
                        ? <Badge className={resultColors[test.result_status] || ''}>{test.result_status}</Badge>
                        : <span className="text-muted-foreground text-sm">—</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Select value={test.status} onValueChange={s => updateStatus.mutate({ id: test.id, status: s })}>
                        <SelectTrigger className={`h-7 w-[150px] text-xs ${statusColors[test.status] || ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LAB_TEST_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {test.status !== 'completed' && test.status !== 'cancelled' && (
                        <Button variant="outline" size="sm" onClick={() => setResultsDialog(test.id)}>
                          Enter Results
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            }
            {!isLoading && tests.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No lab tests found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!resultsDialog} onOpenChange={() => setResultsDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enter Lab Results</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Result Summary</Label>
              <DInput placeholder="e.g. All values normal" value={resultForm.result} onChange={e => setResultForm(p => ({ ...p, result: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <DInput placeholder="e.g. 14.5" value={resultForm.result_value} onChange={e => setResultForm(p => ({ ...p, result_value: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <DInput placeholder="e.g. g/dL" value={resultForm.result_unit} onChange={e => setResultForm(p => ({ ...p, result_unit: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Reference Range</Label>
              <DInput placeholder="e.g. 12.0-17.5" value={resultForm.reference_range} onChange={e => setResultForm(p => ({ ...p, reference_range: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Result Status</Label>
              <Select value={resultForm.result_status} onValueChange={v => setResultForm(p => ({ ...p, result_status: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="abnormal">Abnormal</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultsDialog(null)}>Cancel</Button>
            <Button onClick={() => {
              if (resultsDialog) {
                updateResults.mutate({ id: resultsDialog, results: resultForm }, {
                  onSuccess: () => { setResultsDialog(null); setResultForm({ result: '', result_value: '', result_unit: '', reference_range: '', result_status: 'normal' }); }
                });
              }
            }}>Save Results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaboratoryPage;
