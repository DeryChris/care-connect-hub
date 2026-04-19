// src/hooks/useOPD.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opdService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useOPDVisits(params?: {
  search?: string;
  status?: string;
  department_id?: string;
  date?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['opd', params],
    queryFn: () => opdService.list(params),
  });
}

export function useOPDVisit(id: string) {
  return useQuery({
    queryKey: ['opd', id],
    queryFn: () => opdService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateOPDVisit() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: opdService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opd'] });
      toast({ title: 'OPD visit recorded' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateOPDVisit() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => opdService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opd'] });
      toast({ title: 'Visit updated' });
    },
  });
}

export function useUpdateOPDStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      opdService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opd'] }),
  });
}

export function useUpdateOPDVitals() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, vitals }: { id: string; vitals: any }) =>
      opdService.updateVitals(id, vitals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opd'] });
      toast({ title: 'Vitals updated' });
    },
  });
}
