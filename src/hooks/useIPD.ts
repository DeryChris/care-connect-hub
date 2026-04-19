// src/hooks/useIPD.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ipdService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useIPDAdmissions(params?: {
  search?: string;
  status?: string;
  department_id?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['ipd', params],
    queryFn: () => ipdService.list(params),
  });
}

export function useIPDAdmission(id: string) {
  return useQuery({
    queryKey: ['ipd', id],
    queryFn: () => ipdService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateIPDAdmission() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ipdService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ipd'] });
      toast({ title: 'Patient admitted' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateIPDAdmission() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ipdService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ipd'] });
      toast({ title: 'Admission updated' });
    },
  });
}

export function useDischargePatient() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, discharge_date, notes }: { id: string; discharge_date?: string; notes?: string }) =>
      ipdService.discharge(id, discharge_date, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ipd'] });
      toast({ title: 'Patient discharged successfully' });
    },
  });
}
