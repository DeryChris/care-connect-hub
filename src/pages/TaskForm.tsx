// src/pages/TaskForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { MODULES, PRIORITIES, TASK_STATUSES } from '@/lib/constants';
import { useCreateTask, useUpdateTask, useTask } from '@/hooks';
import { useUsers } from '@/hooks';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existing } = useTask(id ?? '');
  const { data: usersData } = useUsers({ limit: 100 });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const users = usersData?.data ?? [];

  const [formData, setFormData] = useState({
    title: '', description: '', module: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    due_date: '', assigned_to: '', assigned_to_name: '',
  });

  useEffect(() => {
    if (existing?.data) {
      const t = existing.data;
      setFormData({
        title: t.title ?? '', description: t.description ?? '',
        module: t.module ?? 'general', priority: t.priority ?? 'medium',
        status: t.status ?? 'pending', due_date: t.due_date ?? '',
        assigned_to: t.assigned_to ?? '', assigned_to_name: t.assigned_to_name ?? '',
      });
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateTask.mutate({ id, data: formData }, { onSuccess: () => navigate('/tasks') });
    } else {
      createTask.mutate(formData, { onSuccess: () => navigate('/tasks') });
    }
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tasks')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="page-title">{isEdit ? 'Edit Task' : 'Create Task'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Task Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" required placeholder="Task title" value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Task description" value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={formData.module} onValueChange={v => setFormData(p => ({ ...p, module: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODULES.map(m => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" value={formData.due_date}
                onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={formData.assigned_to} onValueChange={v => {
                const u = users.find(x => x.id === v);
                setFormData(p => ({ ...p, assigned_to: v, assigned_to_name: u?.name ?? '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />{isPending ? 'Saving...' : 'Save Task'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
