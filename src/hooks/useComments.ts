// src/hooks/useComments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useComments(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ['comments', targetType, targetId],
    queryFn: () => commentsService.list(targetType, targetId),
    enabled: !!targetType && !!targetId,
  });
}

export function usePostComment(targetType: string, targetId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (message: string) => commentsService.create(targetType, targetId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', targetType, targetId] });
      toast({ title: 'Comment added', description: 'Your comment is now visible to other readers.' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useDeleteComment(targetType: string, targetId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => commentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', targetType, targetId] });
      toast({ title: 'Comment deleted' });
    },
  });
}
