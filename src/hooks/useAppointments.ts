// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useAppointments(params?: {
  search?: string;
  status?: string;
  doctor_id?: string;
  date?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentsService.list(params),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentsService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: appointmentsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Appointment scheduled' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => appointmentsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Appointment updated' });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentsService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => appointmentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Appointment removed' });
    },
  });
}
