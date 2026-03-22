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
    mutationFn: ({ message, parentId }: { message: string; parentId?: string }) =>
      commentsService.create(targetType, targetId, message, parentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', targetType, targetId] });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message, variant: 'destructive' }),
  });
}

export function useToggleLike(targetType: string, targetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsService.toggleLike(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', targetType, targetId] });
    },
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