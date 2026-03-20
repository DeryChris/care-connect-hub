// src/hooks/useBilling.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useBillingInvoices(params?: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['billing', params],
    queryFn: () => billingService.list(params),
  });
}

export function useBillingInvoice(id: string) {
  return useQuery({
    queryKey: ['billing', id],
    queryFn: () => billingService.getOne(id),
    enabled: !!id,
  });
}

export function useBillingSummary() {
  return useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingService.summary(),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: billingService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast({ title: 'Invoice created' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => billingService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast({ title: 'Invoice updated' });
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      billingService.recordPayment(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast({ title: 'Payment recorded' });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => billingService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast({ title: 'Invoice cancelled' });
    },
  });
}
