// src/pages/DepartmentsPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks';

const DepartmentsPage = () => {
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit' | 'delete'; id?: string } | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useDepartments();
  const departments = data?.data ?? [];

  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const openCreate = () => { setName(''); setDescription(''); setDialog({ mode: 'create' }); };
  const openEdit = (d: any) => { setName(d.name); setDescription(d.description ?? ''); setDialog({ mode: 'edit', id: d.id }); };
  const openDelete = (id: string) => setDialog({ mode: 'delete', id });

  const handleSave = () => {
    if (dialog?.mode === 'create') {
      createDept.mutate({ name, description }, { onSuccess: () => setDialog(null) });
    } else if (dialog?.mode === 'edit' && dialog.id) {
      updateDept.mutate({ id: dialog.id, data: { name, description } }, { onSuccess: () => setDialog(null) });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-sm text-muted-foreground">{departments.length} departments</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Department</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Staff Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  ))
                : departments.map(dept => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dept.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dept.staff_count ?? 0} staff</Badge>
                      </TableCell>
                      <TableCell>
                        {dept.is_active
                          ? <Badge className="bg-success text-success-foreground">Active</Badge>
                          : <Badge variant="secondary">Inactive</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dept)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => openDelete(dept.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              }
              {!isLoading && departments.length === 0 && (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No departments found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialog?.mode === 'create' || dialog?.mode === 'edit'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === 'create' ? 'Add Department' : 'Edit Department'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name *</Label>
              <Input id="dept-name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cardiology" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-desc">Description</Label>
              <Textarea id="dept-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim() || createDept.isPending || updateDept.isPending}>
              {createDept.isPending || updateDept.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialog?.mode === 'delete'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Department</DialogTitle>
            <DialogDescription>This will deactivate the department. Staff will remain but unassigned.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (dialog?.id) deleteDept.mutate(dialog.id, { onSuccess: () => setDialog(null) });
            }}>Deactivate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
