import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, BedDouble, User, Calendar, Building2, Clock, CheckCircle } from 'lucide-react';
import { mockIPDAdmissions, mockDepartments } from '@/lib/mock-data';
import { IPDAdmission, IPDStatus } from '@/lib/constants';

const IPD_STATUSES = [
  { value: 'admitted', label: 'Admitted', color: 'bg-warning text-warning-foreground' },
  { value: 'in_progress', label: 'In Treatment', color: 'bg-info text-info-foreground' },
  { value: 'discharged', label: 'Discharged', color: 'bg-success text-success-foreground' },
  { value: 'transferred', label: 'Transferred', color: 'bg-primary/10 text-primary' },
] as const;

const IPDPage = () => {
  const [admissions, setAdmissions] = useState<IPDAdmission[]>(mockIPDAdmissions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filtered = useMemo(() => {
    return admissions.filter(a => {
      const matchSearch = !search || 
        a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        a.room_number.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchDept = departmentFilter === 'all' || a.department_id === departmentFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [admissions, search, statusFilter, departmentFilter]);

  const admittedCount = admissions.filter(a => a.status === 'admitted' || a.status === 'in_progress').length;
  const dischargedCount = admissions.filter(a => a.status === 'discharged').length;
  const todayAdmissions = admissions.filter(a => a.admission_date === new Date().toISOString().split('T')[0]).length;

  const stats = [
    { label: 'Current Inpatients', value: admittedCount, icon: BedDouble, color: 'text-warning' },
    { label: 'Discharged Today', value: dischargedCount, icon: CheckCircle, color: 'text-success' },
    { label: 'Admitted Today', value: todayAdmissions, icon: Calendar, color: 'text-info' },
    { label: 'Total Admissions', value: admissions.length, icon: User, color: 'text-primary' },
  ];

  const getStatusBadge = (status: IPDStatus) => {
    const statusObj = IPD_STATUSES.find(s => s.value === status);
    return (
      <Badge className={statusObj?.color || ''}>
        {statusObj?.label || status}
      </Badge>
    );
  };

  const calculateDays = (admitDate: string, dischargeDate?: string) => {
    const start = new Date(admitDate);
    const end = dischargeDate ? new Date(dischargeDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">IPD (Inpatient Department)</h1>
          <p className="text-sm text-muted-foreground">Manage inpatient admissions and treatments</p>
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
            placeholder="Search patient or room..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10" 
          />
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
            {mockDepartments.filter(d => d.is_active).map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Patient</TableHead>
                <TableHead>Room/Bed</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(admission => (
                <TableRow key={admission.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {admission.patient_name}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {admission.patient_age} yrs • {admission.patient_gender}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BedDouble className="h-4 w-4 text-primary" />
                      {admission.room_number} / {admission.bed_number}
                    </div>
                  </TableCell>
                  <TableCell>{admission.department_name}</TableCell>
                  <TableCell>{admission.doctor_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {admission.admission_date}
                    </div>
                    <p className="text-xs text-muted-foreground">{admission.admission_time}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {calculateDays(admission.admission_date, admission.discharge_date)} days
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{admission.diagnosis}</TableCell>
                  <TableCell>{getStatusBadge(admission.status)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No IPD admissions found.
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

export default IPDPage;

