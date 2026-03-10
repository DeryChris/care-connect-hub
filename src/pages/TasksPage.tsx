import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { mockTasks } from '@/lib/mock-data';
import { MODULES, PRIORITIES, TASK_STATUSES, Task, TaskStatus } from '@/lib/constants';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  in_progress: 'bg-info/10 text-info',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    }).sort((a, b) => {
      const order = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const updateStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeleteId(null);
  };

  const getModuleLabel = (key: string) => MODULES.find(m => m.key === key)?.label || key;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} tasks</p>
        </div>
        <Link to="/tasks/create">
          <Button><Plus className="h-4 w-4 mr-2" />Add Task</Button>
        </Link>
      </div>

      <div className="filter-bar">
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Title</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(task => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{getModuleLabel(task.module)}</Badge></TableCell>
                  <TableCell>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{task.assigned_to_name || 'Unassigned'}</TableCell>
                  <TableCell className="text-muted-foreground">{task.due_date || '—'}</TableCell>
                  <TableCell>
                    <Select value={task.status} onValueChange={(v) => updateStatus(task.id, v as TaskStatus)}>
                      <SelectTrigger className="h-7 w-[130px] text-xs">
                        <Badge className={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/tasks/${task.id}/edit`}>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(task.id)} className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tasks found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>Are you sure you want to delete this task?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteTask(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
