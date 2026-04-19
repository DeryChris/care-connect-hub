// ═══════════════════════════════════════════════════════════════════════════
// src/pages/TasksPage.tsx  — wired to real API
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { MODULES, PRIORITIES, TASK_STATUSES, Task, TaskStatus } from '@/lib/constants';
import { useTasks, useUpdateTaskStatus, useDeleteTask } from '@/hooks';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  in_progress: 'bg-info/10 text-info',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};
const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground', medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning', urgent: 'bg-destructive/10 text-destructive',
};

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useTasks({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  });
  const tasks = data?.data ?? [];

  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? 0} tasks</p>
        </div>
        <Link to="/tasks/create"><Button><Plus className="h-4 w-4 mr-2" />Add Task</Button></Link>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {TASK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead><TableHead>Module</TableHead>
              <TableHead>Priority</TableHead><TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead><TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              : tasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{MODULES.find(m => m.key === task.module)?.label || task.module}</Badge></TableCell>
                    <TableCell><Badge className={priorityColors[task.priority] || ''}>{task.priority}</Badge></TableCell>
                    <TableCell>
                      <Select value={task.status} onValueChange={s => updateStatus.mutate({ id: task.id, status: s })}>
                        <SelectTrigger className={`h-7 w-[120px] text-xs ${statusColors[task.status] || ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{task.assigned_to_name || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                    <TableCell className="text-sm">{task.due_date ? new Date(task.due_date).toLocaleDateString() : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Link to={`/tasks/${task.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button></Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => setDeleteId(task.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            }
            {!isLoading && tasks.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No tasks found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Task</DialogTitle>
            <DialogDescription>This will mark the task as cancelled. Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Keep</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteTask.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}>Cancel Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
