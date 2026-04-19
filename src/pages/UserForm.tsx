// src/pages/UserForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Shield, BookOpen } from 'lucide-react';
import { DESIGNATIONS, HMIS_MODULES, KMS_MODULES } from '@/lib/constants';
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
    name: '',
    email: '',
    password: '',
    phone: '',
    designation: '' as any,
    role: 'user' as 'admin' | 'user',
    department_id: '',
    specialization: '',
    qualification: '',
    fee: '',          // string so empty input doesn't show "0"
    is_active: true,
  });
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (existing?.data) {
      const u = existing.data;
      setFormData({
        name:           u.name ?? '',
        email:          u.email ?? '',
        password:       '',
        phone:          u.phone ?? '',
        designation:    u.designation ?? '',
        role:           u.role ?? 'user',
        department_id:  u.department_id ?? '',
        specialization: u.specialization ?? '',
        qualification:  u.qualification ?? '',
        fee:            u.fee != null ? String(u.fee) : '',
        is_active:      u.is_active ?? true,
      });
      setPermissions(u.permissions ?? []);
    }
  }, [existing]);

  const isDoctor = formData.designation === 'doctor';

  const togglePermission = (key: string) =>
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key],
    );

  // Select/deselect all permissions in a group
  const toggleGroup = (keys: readonly string[]) => {
    const allOn = keys.every(k => permissions.includes(k));
    if (allOn) {
      setPermissions(prev => prev.filter(k => !keys.includes(k)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...keys])]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build clean payload — never send empty string for department_id or fee
    const payload: any = {
      name:        formData.name,
      email:       formData.email,
      phone:       formData.phone || undefined,
      designation: formData.designation,
      role:        formData.role,
      is_active:   formData.is_active,
      permissions,
      department_id:  formData.department_id  || null,
      specialization: formData.specialization || null,
      qualification:  formData.qualification  || null,
      fee: formData.fee !== '' ? parseFloat(formData.fee) : null,
    };

    // Only include password if provided (and non-empty on edit)
    if (!isEdit || formData.password) {
      payload.password = formData.password;
    }

    if (isEdit && id) {
      const data: any = { ...payload };
      if (!data.password) delete data.password;
      updateUser.mutate({ id, data }, { onSuccess: () => navigate('/users') });
    } else {
      createUser.mutate(payload, { onSuccess: () => navigate('/users') });
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;
  const hmisKeys  = HMIS_MODULES.map(m => m.key) as unknown as readonly string[];
  const kmsKeys   = KMS_MODULES.map(m => m.key)  as unknown as readonly string[];
  const allHmisOn = hmisKeys.every(k => permissions.includes(k));
  const allKmsOn  = kmsKeys.every(k => permissions.includes(k));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">{isEdit ? 'Edit User' : 'Add New User'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name" required placeholder="Enter full name"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email" type="email" required placeholder="Enter email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
              </Label>
              <Input
                id="password" type="password" required={!isEdit}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Minimum 8 characters'}
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone" placeholder="+233 XX XXX XXXX"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Designation *</Label>
              <Select
                value={formData.designation}
                onValueChange={v => setFormData(p => ({ ...p, designation: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={v => setFormData(p => ({ ...p, role: v as any }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={c => setFormData(p => ({ ...p, is_active: c as boolean }))}
              />
              <Label htmlFor="is_active">Active Account</Label>
            </div>
          </CardContent>
        </Card>

        {/* ── Doctor Details ─────────────────────────────────────────────────── */}
        {isDoctor && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Doctor Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={v => setFormData(p => ({ ...p, department_id: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Department</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization" placeholder="e.g. Cardiology"
                  value={formData.specialization}
                  onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification" placeholder="e.g. MBBS, MD"
                  value={formData.qualification}
                  onChange={e => setFormData(p => ({ ...p, qualification: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Consultation Fee (GHS)</Label>
                <Input
                  id="fee" type="number" min="0" step="0.01"
                  placeholder="0.00"
                  value={formData.fee}
                  onChange={e => setFormData(p => ({ ...p, fee: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Module Permissions ─────────────────────────────────────────────── */}
        {formData.role !== 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Module Permissions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Admin accounts automatically have full access. Set module-level access for user accounts.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* HMIS Modules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">HMIS Modules</span>
                    <Badge variant="outline" className="text-xs">
                      {permissions.filter(p => hmisKeys.includes(p)).length}/{hmisKeys.length}
                    </Badge>
                  </div>
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="text-xs h-7"
                    onClick={() => toggleGroup(hmisKeys)}
                  >
                    {allHmisOn ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {HMIS_MODULES.map(mod => (
                    <div key={mod.key} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={`perm-${mod.key}`}
                        checked={permissions.includes(mod.key)}
                        onCheckedChange={() => togglePermission(mod.key)}
                      />
                      <Label htmlFor={`perm-${mod.key}`} className="text-sm cursor-pointer">
                        {mod.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* KMS Modules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Knowledge Management (KMS)</span>
                    <Badge variant="outline" className="text-xs">
                      {permissions.filter(p => kmsKeys.includes(p)).length}/{kmsKeys.length}
                    </Badge>
                  </div>
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="text-xs h-7"
                    onClick={() => toggleGroup(kmsKeys)}
                  >
                    {allKmsOn ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  These permissions control what this user can do in the Knowledge Base,
                  Documents, and Wiki sections.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {KMS_MODULES.map(mod => (
                    <div key={mod.key} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={`perm-${mod.key}`}
                        checked={permissions.includes(mod.key)}
                        onCheckedChange={() => togglePermission(mod.key)}
                      />
                      <Label htmlFor={`perm-${mod.key}`} className="text-sm cursor-pointer">
                        {mod.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {formData.role === 'admin' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                Admin accounts have unrestricted access to all modules and KMS functions.
                No individual permissions need to be set.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Submit ─────────────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isPending ? 'Saving…' : 'Save User'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/users')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;