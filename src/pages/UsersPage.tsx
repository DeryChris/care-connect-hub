// src/pages/UsersPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, UserX, UserCheck } from 'lucide-react';
import { useUsers, useToggleUserActive } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toggleDialog, setToggleDialog] = useState<{ id: string; name: string; active: boolean } | null>(null);

  const { data, isLoading } = useUsers({ search: search || undefined, page, limit: 15 });
  const users = data?.data ?? [];
  const meta = data?.meta;
  const toggleActive = useToggleUserActive();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-muted-foreground">{meta?.total ?? 0} staff members</p>
        </div>
        {isAdmin && (
          <Link to="/users/create">
            <Button><Plus className="h-4 w-4 mr-2" />Add User</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search staff by name or email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  ))
                : users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge></TableCell>
                      <TableCell className="capitalize text-sm">{user.designation?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {user.is_active
                          ? <Badge className="bg-success text-success-foreground">Active</Badge>
                          : <Badge variant="secondary">Inactive</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {isAdmin && (
                            <>
                              <Link to={`/users/${user.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                              </Link>
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 hover:text-warning"
                                onClick={() => setToggleDialog({ id: user.id, name: user.name, active: user.is_active })}
                              >
                                {user.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              }
              {!isLoading && users.length === 0 && (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="px-3 py-1 text-sm text-muted-foreground bg-card rounded-md">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next</Button>
        </div>
      )}

      <Dialog open={!!toggleDialog} onOpenChange={() => setToggleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{toggleDialog?.active ? 'Deactivate' : 'Activate'} User</DialogTitle>
            <DialogDescription>
              {toggleDialog?.active
                ? `This will prevent ${toggleDialog?.name} from logging in.`
                : `This will allow ${toggleDialog?.name} to log in again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleDialog(null)}>Cancel</Button>
            <Button
              variant={toggleDialog?.active ? 'destructive' : 'default'}
              onClick={() => {
                if (toggleDialog) {
                  toggleActive.mutate(toggleDialog.id, { onSuccess: () => setToggleDialog(null) });
                }
              }}
            >
              {toggleDialog?.active ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
