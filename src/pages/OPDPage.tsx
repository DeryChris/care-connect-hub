// src/pages/OPDPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Activity, Stethoscope, User, Calendar } from 'lucide-react';
import { useOPDVisits, useUpdateOPDStatus } from '@/hooks';
import { useDepartments } from '@/hooks';

const OPD_STATUSES = [
  { value: 'waiting', label: 'Waiting', color: 'bg-warning text-warning-foreground' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-info text-info-foreground' },
  { value: 'completed', label: 'Completed', color: 'bg-success text-success-foreground' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
] as const;

const OPDPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data, isLoading } = useOPDVisits({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    department_id: departmentFilter !== 'all' ? departmentFilter : undefined,
  });
  const { data: deptsData } = useDepartments({ active: true });

  const visits = data?.data ?? [];
  const departments = deptsData?.data ?? [];
  const updateStatus = useUpdateOPDStatus();

  const waitingCount = visits.filter(v => v.status === 'waiting').length;
  const inProgressCount = visits.filter(v => v.status === 'in_progress').length;
  const completedCount = visits.filter(v => v.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">OPD (Outpatient Department)</h1>
          <p className="text-sm text-muted-foreground">Manage outpatient visits and consultations</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Waiting', value: waitingCount, icon: Activity, color: 'text-warning' },
          { label: 'In Progress', value: inProgressCount, icon: Stethoscope, color: 'text-info' },
          { label: 'Completed Today', value: completedCount, icon: User, color: 'text-success' },
          { label: 'Total Visits', value: visits.length, icon: Calendar, color: 'text-primary' },
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
              <Input placeholder="Search patient or complaint..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {OPD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
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
                <TableHead>Department</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  ))
                : visits.map(visit => {
                    const statusObj = OPD_STATUSES.find(s => s.value === visit.status);
                    return (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.patient_name}</TableCell>
                        <TableCell className="text-sm">{visit.doctor_name}</TableCell>
                        <TableCell className="text-sm">{visit.department_name}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{visit.chief_complaint}</TableCell>
                        <TableCell className="text-sm">{visit.visit_date} {visit.visit_time}</TableCell>
                        <TableCell>
                          <Select value={visit.status} onValueChange={s => updateStatus.mutate({ id: visit.id, status: s })}>
                            <SelectTrigger className={`h-7 w-[130px] text-xs ${statusObj?.color || ''}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OPD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
              }
              {!isLoading && visits.length === 0 && (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No visits found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OPDPage;
