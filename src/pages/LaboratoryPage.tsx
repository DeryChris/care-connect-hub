import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dialog as ShadDialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, FlaskConical, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mockLaboratoryTests, mockPatients, mockUsers } from '@/lib/mock-data';
import { LaboratoryTest, LabTestStatus } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  sample_collected: 'bg-info/10 text-info',
  processing: 'bg-primary/10 text-primary',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

const resultColors: Record<string, string> = {
  normal: 'text-success',
  abnormal: 'text-warning',
  critical: 'text-destructive',
};

const LaboratoryPage = () => {
  const [tests, setTests] = useState<LaboratoryTest[]>(mockLaboratoryTests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [resultDialog, setResultDialog] = useState<LaboratoryTest | null>(null);
  const [resultForm, setResultForm] = useState({
    result: '',
    result_value: '',
    result_unit: '',
    reference_range: '',
    result_status: 'normal' as 'normal' | 'abnormal' | 'critical',
  });

  const filtered = useMemo(() => {
    return tests.filter(t => {
      const matchSearch = !search || 
        t.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        t.test_name.toLowerCase().includes(search.toLowerCase()) ||
        t.test_code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [tests, search, statusFilter, categoryFilter]);

  const updateStatus = (id: string, status: LabTestStatus) => {
    setTests(prev => prev.map(t => t.id === id ? { 
      ...t, 
      status,
      collected_at: status === 'sample_collected' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : t.collected_at,
      completed_at: status === 'completed' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : t.completed_at
    } : t));
  };

  const deleteTest = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
    setDeleteDialog(null);
  };

  const saveResult = () => {
    if (!resultDialog) return;
    setTests(prev => prev.map(t => t.id === resultDialog.id ? {
      ...t,
      result: resultForm.result,
      result_value: resultForm.result_value,
      result_unit: resultForm.result_unit,
      reference_range: resultForm.reference_range,
      result_status: resultForm.result_status,
      status: 'completed' as LabTestStatus,
      completed_at: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : t));
    setResultDialog(null);
    setResultForm({ result: '', result_value: '', result_unit: '', reference_range: '', result_status: 'normal' });
  };

  const categories = [...new Set(tests.map(t => t.category))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laboratory</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} lab tests</p>
        </div>
        <Link to="/laboratory/create">
          <Button><Plus className="h-4 w-4 mr-2" />New Test Order</Button>
        </Link>
      </div>

      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search patient, test, or code..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sample_collected">Sample Collected</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{tests.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <FlaskConical className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-xl font-bold">{tests.filter(t => t.status === 'processing' || t.status === 'sample_collected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abnormal</p>
                <p className="text-xl font-bold">{tests.filter(t => t.result_status === 'abnormal' || t.result_status === 'critical').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Test</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Ordered By</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(test => (
                <TableRow key={test.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{test.test_name}</p>
                      <p className="text-xs text-muted-foreground">{test.test_code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{test.patient_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{test.ordered_by_name}</TableCell>
                  <TableCell>
                    {test.collected_at ? (
                      <span className="text-sm">{test.collected_at}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {test.status === 'completed' && test.result_value ? (
                      <div>
                        <p className={`font-medium ${resultColors[test.result_status || 'normal']}`}>
                          {test.result_value} {test.result_unit}
                        </p>
                        <p className="text-xs text-muted-foreground">Ref: {test.reference_range}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select value={test.status} onValueChange={(v) => updateStatus(test.id, v as LabTestStatus)}>
                      <SelectTrigger className="h-7 w-[140px] text-xs">
                        <Badge className={statusColors[test.status]}>{test.status.replace('_', ' ')}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sample_collected">Sample Collected</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {test.status !== 'completed' && test.status !== 'cancelled' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setResultForm({
                              result: test.result || '',
                              result_value: test.result_value || '',
                              result_unit: test.result_unit || '',
                              reference_range: test.reference_range || '',
                              result_status: test.result_status || 'normal',
                            });
                            setResultDialog(test);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setDeleteDialog(test.id)} className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No lab tests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lab Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lab test order?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteDialog && deleteTest(deleteDialog)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Entry Dialog */}
      <Dialog open={!!resultDialog} onOpenChange={() => setResultDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Test Result</DialogTitle>
            <DialogDescription>
              {resultDialog?.test_name} - {resultDialog?.patient_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Result Value</Label>
              <Input 
                value={resultForm.result_value} 
                onChange={(e) => setResultForm(prev => ({ ...prev, result_value: e.target.value }))}
                placeholder="e.g. 14.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input 
                value={resultForm.result_unit} 
                onChange={(e) => setResultForm(prev => ({ ...prev, result_unit: e.target.value }))}
                placeholder="e.g. g/dL"
              />
            </div>
            <div className="space-y-2">
              <Label>Reference Range</Label>
              <Input 
                value={resultForm.reference_range} 
                onChange={(e) => setResultForm(prev => ({ ...prev, reference_range: e.target.value }))}
                placeholder="e.g. 12.0-17.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Result Status</Label>
              <Select value={resultForm.result_status} onValueChange={(v) => setResultForm(prev => ({ ...prev, result_status: v as typeof resultForm.result_status }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="abnormal">Abnormal</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={resultForm.result} 
                onChange={(e) => setResultForm(prev => ({ ...prev, result: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultDialog(null)}>Cancel</Button>
            <Button onClick={saveResult}>Save Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaboratoryPage;

