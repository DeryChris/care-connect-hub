// src/hooks/useDepartments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useDepartments(params?: { active?: boolean }) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentsService.list(params),
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => departmentsService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: departmentsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department created' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department updated' });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => departmentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department deactivated' });
    },
  });
}
