// src/hooks/useReports.ts
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services';

export function useOverviewReport() {
  return useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: () => reportsService.overview(),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () => reportsService.inventory(),
  });
}

export function useBillingReport(range?: string) {
  return useQuery({
    queryKey: ['reports', 'billing', range],
    queryFn: () => reportsService.billing(range),
  });
}

export function useStaffReport() {
  return useQuery({
    queryKey: ['reports', 'staff'],
    queryFn: () => reportsService.staff(),
  });
}
