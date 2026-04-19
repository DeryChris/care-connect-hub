// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function useUsers(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.list(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.getOne(id),
    enabled: !!id,
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersService.me(),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User created successfully' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message || 'Failed to create user', variant: 'destructive' }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User updated successfully' });
    },
    onError: (err: any) =>
      toast({ title: 'Error', description: err?.error?.message || 'Failed to update user', variant: 'destructive' }),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => usersService.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User status updated' });
    },
  });
}

export function useUpdateUserPermissions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      usersService.updatePermissions(id, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Permissions updated' });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User deactivated' });
    },
  });
}
