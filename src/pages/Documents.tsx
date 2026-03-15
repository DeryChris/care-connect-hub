import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload, FileText, Folder, Search, File, Download, Eye, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { mockDocuments } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hasContentPermission, getContentPermissions, getAllowedStatusTransitions, STATUS_LABELS, STATUS_COLORS, type DocumentStatus } from '@/lib/permissions';
import DocumentViewer from './DocumentViewer';

const DocumentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const perPage = 10;

  const canCreate = hasContentPermission(user, 'create', 'document');

  const filteredDocs = useMemo(() => {
    return mockDocuments.filter(doc => {
      const matchSearch = !search || doc.title.toLowerCase().includes(search.toLowerCase()) || doc.filename.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, categoryFilter, statusFilter]);

  const paginatedDocs = filteredDocs.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredDocs.length / perPage);

  const handleDelete = (id: string) => {
    toast({ title: 'Document deleted', description: 'The document has been removed.' });
    setDeleteDialog(null);
  };

  const handleQuickApprove = (docId: string) => {
    toast({ title: 'Document approved', description: 'Document has been published.' });
  };

  const handleQuickReject = (docId: string) => {
    toast({ title: 'Document rejected', description: 'Sent back for revision.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Management</h1>
          <p className="text-sm text-muted-foreground">{filteredDocs.length} documents found</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Link to="/documents/create">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="filter-bar">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="active">Active / Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">{mockDocuments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">{mockDocuments.filter(d => d.status === 'active').length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">{mockDocuments.filter(d => d.status === 'draft').length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <File className="h-6 w-6 text-warning-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">{mockDocuments.reduce((s, d) => s + d.downloads, 0)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Download className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocs.map(doc => {
                const perms = getContentPermissions(user, 'document', doc.uploaded_by);
                const docStatus = (doc.status === 'active' ? 'approved' : doc.status) as DocumentStatus;
                const canApproveThis = getAllowedStatusTransitions(user, docStatus, doc.uploaded_by).includes('approved');
                const canRejectThis = getAllowedStatusTransitions(user, docStatus, doc.uploaded_by).includes('rejected');

                return (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">{doc.filename}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[docStatus] || 'bg-muted'}>{STATUS_LABELS[docStatus] || doc.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{doc.uploaded_at}</p>
                        <p className="text-xs text-muted-foreground">{doc.uploaded_by_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-3 w-3" /> {doc.views}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDocument(doc.id)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {perms.update && (
                          <Link to={`/documents/${doc.id}/edit`}>
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {canApproveThis && docStatus === 'review' && (
                          <Button variant="ghost" size="icon" className="text-success-foreground hover:text-success-foreground" onClick={() => handleQuickApprove(doc.id)} title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {canRejectThis && docStatus === 'review' && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleQuickReject(doc.id)} title="Reject">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        {perms.delete && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteDialog(doc.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-1">No documents found</h3>
                    <p className="text-sm mb-4">Try adjusting your search or filters</p>
                    {canCreate && (
                      <Link to="/documents/create">
                        <Button><Upload className="h-4 w-4 mr-2" /> Upload first document</Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}

      {selectedDocument && (
        <DocumentViewer documentId={selectedDocument} isOpen={!!selectedDocument} onClose={() => setSelectedDocument(null)} />
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this document? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog!)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
