import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, TestTube, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LabTest {
  id: string;
  patient_name: string;
  test_name: string;
  sample_collected: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  result_date: string | null;
  doctor_ordered: string;
  notes: string;
}

const mockLabTests: LabTest[] = [
  { id: '1', patient_name: 'John Doe', test_name: 'Complete Blood Count', sample_collected: '2024-12-10', status: 'processing', result_date: null, doctor_ordered: 'Dr. Sarah Wilson', notes: 'Urgent' },
  { id: '2', patient_name: 'Jane Smith', test_name: 'Lipid Profile', sample_collected: '2024-12-09', status: 'completed', result_date: '2024-12-10', doctor_ordered: 'Dr. James Chen', notes: '' },
  { id: '3', patient_name: 'Mike Johnson', test_name: 'Liver Function Test', sample_collected: '2024-12-10', status: 'pending', result_date: null, doctor_ordered: 'Dr. Sarah Wilson', notes: 'Fasting sample' },
  { id: '4', patient_name: 'Sarah Brown', test_name: 'Urine Analysis', sample_collected: '2024-12-08', status: 'completed', result_date: '2024-12-09', doctor_ordered: 'Dr. James Chen', notes: 'Routine' },
  { id: '5', patient_name: 'Tom Wilson', test_name: 'Blood Glucose', sample_collected: '2024-12-10', status: 'processing', result_date: null, doctor_ordered: 'Dr. Sarah Wilson', notes: 'Random' },
  { id: '6', patient_name: 'Lisa Davis', test_name: 'Thyroid Profile', sample_collected: '2024-12-11', status: 'pending', result_date: null, doctor_ordered: 'Dr. James Chen', notes: 'Fasting 8hrs' },
  { id: '7', patient_name: 'Robert Lee', test_name: 'Renal Function Test', sample_collected: '2024-12-10', status: 'processing', result_date: null, doctor_ordered: 'Dr. Sarah Wilson', notes: '' },
  { id: '8', patient_name: 'Emily Garcia', test_name: 'ESR & CRP', sample_collected: '2024-12-09', status: 'completed', result_date: '2024-12-10', doctor_ordered: 'Dr. James Chen', notes: 'Inflammation markers' },
];

const LaboratoryPage = () => {
  const [tests, setTests] = useState(mockLabTests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return tests.filter(t => {
      const matchSearch = !search || 
        t.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        t.test_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tests, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const deleteTest = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
    setDeleteDialog(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-primary text-primary-foreground">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laboratory</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} tests found</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Test Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-success mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'processing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'pending').length}</p>
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
                placeholder="Search patient or test name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lab Tests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Sample Collected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(test => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.patient_name}</TableCell>
                  <TableCell className="font-medium">{test.test_name}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(test.sample_collected).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(test.status)}</TableCell>
                  <TableCell className="font-medium">{test.doctor_ordered}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {test.notes || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => setDeleteDialog(test.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No lab tests match the selected filters.
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
            <DialogTitle>Cancel Lab Test</DialogTitle>
            <DialogDescription>
              This will cancel the lab test order. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteDialog && deleteTest(deleteDialog)}>
              Cancel Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaboratoryPage;

