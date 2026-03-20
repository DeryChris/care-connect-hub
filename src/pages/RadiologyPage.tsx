// src/pages/RadiologyPage.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Clock, CheckCircle, Scan, Calendar } from 'lucide-react';
import { useRadiologyRequests, useUpdateRadiologyStatus, useUpdateRadiologyReport } from '@/hooks';

const RADIOLOGY_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-muted text-muted-foreground' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-warning text-warning-foreground' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-info text-info-foreground' },
  { value: 'completed', label: 'Completed', color: 'bg-success text-success-foreground' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-destructive text-destructive-foreground' },
];

const RADIOLOGY_TYPES = [
  { value: 'xray', label: 'X-Ray' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'ct_scan', label: 'CT Scan' },
  { value: 'mri', label: 'MRI' },
  { value: 'mammography', label: 'Mammography' },
  { value: 'angiography', label: 'Angiography' },
  { value: 'other', label: 'Other' },
];

const RadiologyPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [reportDialog, setReportDialog] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState({ findings: '', impression: '', radiologist_notes: '' });

  const { data, isLoading } = useRadiologyRequests({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const requests = data?.data ?? [];
  const updateStatus = useUpdateRadiologyStatus();
  const updateReport = useUpdateRadiologyReport();

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const todayCount = requests.filter(r => r.appointment_date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Radiology Department</h1>
          <p className="text-sm text-muted-foreground">Manage radiology requests and imaging services</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-muted-foreground' },
          { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-success' },
          { label: 'Scheduled Today', value: todayCount, icon: Calendar, color: 'text-warning' },
          { label: 'Total Requests', value: requests.length, icon: Scan, color: 'text-primary' },
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
            <Input placeholder="Search patient or examination..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {RADIOLOGY_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RADIOLOGY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Examination</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              : requests.map(req => {
                  const statusObj = RADIOLOGY_STATUSES.find(s => s.value === req.status);
                  const typeLabel = RADIOLOGY_TYPES.find(t => t.value === req.radiology_type)?.label || req.radiology_type;
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium">{req.patient_name}</div>
                        <div className="text-xs text-muted-foreground">{req.patient_age}y · {req.patient_gender}</div>
                      </TableCell>
                      <TableCell className="text-sm">{req.examination}</TableCell>
                      <TableCell><Badge variant="outline">{typeLabel}</Badge></TableCell>
                      <TableCell className="text-sm">{req.doctor_name}</TableCell>
                      <TableCell className="text-sm">
                        {req.appointment_date ? `${req.appointment_date} ${req.appointment_time ?? ''}` : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Select value={req.status} onValueChange={s => updateStatus.mutate({ id: req.id, status: s })}>
                          <SelectTrigger className={`h-7 w-[130px] text-xs ${statusObj?.color || ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RADIOLOGY_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status !== 'completed' && req.status !== 'cancelled' && (
                          <Button variant="outline" size="sm" onClick={() => {
                            setReportForm({ findings: req.findings ?? '', impression: req.impression ?? '', radiologist_notes: req.radiologist_notes ?? '' });
                            setReportDialog(req.id);
                          }}>
                            Enter Report
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
            }
            {!isLoading && requests.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No radiology requests found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!reportDialog} onOpenChange={() => setReportDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Enter Radiology Report</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Findings *</Label>
              <Textarea rows={4} placeholder="Describe the imaging findings..." value={reportForm.findings} onChange={e => setReportForm(p => ({ ...p, findings: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Impression *</Label>
              <Textarea rows={3} placeholder="Radiologist's impression / conclusion..." value={reportForm.impression} onChange={e => setReportForm(p => ({ ...p, impression: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Radiologist Notes</Label>
              <Textarea rows={2} placeholder="Additional notes..." value={reportForm.radiologist_notes} onChange={e => setReportForm(p => ({ ...p, radiologist_notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialog(null)}>Cancel</Button>
            <Button onClick={() => {
              if (reportDialog) {
                updateReport.mutate({ id: reportDialog, report: reportForm }, { onSuccess: () => setReportDialog(null) });
              }
            }} disabled={!reportForm.findings || !reportForm.impression}>
              Save Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RadiologyPage;
