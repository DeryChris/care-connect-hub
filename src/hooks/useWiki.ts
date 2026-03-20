// src/hooks/useWiki.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wikiService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useWikiPages() {
  return useQuery({
    queryKey: ['wiki'],
    queryFn: () => wikiService.list(),
  });
}

export function useWikiPage(id: string) {
  return useQuery({
    queryKey: ['wiki', id],
    queryFn: () => wikiService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateWikiPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { title: string; content: string }) => wikiService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki'] });
      toast({ title: 'Wiki page created' });
    },
  });
}

export function useUpdateWikiPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; content?: string } }) =>
      wikiService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki'] });
      toast({ title: 'Page saved' });
    },
  });
}

export function useDeleteWikiPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => wikiService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki'] });
      toast({ title: 'Page deleted' });
    },
  });
}
