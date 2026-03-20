// src/pages/Documents.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, Search, File, Download, Eye, Trash2, Edit, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasContentPermission, getContentPermissions, getAllowedStatusTransitions, STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';
import { useDocuments, useUpdateDocumentStatus, useDeleteDocument } from '@/hooks';
import { useComments } from '@/hooks';
import DocumentViewer from './DocumentViewer';

// Small inline comment count component
const CommentCount = ({ docId }: { docId: string }) => {
  const { data } = useComments('document', docId);
  const count = data?.data?.length ?? 0;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <MessageSquare className="h-3 w-3" />
      <span>{count}</span>
    </div>
  );
};

const DocumentsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const perPage = 10;

  const { data, isLoading } = useDocuments({
    search: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: perPage,
  });

  const docs = data?.data ?? [];
  const meta = data?.meta;

  const canCreate = hasContentPermission(user, 'create', 'document');
  const updateStatus = useUpdateDocumentStatus();
  const deleteDoc = useDeleteDocument();

  const getMimeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('word')) return '📝';
    return '📁';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Management</h1>
          <p className="text-sm text-muted-foreground">{meta?.total ?? 0} documents</p>
        </div>
        {canCreate && (
          <Link to="/documents/create">
            <Button><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Documents', value: meta?.total ?? 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Approved', value: docs.filter(d => d.status === 'approved').length, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending Review', value: docs.filter(d => d.status === 'review').length, icon: File, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Total Downloads', value: docs.reduce((s, d) => s + (d.downloads ?? 0), 0), icon: Download, color: 'text-info', bg: 'bg-info/10' },
        ].map(stat => (
          <Card key={stat.label} className="stat-card"><CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold font-display">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <Card><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="protocol">Protocols</SelectItem>
              <SelectItem value="guideline">Guidelines</SelectItem>
              <SelectItem value="sop">SOPs</SelectItem>
              <SelectItem value="manual">Manuals</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      {/* Table */}
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead>Document</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              : docs.map(doc => {
                  const perms = getContentPermissions(user, 'document', doc.uploaded_by);
                  const docStatus = doc.status as any;
                  const transitions = getAllowedStatusTransitions(user, docStatus, doc.uploaded_by);

                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shrink-0">{getMimeIcon(doc.mime_type)}</span>
                          <div>
                            <button
                              onClick={() => setSelectedDocId(doc.id)}
                              className="font-medium text-sm hover:text-primary text-left line-clamp-1"
                            >
                              {doc.title}
                            </button>
                            <p className="text-xs text-muted-foreground">{doc.filename} · {doc.size}</p>
                            {doc.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {doc.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{doc.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[docStatus] || ''}>{STATUS_LABELS[docStatus] || docStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{doc.uploaded_by_name}</div>
                        <div className="text-muted-foreground text-xs">{new Date(doc.uploaded_at).toLocaleDateString('en-GB')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{doc.views ?? 0} views</div>
                          <div className="flex items-center gap-1"><Download className="h-3 w-3" />{doc.downloads ?? 0} downloads</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CommentCount docId={doc.id} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDocId(doc.id)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {perms.update && (
                            <Link to={`/documents/${doc.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                            </Link>
                          )}
                          {transitions.includes('approved') && docStatus === 'review' && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-success"
                              onClick={() => updateStatus.mutate({ id: doc.id, status: 'approved' })}>
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {transitions.includes('rejected') && docStatus === 'review' && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                              onClick={() => updateStatus.mutate({ id: doc.id, status: 'rejected' })}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {perms.delete && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive"
                              onClick={() => setDeleteDialog(doc.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
            }
            {!isLoading && docs.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No documents found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="px-3 py-1 text-sm text-muted-foreground bg-card rounded-md">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next</Button>
        </div>
      )}

      {/* Document Viewer */}
      {selectedDocId && (
        <DocumentViewer
          documentId={selectedDocId}
          isOpen={!!selectedDocId}
          onClose={() => setSelectedDocId(null)}
        />
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Document</DialogTitle>
            <DialogDescription>This will archive the document. It can be restored by an admin.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteDialog) deleteDoc.mutate(deleteDialog, { onSuccess: () => setDeleteDialog(null) });
            }}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
