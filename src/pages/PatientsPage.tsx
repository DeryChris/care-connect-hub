import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockDepartments } from '@/lib/mock-data';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  department_id: string;
  admission_date: string;
  status: 'admitted' | 'discharged' | 'pending';
  doctor: string;
}

const mockPatients: Patient[] = [
  { id: '1', name: 'John Doe', age: 45, gender: 'male', department_id: '1', admission_date: '2024-12-01', status: 'admitted', doctor: 'Dr. Sarah Wilson' },
  { id: '2', name: 'Jane Smith', age: 32, gender: 'female', department_id: '2', admission_date: '2024-12-02', status: 'admitted', doctor: 'Dr. James Chen' },
  { id: '3', name: 'Mike Johnson', age: 28, gender: 'male', department_id: '3', admission_date: '2024-12-03', status: 'pending', doctor: 'Dr. Sarah Wilson' },
  { id: '4', name: 'Sarah Brown', age: 65, gender: 'female', department_id: '4', admission_date: '2024-12-01', status: 'discharged', doctor: 'Dr. James Chen' },
  { id: '5', name: 'Tom Wilson', age: 12, gender: 'male', department_id: '4', admission_date: '2024-12-04', status: 'admitted', doctor: 'Dr. Sarah Wilson' },
  { id: '6', name: 'Lisa Davis', age: 38, gender: 'female', department_id: '6', admission_date: '2024-12-05', status: 'admitted', doctor: 'Dr. James Chen' },
  { id: '7', name: 'Robert Lee', age: 52, gender: 'male', department_id: '1', admission_date: '2024-12-06', status: 'pending', doctor: 'Dr. Sarah Wilson' },
  { id: '8', name: 'Emily Garcia', age: 29, gender: 'female', department_id: '2', admission_date: '2024-12-07', status: 'admitted', doctor: 'Dr. James Chen' },
];

const PatientsPage = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchDept = departmentFilter === 'all' || p.department_id === departmentFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [patients, search, departmentFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    setDeleteDialog(null);
  };

  const getDeptName = (id: string) => mockDepartments.find(d => d.id === id)?.name || 'Unknown';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'admitted':
        return <Badge className="bg-success text-success-foreground">Admitted</Badge>;
      case 'discharged':
        return <Badge variant="secondary">Discharged</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} patients found</p>
        </div>
        <div className="flex gap-2">
          <Link to="/patients/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search patients by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="admitted">Admitted</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(patient => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDeptName(patient.department_id)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(patient.admission_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
                  <TableCell className="text-sm font-medium">{patient.doctor}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Link to={`/patients/${patient.id}/edit`}>
                        <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => setDeleteDialog(patient.id)}
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
                    No patients match the selected filters.
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
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this patient record?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteDialog && deletePatient(deleteDialog)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsPage;
