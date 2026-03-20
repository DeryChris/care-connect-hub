// src/hooks/useKnowledge.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useKnowledgeArticles(params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['knowledge', params],
    queryFn: () => knowledgeService.list(params),
  });
}

export function useKnowledgeArticle(id: string) {
  return useQuery({
    queryKey: ['knowledge', id],
    queryFn: () => knowledgeService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateKnowledgeArticle() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: knowledgeService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
      toast({ title: 'Article saved' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useUpdateKnowledgeArticle() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => knowledgeService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
      qc.invalidateQueries({ queryKey: ['knowledge', id] });
      toast({ title: 'Article updated' });
    },
  });
}

export function useUpdateKnowledgeStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      knowledgeService.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
      const msg =
        status === 'approved' ? 'Article approved' :
        status === 'rejected' ? 'Article rejected' : 'Status updated';
      toast({ title: msg });
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
      toast({ title: 'Article archived' });
    },
  });
}
