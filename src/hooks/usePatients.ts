// src/hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function usePatients(params?: {
  search?: string;
  department_id?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientsService.list(params),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsService.getOne(id),
    enabled: !!id,
  });
}

export function usePatientTimeline(id: string) {
  return useQuery({
    queryKey: ['patients', id, 'timeline'],
    queryFn: () => patientsService.timeline(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: patientsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      toast({ title: 'Patient saved successfully' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message || 'Failed to save patient', variant: 'destructive' }),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => patientsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      toast({ title: 'Patient updated successfully' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => patientsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      toast({ title: 'Patient record deactivated' });
    },
  });
}
