// src/hooks/useDocuments.ts — exact same pattern as useWiki.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useDocuments(params?: {
  search?: string; category?: string; status?: string;
  page?: number; limit?: number;
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn:  () => documentsService.list(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn:  () => documentsService.getOne(id),
    enabled:  !!id,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (formData: FormData) => documentsService.upload(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document created' });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      documentsService.update(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document saved' });
    },
  });
}

export function useUpdateDocumentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      documentsService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => documentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document deleted' });
    },
  });
}