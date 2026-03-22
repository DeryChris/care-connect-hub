// src/hooks/useKnowledge.ts — exact same pattern as useWiki.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useKnowledgeArticles(params?: {
  search?: string; category?: string; status?: string;
  page?: number; limit?: number;
}) {
  return useQuery({
    queryKey: ['knowledge', params],
    queryFn:  () => knowledgeService.list(params),
  });
}

export function useKnowledgeArticle(id: string) {
  return useQuery({
    queryKey: ['knowledge', id],
    queryFn:  () => knowledgeService.getOne(id),
    enabled:  !!id,
  });
}

export function useCreateKnowledgeArticle() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Parameters<typeof knowledgeService.create>[0]) =>
      knowledgeService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
      toast({ title: 'Article created' });
    },
  });
}

export function useUpdateKnowledgeArticle() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      knowledgeService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
      toast({ title: 'Article saved' });
    },
  });
}

export function useUpdateKnowledgeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      knowledgeService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
}

export function useDeleteKnowledgeArticle() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => knowledgeService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
      toast({ title: 'Article deleted' });
    },
  });
}