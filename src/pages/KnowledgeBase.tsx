import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Search, BookOpen, FileText, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';
import { mockKnowledgeArticles } from '@/lib/mock-knowledge';
import { KnowledgeArticle } from '@/lib/constants';
import { mockUsers, mockDepartments } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hasContentPermission, getContentPermissions, getAllowedStatusTransitions, STATUS_LABELS, STATUS_COLORS, type DocumentStatus } from '@/lib/permissions';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles] = useState(mockKnowledgeArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const canCreate = hasContentPermission(user, 'create', 'knowledge');

  const searchedArticles = useMemo(() => {
    let filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      article.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (categoryFilter !== 'all') filtered = filtered.filter((a: KnowledgeArticle) => a.category === categoryFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((a: KnowledgeArticle) => a.status === statusFilter);
    return filtered;
  }, [searchTerm, categoryFilter, statusFilter, articles]);

  const paginated = searchedArticles.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(searchedArticles.length / perPage);

  const getAuthorName = (authorId: string) => mockUsers.find(u => u.id === authorId)?.name || 'Unknown';
  const getDeptName = (deptId?: string) => deptId ? mockDepartments.find(d => d.id === deptId)?.name || 'N/A' : 'N/A';

  const handleQuickApprove = (articleId: string) => {
    toast({ title: 'Article approved', description: 'Published to Knowledge Base.' });
  };
  const handleQuickReject = (articleId: string) => {
    toast({ title: 'Article rejected', description: 'Sent back for revision.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            {articles.length} articles | {searchedArticles.length} matching
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Link to="/knowledge/create">
              <Button><BookOpen className="h-4 w-4 mr-2" /> New Article</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{articles.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success">{articles.filter(a => a.status === 'approved').length}</div>
            <p className="text-sm text-muted-foreground mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning">{articles.filter(a => a.status === 'review').length}</div>
            <p className="text-sm text-muted-foreground mt-1">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-info">{articles.reduce((s, a) => s + a.views, 0)}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Views</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search protocols, guidelines, SOPs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="protocol">Protocols</SelectItem>
                <SelectItem value="guideline">Guidelines</SelectItem>
                <SelectItem value="sop">SOPs</SelectItem>
                <SelectItem value="drug_info">Drug Info</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(article => {
                const perms = getContentPermissions(user, 'knowledge', article.author_id);
                const artStatus = article.status as DocumentStatus;
                const transitions = getAllowedStatusTransitions(user, artStatus, article.author_id);
                const canApproveThis = transitions.includes('approved');
                const canRejectThis = transitions.includes('rejected');

                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <Link to={`/knowledge/${article.id}`} className="hover:text-primary">{article.title}</Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{article.category.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getAuthorName(article.author_id)}
                      {article.department_id && <div className="text-xs text-muted-foreground">{getDeptName(article.department_id)}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[artStatus] || 'bg-muted'}>{STATUS_LABELS[artStatus] || article.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(article.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/knowledge/${article.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View"><FileText className="h-3.5 w-3.5" /></Button>
                        </Link>
                        {perms.update && (
                          <Link to={`/knowledge/${article.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"><Edit className="h-3.5 w-3.5" /></Button>
                          </Link>
                        )}
                        {canApproveThis && artStatus === 'review' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success-foreground" onClick={() => handleQuickApprove(article.id)} title="Approve">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canRejectThis && artStatus === 'review' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleQuickReject(article.id)} title="Reject">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No knowledge articles found matching your search.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="px-3 py-1 text-sm text-muted-foreground bg-card rounded-md">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
