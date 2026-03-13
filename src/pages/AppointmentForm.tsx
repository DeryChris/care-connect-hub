import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { mockPatients, mockDepartments, mockUsers } from '@/lib/mock-data';
import { APPOINTMENT_TYPES } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const doctors = mockUsers.filter(u => u.designation === 'doctor' && u.is_active);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    department_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'consultation' as 'consultation' | 'followup' | 'emergency' | 'checkup',
    reason: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    setFormData(prev => ({ 
      ...prev, 
      doctor_id: doctorId,
      department_id: doctor?.department_id || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    toast({
      title: "Appointment saved",
      description: "The appointment has been scheduled successfully.",
      variant: "default",
    });
    navigate('/appointments');
  };

  const getPatientName = (id: string) => mockPatients.find(p => p.id === id)?.name || '';
  const getDepartmentName = (id: string) => mockDepartments.find(d => d.id === id)?.name || '';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/appointments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">New Appointment</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={formData.patient_id} onValueChange={(v) => setFormData(prev => ({ ...prev, patient_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.filter(p => p.is_active).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Doctor *</Label>
              <Select value={formData.doctor_id} onValueChange={handleDoctorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} {d.specialization && `(${d.specialization})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={getDepartmentName(formData.department_id)} disabled />
            </div>
            <div className="space-y-2">
              <Label>Appointment Type *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as typeof formData.type }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date *</Label>
              <Input id="appointment_date" type="date" required value={formData.appointment_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Time *</Label>
              <Input id="appointment_time" type="time" required value={formData.appointment_time} onChange={handleChange} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Textarea id="reason" required placeholder="Enter reason for appointment" value={formData.reason} onChange={handleChange} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes (optional)" value={formData.notes} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as typeof formData.status }))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />Save Appointment
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/appointments')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;

