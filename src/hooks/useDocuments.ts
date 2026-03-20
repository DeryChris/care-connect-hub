// src/hooks/useDocuments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useDocuments(params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsService.list(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsService.getOne(id),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (formData: FormData) => documentsService.upload(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document uploaded successfully' });
    },
    onError: (err: any) =>
      toast({ title: 'Upload failed', description: err?.error?.message, variant: 'destructive' }),
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
      toast({ title: 'Document updated' });
    },
  });
}

export function useUpdateDocumentStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      documentsService.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      const msg =
        status === 'approved' ? 'Document approved' :
        status === 'rejected' ? 'Document rejected' : 'Status updated';
      toast({ title: msg });
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
      toast({ title: 'Document archived' });
    },
  });
}
