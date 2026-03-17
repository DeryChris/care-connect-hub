import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, CalendarDays, User, Stethoscope, BedDouble } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockAppointments } from '@/lib/mock-data';
import { mockUsers, mockDepartments } from '@/lib/mock-data';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch = !search || 
        a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        a.doctor_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchDept = departmentFilter === 'all' || a.department_id === departmentFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [appointments, search, statusFilter, departmentFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setDeleteDialog(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { variant: 'outline', className: '' },
      'confirmed': { variant: 'default', className: 'bg-success text-success-foreground' },
      'in_progress': { variant: 'default', className: 'bg-primary text-primary-foreground' },
      'completed': { variant: 'default', className: 'bg-success text-success-foreground' },
      'cancelled': { variant: 'destructive', className: '' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={(config?.variant || 'default') as 'outline' | 'default' | 'destructive' | 'secondary'} className={config?.className || ''}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getDeptName = (id: string) => mockDepartments.find(d => d.id === id)?.name || 'Unknown';

  const todayCount = appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length;
  const upcomingCount = appointments.filter(a => a.appointment_date >= new Date().toISOString().split('T')[0]).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} appointments found ({todayCount} today)</p>
        </div>
        <Button asChild>
          <Link to="/appointments/create">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarDays className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-success mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-info mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Consultations</p>
                <p className="text-2xl font-bold">{appointments.filter(a => a.type === 'consultation').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BedDouble className="h-8 w-8 text-warning mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold">{appointments.filter(a => a.type === 'emergency').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search patient or doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(appointment => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                  <TableCell>{appointment.doctor_name}</TableCell>
                  <TableCell>{getDeptName(appointment.department_id)}</TableCell>
                  <TableCell className="font-medium">
                    {new Date(appointment.appointment_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">{appointment.appointment_time}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {appointment.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => setDeleteDialog(appointment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No appointments match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm text-muted-foreground bg-card rounded-md">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              This will cancel the appointment. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteDialog && deleteAppointment(deleteDialog)}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;

