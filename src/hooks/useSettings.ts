// src/hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services';

export function useApiSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.list(),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string | boolean | number }) =>
      settingsService.update(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
