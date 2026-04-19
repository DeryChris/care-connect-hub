// src/hooks/usePharmacy.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmacyService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function usePharmacyItems(params?: {
  search?: string;
  category?: string;
  low_stock?: boolean;
  expiring_soon?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['pharmacy', params],
    queryFn: () => pharmacyService.list(params),
  });
}

export function usePharmacyItem(id: string) {
  return useQuery({
    queryKey: ['pharmacy', id],
    queryFn: () => pharmacyService.getOne(id),
    enabled: !!id,
  });
}

export function useCreatePharmacyItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: pharmacyService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pharmacy'] });
      toast({ title: 'Item added to pharmacy' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdatePharmacyItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => pharmacyService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pharmacy'] });
      toast({ title: 'Item updated' });
    },
  });
}

export function useAdjustPharmacyStock() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, quantity, type }: { id: string; quantity: number; type: 'in' | 'out' | 'adjustment' }) =>
      pharmacyService.adjustStock(id, quantity, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pharmacy'] });
      toast({ title: 'Stock updated' });
    },
  });
}

export function useDeletePharmacyItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => pharmacyService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pharmacy'] });
      toast({ title: 'Item deactivated' });
    },
  });
}
