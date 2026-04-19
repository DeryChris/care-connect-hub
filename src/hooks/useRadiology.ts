// src/hooks/useRadiology.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { radiologyService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useRadiologyRequests(params?: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['radiology', params],
    queryFn: () => radiologyService.list(params),
  });
}

export function useRadiologyRequest(id: string) {
  return useQuery({
    queryKey: ['radiology', id],
    queryFn: () => radiologyService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateRadiologyRequest() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: radiologyService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['radiology'] });
      toast({ title: 'Radiology request created' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateRadiologyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      radiologyService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['radiology'] }),
  });
}

export function useUpdateRadiologyReport() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, report }: { id: string; report: { findings: string; impression: string; radiologist_notes?: string } }) =>
      radiologyService.updateReport(id, report),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['radiology'] });
      toast({ title: 'Report saved' });
    },
  });
}

export function useDeleteRadiologyRequest() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => radiologyService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['radiology'] });
      toast({ title: 'Request removed' });
    },
  });
}
