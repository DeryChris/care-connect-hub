// src/pages/AppointmentForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from '@/lib/constants';
import { useCreateAppointment, useUpdateAppointment, useAppointment } from '@/hooks';
import { usePatients } from '@/hooks';
import { useUsers } from '@/hooks';
import { useDepartments } from '@/hooks';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existing } = useAppointment(id ?? '');
  const { data: patientsData } = usePatients({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });
  const { data: deptsData } = useDepartments({ active: true });
  const createAppt = useCreateAppointment();
  const updateAppt = useUpdateAppointment();

  const patients = patientsData?.data ?? [];
  const doctors = (usersData?.data ?? []).filter(u => u.designation === 'doctor');
  const departments = deptsData?.data ?? [];

  const [formData, setFormData] = useState({
    patient_id: '', patient_name: '',
    doctor_id: '', doctor_name: '',
    department_id: '', department_name: '',
    appointment_date: '', appointment_time: '',
    type: 'consultation' as const,
    status: 'scheduled' as const,
    reason: '', notes: '',
  });

  useEffect(() => {
    if (existing?.data) {
      const a = existing.data;
      setFormData({
        patient_id: a.patient_id, patient_name: a.patient_name,
        doctor_id: a.doctor_id, doctor_name: a.doctor_name,
        department_id: a.department_id, department_name: a.department_name,
        appointment_date: a.appointment_date, appointment_time: a.appointment_time,
        type: a.type, status: a.status,
        reason: a.reason, notes: a.notes ?? '',
      });
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateAppt.mutate({ id, data: formData }, { onSuccess: () => navigate('/appointments') });
    } else {
      createAppt.mutate(formData, { onSuccess: () => navigate('/appointments') });
    }
  };

  const isPending = createAppt.isPending || updateAppt.isPending;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/appointments')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="page-title">{isEdit ? 'Edit Appointment' : 'New Appointment'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Appointment Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={formData.patient_id} onValueChange={v => {
                const p = patients.find(x => x.id === v);
                setFormData(prev => ({ ...prev, patient_id: v, patient_name: p?.name ?? '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Doctor *</Label>
              <Select value={formData.doctor_id} onValueChange={v => {
                const d = doctors.find(x => x.id === v);
                setFormData(prev => ({ ...prev, doctor_id: v, doctor_name: d?.name ?? '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={formData.department_id} onValueChange={v => {
                const d = departments.find(x => x.id === v);
                setFormData(prev => ({ ...prev, department_id: v, department_name: d?.name ?? '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date *</Label>
              <Input id="appointment_date" type="date" required value={formData.appointment_date}
                onChange={e => setFormData(p => ({ ...p, appointment_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Time *</Label>
              <Input id="appointment_time" type="time" required value={formData.appointment_time}
                onChange={e => setFormData(p => ({ ...p, appointment_time: e.target.value }))} />
            </div>
            {isEdit && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reason">Reason *</Label>
              <Input id="reason" required placeholder="Reason for appointment" value={formData.reason}
                onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes" value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />{isPending ? 'Saving...' : 'Save Appointment'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/appointments')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
