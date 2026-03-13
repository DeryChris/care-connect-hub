import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Activity, User, Calendar, Stethoscope, Thermometer, Heart } from 'lucide-react';
import { mockOPDVisits, mockDepartments } from '@/lib/mock-data';
import { OPDVisit, OPDStatus } from '@/lib/constants';

const OPD_STATUSES = [
  { value: 'waiting', label: 'Waiting', color: 'bg-warning text-warning-foreground' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-info text-info-foreground' },
  { value: 'completed', label: 'Completed', color: 'bg-success text-success-foreground' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
] as const;

const OPDPage = () => {
  const [visits, setVisits] = useState<OPDVisit[]>(mockOPDVisits);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filtered = useMemo(() => {
    return visits.filter(v => {
      const matchSearch = !search || 
        v.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        v.chief_complaint.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchDept = departmentFilter === 'all' || v.department_id === departmentFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [visits, search, statusFilter, departmentFilter]);

  const waitingCount = visits.filter(v => v.status === 'waiting').length;
  const inProgressCount = visits.filter(v => v.status === 'in_progress').length;
  const completedToday = visits.filter(v => v.status === 'completed' && v.visit_date === new Date().toISOString().split('T')[0]).length;

  const stats = [
    { label: 'Waiting', value: waitingCount, icon: Activity, color: 'text-warning' },
    { label: 'In Progress', value: inProgressCount, icon: Stethoscope, color: 'text-info' },
    { label: 'Completed Today', value: completedToday, icon: User, color: 'text-success' },
    { label: 'Total Visits', value: visits.length, icon: Calendar, color: 'text-primary' },
  ];

  const getStatusBadge = (status: OPDStatus) => {
    const statusObj = OPD_STATUSES.find(s => s.value === status);
    return (
      <Badge className={statusObj?.color || ''}>
        {statusObj?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">OPD (Outpatient Department)</h1>
          <p className="text-sm text-muted-foreground">Manage outpatient visits and consultations</p>
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
            placeholder="Search patient or complaint..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10" 
          />
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
                <TableHead>Department</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Visit Time</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Vitals</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(visit => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {visit.patient_name}
                    </div>
                    <p className="text-xs text-muted-foreground">{visit.patient_phone}</p>
                  </TableCell>
                  <TableCell>{visit.department_name}</TableCell>
                  <TableCell>{visit.doctor_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {visit.visit_date} {visit.visit_time}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{visit.chief_complaint}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      {visit.vitals && (
                        <>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-destructive" />
                            {visit.vitals.blood_pressure}
                          </span>
                          <span className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-warning" />
                            {visit.vitals.temperature}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(visit.status)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No OPD visits found.
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

export default OPDPage;

