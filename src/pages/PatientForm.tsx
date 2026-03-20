// src/pages/PatientForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import { GENDERS, BLOOD_GROUPS } from '@/lib/constants';
import { useCreatePatient, useUpdatePatient, usePatient } from '@/hooks';

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingPatient } = usePatient(id ?? '');
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date_of_birth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    blood_group: '', address: '', emergency_contact: '',
    emergency_phone: '', insurance_provider: '', insurance_number: '',
    is_active: true,
  });

  useEffect(() => {
    if (existing?.data) {
      const p = existing.data;
      setFormData({
        name: p.name ?? '',
        email: p.email ?? '',
        phone: p.phone ?? '',
        date_of_birth: p.date_of_birth ?? '',
        gender: p.gender ?? 'male',
        blood_group: p.blood_group ?? '',
        address: p.address ?? '',
        emergency_contact: p.emergency_contact ?? '',
        emergency_phone: p.emergency_phone ?? '',
        insurance_provider: p.insurance_provider ?? '',
        insurance_number: p.insurance_number ?? '',
        is_active: p.is_active ?? true,
      });
    }
  }, [existing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updatePatient.mutate({ id, data: formData }, { onSuccess: () => navigate('/patients') });
    } else {
      createPatient.mutate(formData, { onSuccess: () => navigate('/patients') });
    }
  };

  const isPending = createPatient.isPending || updatePatient.isPending;

  if (isEdit && loadingPatient) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">{isEdit ? 'Edit Patient' : 'Add New Patient'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required placeholder="Enter full name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" required placeholder="+1234567890" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input id="date_of_birth" type="date" required value={formData.date_of_birth} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select value={formData.gender} onValueChange={v => setFormData(p => ({ ...p, gender: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  {GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={formData.blood_group} onValueChange={v => setFormData(p => ({ ...p, blood_group: v }))}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" required placeholder="Enter address" value={formData.address} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Emergency Contact</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Contact Name</Label>
              <Input id="emergency_contact" placeholder="Emergency contact name" value={formData.emergency_contact} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Contact Phone</Label>
              <Input id="emergency_phone" placeholder="+1234567890" value={formData.emergency_phone} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Insurance Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="insurance_provider">Insurance Provider</Label>
              <Input id="insurance_provider" placeholder="e.g. HealthPlus" value={formData.insurance_provider} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance_number">Policy Number</Label>
              <Input id="insurance_number" placeholder="Policy number" value={formData.insurance_number} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={checked => setFormData(p => ({ ...p, is_active: checked as boolean }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isPending ? 'Saving...' : 'Save Patient'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/patients')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
