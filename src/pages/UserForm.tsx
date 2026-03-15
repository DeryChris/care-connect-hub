import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { DESIGNATIONS, MODULES } from '@/lib/constants';
import { mockDepartments } from '@/lib/mock-data';

const UserForm = () => {
  const navigate = useNavigate();
  const [designation, setDesignation] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  const isDoctor = designation === 'doctor';

  const togglePermission = (key: string) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    navigate('/users');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">Add New User</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required placeholder="Enter email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" required placeholder="Enter password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <Label>Designation *</Label>
              <Select value={designation} onValueChange={setDesignation} required>
                <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="active" defaultChecked />
              <Label htmlFor="active">Active</Label>
            </div>
          </CardContent>
        </Card>

        {isDoctor && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Doctor Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {mockDepartments.filter(d => d.is_active).map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" placeholder="e.g. Cardiology" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" placeholder="e.g. MBBS, MD" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Consultation Fee</Label>
                <Input id="fee" type="number" min={0} placeholder="0.00" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-lg">Module Permissions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {MODULES.map(mod => (
                <div key={mod.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${mod.key}`}
                    checked={permissions.includes(mod.key)}
                    onCheckedChange={() => togglePermission(mod.key)}
                  />
                  <Label htmlFor={`perm-${mod.key}`} className="text-sm">{mod.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit"><Save className="h-4 w-4 mr-2" />Save User</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/users')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
