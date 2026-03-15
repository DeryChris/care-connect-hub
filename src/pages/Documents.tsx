import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Folder, Search, File, Download, Eye, Trash2 } from 'lucide-react';
import { mockDocuments } from '@/lib/mock-data';
import DocumentViewer from './DocumentViewer';
import { useAuth } from '@/contexts/AuthContext';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const perPage = 10;

  const isReviewer = user?.role === 'admin' || user?.designation === 'doctor';
  const isAuthor = user?.role === 'admin' || user?.designation === 'doctor' || user?.designation === 'nurse';

  const filteredDocs = useMemo(() => {
    return mockDocuments.filter(doc => {
      const matchSearch = !search || doc.title.toLowerCase().includes(search.toLowerCase()) || doc.filename.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      
      let matchStatus = false;
      if (statusFilter === 'all') {
        if (isReviewer) {
          matchStatus = true;
        } else {
          matchStatus = doc.status === 'approved';
        }
      } else {
        matchStatus = doc.status === statusFilter;
      }

      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, categoryFilter, statusFilter, isReviewer]);

  const paginatedDocs = filteredDocs.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredDocs.length / perPage);

  const openDocument = (id: string) => {
    setSelectedDocument(id);
  };

  const closeDocument = () => {
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Management</h1>
          <p className="text-sm text-muted-foreground">{filteredDocs.length} documents found</p>
        </div>
        <div className="flex gap-2">
          {isAuthor && (
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
          <Button variant="outline">
            <Folder className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="filter-bar">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search documents by title or filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="protocol">Protocols</SelectItem>
                <SelectItem value="guideline">Guidelines</SelectItem>
                <SelectItem value="manual">Manuals</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">{filteredDocs.length}</p>
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
                <p className="text-sm text-muted-foreground">Protocols</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">24</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <File className="h-6 w-6 text-success-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">2.4 GB</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Download className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="mt-1 text-2xl font-bold font-display text-foreground">2 hours ago</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocs.map(doc => (
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
                  <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.uploaded_at}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : doc.status === 'pending_approval' ? 'secondary' : 'outline'} className={doc.status === 'pending_approval' ? 'bg-warning text-warning-foreground' : ''}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDocument(doc.id)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-1">No documents found</h3>
                    <p className="text-sm mb-4">Try adjusting your search or filters</p>
                    {isAuthor && (
                        <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload first document
                        </Button>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {selectedDocument && (
        <DocumentViewer 
          documentId={selectedDocument} 
          isOpen={!!selectedDocument} 
          onClose={closeDocument} 
        />
      )}
    </div>
  );
};

export default DocumentsPage;
