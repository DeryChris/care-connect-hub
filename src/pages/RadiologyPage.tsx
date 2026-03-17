import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Scan, User, Calendar, Stethoscope, Clock, CheckCircle, XCircle } from 'lucide-react';
import { mockRadiologyRequests } from '@/lib/mock-data';
import { RadiologyRequest, RadiologyStatus, RadiologyType } from '@/lib/constants';

const RADIOLOGY_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-muted text-muted-foreground' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-warning text-warning-foreground' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-info text-info-foreground' },
  { value: 'completed', label: 'Completed', color: 'bg-success text-success-foreground' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-destructive text-destructive-foreground' },
] as const;

const RADIOLOGY_TYPES = [
  { value: 'xray', label: 'X-Ray' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'ct_scan', label: 'CT Scan' },
  { value: 'mri', label: 'MRI' },
  { value: 'mammography', label: 'Mammography' },
  { value: 'angiography', label: 'Angiography' },
  { value: 'other', label: 'Other' },
] as const;

const RadiologyPage = () => {
  const [requests, setRequests] = useState<RadiologyRequest[]>(mockRadiologyRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = !search || 
        r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        r.examination.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchType = typeFilter === 'all' || r.radiology_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [requests, search, statusFilter, typeFilter]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const todayCount = requests.filter(r => r.appointment_date === new Date().toISOString().split('T')[0]).length;

  const stats = [
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-muted-foreground' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-success' },
    { label: 'Scheduled Today', value: todayCount, icon: Calendar, color: 'text-warning' },
    { label: 'Total Requests', value: requests.length, icon: Scan, color: 'text-primary' },
  ];

  const getStatusBadge = (status: RadiologyStatus) => {
    const statusObj = RADIOLOGY_STATUSES.find(s => s.value === status);
    return (
      <Badge className={statusObj?.color || ''}>
        {statusObj?.label || status}
      </Badge>
    );
  };

  const getTypeLabel = (type: RadiologyType) => {
    const typeObj = RADIOLOGY_TYPES.find(t => t.value === type);
    return typeObj?.label || type;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Radiology Department</h1>
          <p className="text-sm text-muted-foreground">Manage radiology requests and imaging services</p>
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
            placeholder="Search patient or examination..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10" 
          />
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Examination</TableHead>
                <TableHead>Referring Doctor</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>Clinical History</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {request.patient_name}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {request.patient_age} yrs • {request.patient_gender}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(request.radiology_type)}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{request.examination}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3 text-muted-foreground" />
                      {request.doctor_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.appointment_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {request.appointment_date} {request.appointment_time}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {request.clinical_history || '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No radiology requests found.
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

export default RadiologyPage;

