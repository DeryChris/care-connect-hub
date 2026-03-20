// src/pages/KnowledgeBase.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Eye, Edit, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hasContentPermission, STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';
import { useKnowledgeArticles, useUpdateKnowledgeStatus } from '@/hooks';
import { useComments } from '@/hooks';

const categoryColors: Record<string, string> = {
  protocol: 'bg-primary/10 text-primary',
  guideline: 'bg-info/10 text-info',
  sop: 'bg-warning/10 text-warning-foreground',
  drug_info: 'bg-destructive/10 text-destructive',
  training: 'bg-success/10 text-success-foreground',
};

// Small helper to show comment count per article row
const CommentCount = ({ articleId }: { articleId: string }) => {
  const { data } = useComments('knowledge', articleId);
  const count = data?.data?.length ?? 0;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <MessageSquare className="h-3 w-3" />
      <span>{count}</span>
    </div>
  );
};

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const { data, isLoading } = useKnowledgeArticles({
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: perPage,
  });

  const articles = data?.data ?? [];
  const meta = data?.meta;

  const canCreate = hasContentPermission(user, 'create', 'knowledge');
  const updateStatus = useUpdateKnowledgeStatus();

  const handleStatusChange = (articleId: string, nextStatus: 'approved' | 'rejected') => {
    updateStatus.mutate({ id: articleId, status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            {meta?.total ?? 0} articles
          </p>
        </div>
        {canCreate && (
          <Link to="/knowledge/create">
            <Button><BookOpen className="h-4 w-4 mr-2" />New Article</Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-12 w-full" /></CardContent></Card>)
          : [
              { label: 'Total Articles', value: meta?.total ?? 0, color: 'text-primary' },
              { label: 'Approved', value: articles.filter(a => a.status === 'approved').length, color: 'text-success' },
              { label: 'Pending Review', value: articles.filter(a => a.status === 'review').length, color: 'text-warning' },
              { label: 'Total Views', value: articles.reduce((s, a) => s + (a.views ?? 0), 0), color: 'text-info' },
            ].map(stat => (
              <Card key={stat.label}><CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent></Card>
            ))
        }
      </div>

      {/* Filters */}
      <Card><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search protocols, guidelines, SOPs..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))
              : articles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Link to={`/knowledge/${article.id}`} className="font-medium hover:text-primary line-clamp-2">
                        {article.title}
                      </Link>
                      {article.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {article.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${categoryColors[article.category] || 'bg-muted text-muted-foreground'}`}>
                        {article.category.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{article.author_name}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[article.status as keyof typeof STATUS_COLORS] || ''}>
                        {STATUS_LABELS[article.status as keyof typeof STATUS_LABELS] || article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{article.views ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CommentCount articleId={article.id} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Link to={`/knowledge/${article.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {hasContentPermission(user, 'update', 'knowledge', article.author_id) && (
                          <Link to={`/knowledge/${article.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                        {article.status === 'review' && hasContentPermission(user, 'approve', 'knowledge') && (
                          <>
                            <Button
                              size="icon" variant="ghost" className="h-8 w-8 text-success"
                              onClick={() => handleStatusChange(article.id, 'approved')}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                              onClick={() => handleStatusChange(article.id, 'rejected')}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            }
            {!isLoading && articles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No articles found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="px-3 py-1 text-sm text-muted-foreground bg-card rounded-md">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
