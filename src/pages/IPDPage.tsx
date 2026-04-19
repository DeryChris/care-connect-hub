// src/pages/IPDPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input as DInput } from '@/components/ui/input';
import { Search, BedDouble, User, Calendar, CheckCircle } from 'lucide-react';
import { useIPDAdmissions, useDischargePatient } from '@/hooks';
import { useDepartments } from '@/hooks';

const IPD_STATUSES = [
  { value: 'admitted', label: 'Admitted', color: 'bg-warning text-warning-foreground' },
  { value: 'in_progress', label: 'In Treatment', color: 'bg-info text-info-foreground' },
  { value: 'discharged', label: 'Discharged', color: 'bg-success text-success-foreground' },
  { value: 'transferred', label: 'Transferred', color: 'bg-primary/10 text-primary' },
];

const IPDPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dischargeDialog, setDischargeDialog] = useState<string | null>(null);
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useIPDAdmissions({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    department_id: departmentFilter !== 'all' ? departmentFilter : undefined,
  });
  const { data: deptsData } = useDepartments({ active: true });

  const admissions = data?.data ?? [];
  const departments = deptsData?.data ?? [];
  const discharge = useDischargePatient();

  const admittedCount = admissions.filter(a => a.status === 'admitted' || a.status === 'in_progress').length;
  const dischargedCount = admissions.filter(a => a.status === 'discharged').length;

  const calculateDays = (admitDate: string, dischargeDate?: string | null) => {
    const start = new Date(admitDate);
    const end = dischargeDate ? new Date(dischargeDate) : new Date();
    return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">IPD (Inpatient Department)</h1>
          <p className="text-sm text-muted-foreground">Manage inpatient admissions and treatments</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Current Inpatients', value: admittedCount, icon: BedDouble, color: 'text-warning' },
          { label: 'Discharged', value: dischargedCount, icon: CheckCircle, color: 'text-success' },
          { label: 'Total Admissions', value: admissions.length, icon: User, color: 'text-primary' },
          { label: 'Today\'s Admissions', value: admissions.filter(a => a.admission_date === new Date().toISOString().split('T')[0]).length, icon: Calendar, color: 'text-info' },
        ].map(stat => (
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

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search patient or room..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {IPD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Room / Bed</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  ))
                : admissions.map(adm => {
                    const statusObj = IPD_STATUSES.find(s => s.value === adm.status);
                    return (
                      <TableRow key={adm.id}>
                        <TableCell>
                          <div className="font-medium">{adm.patient_name}</div>
                          <div className="text-xs text-muted-foreground">{adm.patient_age}y · {adm.patient_gender}</div>
                        </TableCell>
                        <TableCell className="text-sm">{adm.doctor_name}</TableCell>
                        <TableCell className="text-sm">{adm.room_number} / {adm.bed_number}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{adm.diagnosis}</TableCell>
                        <TableCell className="text-sm">{calculateDays(adm.admission_date, adm.discharge_date)} days</TableCell>
                        <TableCell>
                          <Badge className={statusObj?.color || ''}>{statusObj?.label || adm.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {(adm.status === 'admitted' || adm.status === 'in_progress') && (
                            <Button variant="outline" size="sm" onClick={() => setDischargeDialog(adm.id)}>
                              Discharge
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              }
              {!isLoading && admissions.length === 0 && (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No admissions found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!dischargeDialog} onOpenChange={() => setDischargeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
            <DialogDescription>Set the discharge date and confirm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Discharge Date</label>
              <DInput type="date" value={dischargeDate} onChange={e => setDischargeDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDischargeDialog(null)}>Cancel</Button>
            <Button onClick={() => {
              if (dischargeDialog) {
                discharge.mutate({ id: dischargeDialog, discharge_date: dischargeDate }, { onSuccess: () => setDischargeDialog(null) });
              }
            }}>Confirm Discharge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPDPage;
