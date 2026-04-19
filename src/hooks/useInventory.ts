// src/hooks/useInventory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useInventory(params?: {
  search?: string;
  category?: string;
  low_stock?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.list(params),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryService.getOne(id),
    enabled: !!id,
  });
}

export function useInventoryTransactions(id: string) {
  return useQuery({
    queryKey: ['inventory', id, 'transactions'],
    queryFn: () => inventoryService.getTransactions(id),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: inventoryService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Item added to inventory' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => inventoryService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Item updated' });
    },
  });
}

export function useProcessInventoryTransaction() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      id, type, quantity, unit_price, reference, notes,
    }: {
      id: string;
      type: 'in' | 'out' | 'adjustment';
      quantity: number;
      unit_price?: number;
      reference?: string;
      notes?: string;
    }) => inventoryService.processTransaction(id, type, quantity, unit_price, reference, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Transaction recorded' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => inventoryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Item deactivated' });
    },
  });
}
