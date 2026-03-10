import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Search, Building2 } from 'lucide-react';
import { Department } from '@/lib/constants';
import { mockDepartments } from '@/lib/mock-data';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [search, setSearch] = useState('');
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);

  const filtered = departments.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setIsNew(true);
    setFormName('');
    setFormDesc('');
    setFormActive(true);
    setEditDept({} as Department);
  };

  const openEdit = (dept: Department) => {
    setIsNew(false);
    setFormName(dept.name);
    setFormDesc(dept.description);
    setFormActive(dept.is_active);
    setEditDept(dept);
  };

  const saveDept = () => {
    if (!formName.trim()) return;
    if (isNew) {
      const newDept: Department = {
        id: String(Date.now()),
        name: formName,
        description: formDesc,
        is_active: formActive,
        staff_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      };
      setDepartments(prev => [...prev, newDept]);
    } else if (editDept) {
      setDepartments(prev => prev.map(d => d.id === editDept.id ? { ...d, name: formName, description: formDesc, is_active: formActive } : d));
    }
    setEditDept(null);
  };

  const deleteDept = (id: string) => {
    const dept = departments.find(d => d.id === id);
    if (dept && dept.staff_count > 0) {
      alert('Cannot delete: department has linked staff.');
      setDeleteId(null);
      return;
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} departments</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Department</Button>
      </div>

      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(dept => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {dept.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">{dept.description || '—'}</TableCell>
                  <TableCell>{dept.staff_count}</TableCell>
                  <TableCell>
                    <Badge variant={dept.is_active ? "default" : "outline"} className={dept.is_active ? 'bg-success text-success-foreground' : ''}>
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(dept.id)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={!!editDept} onOpenChange={() => setEditDept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add Department' : 'Edit Department'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Name *</Label>
              <Input id="dept-name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Department name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-desc">Description</Label>
              <Textarea id="dept-desc" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="dept-active" checked={formActive} onCheckedChange={(c) => setFormActive(!!c)} />
              <Label htmlFor="dept-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDept(null)}>Cancel</Button>
            <Button onClick={saveDept}>{isNew ? 'Create' : 'Update'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteDept(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
