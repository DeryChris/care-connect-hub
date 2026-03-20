// src/pages/UserForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { DESIGNATIONS, MODULES } from '@/lib/constants';
import { useCreateUser, useUpdateUser, useUser } from '@/hooks';
import { useDepartments } from '@/hooks';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existing } = useUser(id ?? '');
  const { data: deptsData } = useDepartments({ active: true });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const departments = deptsData?.data ?? [];

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    designation: '' as any, role: 'user' as 'admin' | 'user',
    department_id: '', specialization: '', qualification: '',
    fee: 0, is_active: true,
  });
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (existing?.data) {
      const u = existing.data;
      setFormData({
        name: u.name ?? '', email: u.email ?? '', password: '',
        phone: u.phone ?? '', designation: u.designation ?? '',
        role: u.role ?? 'user', department_id: u.department_id ?? '',
        specialization: u.specialization ?? '', qualification: u.qualification ?? '',
        fee: u.fee ?? 0, is_active: u.is_active ?? true,
      });
      setPermissions(u.permissions ?? []);
    }
  }, [existing]);

  const isDoctor = formData.designation === 'doctor';

  const togglePermission = (key: string) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, permissions };
    if (!isEdit || formData.password) {
      // include password only if provided
    }
    if (isEdit && id) {
      const data: any = { ...formData, permissions };
      if (!data.password) delete data.password;
      updateUser.mutate({ id, data }, { onSuccess: () => navigate('/users') });
    } else {
      createUser.mutate(payload as any, { onSuccess: () => navigate('/users') });
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="page-title">{isEdit ? 'Edit User' : 'Add New User'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required placeholder="Enter full name" value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required placeholder="Enter email" value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
              <Input id="password" type="password" required={!isEdit} placeholder="Enter password" value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1234567890" value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Designation *</Label>
              <Select value={formData.designation} onValueChange={v => setFormData(p => ({ ...p, designation: v }))}>
                <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={v => setFormData(p => ({ ...p, role: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="is_active" checked={formData.is_active}
                onCheckedChange={c => setFormData(p => ({ ...p, is_active: c as boolean }))} />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </CardContent>
        </Card>

        {isDoctor && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Doctor Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department_id} onValueChange={v => setFormData(p => ({ ...p, department_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" placeholder="e.g. Cardiology" value={formData.specialization}
                  onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" placeholder="e.g. MBBS, MD" value={formData.qualification}
                  onChange={e => setFormData(p => ({ ...p, qualification: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Consultation Fee</Label>
                <Input id="fee" type="number" placeholder="0.00" value={formData.fee}
                  onChange={e => setFormData(p => ({ ...p, fee: parseFloat(e.target.value) || 0 }))} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-lg">Module Permissions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map(mod => (
                <div key={mod.key} className="flex items-center gap-2">
                  <Checkbox id={`perm-${mod.key}`} checked={permissions.includes(mod.key)}
                    onCheckedChange={() => togglePermission(mod.key)} />
                  <Label htmlFor={`perm-${mod.key}`} className="text-sm">{mod.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />{isPending ? 'Saving...' : 'Save User'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/users')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
