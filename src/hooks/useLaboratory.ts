// src/hooks/useLaboratory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laboratoryService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useLabTests(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['laboratory', params],
    queryFn: () => laboratoryService.list(params),
  });
}

export function useLabTest(id: string) {
  return useQuery({
    queryKey: ['laboratory', id],
    queryFn: () => laboratoryService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateLabTest() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: laboratoryService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['laboratory'] });
      toast({ title: 'Lab test ordered' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateLabStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      laboratoryService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['laboratory'] });
      toast({ title: 'Status updated' });
    },
  });
}

export function useUpdateLabResults() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, results }: { id: string; results: any }) =>
      laboratoryService.updateResults(id, results),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['laboratory'] });
      toast({ title: 'Results recorded' });
    },
  });
}

export function useDeleteLabTest() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => laboratoryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['laboratory'] });
      toast({ title: 'Test removed' });
    },
  });
}
