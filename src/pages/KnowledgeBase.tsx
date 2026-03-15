import { useState, useMemo, useEffect } from 'react';
// import Fuse from 'fuse.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Search, BookOpen, FileText, Tag, Eye } from 'lucide-react';
import { mockKnowledgeArticles } from '@/lib/mock-knowledge';
import { KnowledgeArticle } from '@/lib/constants';
import { mockUsers, mockDepartments } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

const KnowledgeBase = () => {
  const { userHasPermission } = useAuth();
  const [articles, setArticles] = useState(mockKnowledgeArticles.filter(a => a.status === 'approved'));
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const searchedArticles = useMemo(() => {
    let filtered = articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      article.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((a: KnowledgeArticle) => a.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a: KnowledgeArticle) => a.status === statusFilter);
    }

    return filtered;
  }, [searchTerm, categoryFilter, statusFilter, articles]);

  const paginated = searchedArticles.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(searchedArticles.length / perPage);

  const categoryStats = articles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getAuthorName = (authorId: string) => mockUsers.find(u => u.id === authorId)?.name || 'Unknown';
  const getDeptName = (deptId?: string) => deptId ? mockDepartments.find(d => d.id === deptId)?.name || 'N/A' : 'N/A';

  const getStatusBadge = (status: string) => {
    const colors = {
      'approved': 'bg-success text-success-foreground',
      'review': 'bg-warning text-warning-foreground',
      'draft': 'bg-muted text-muted-foreground',
      'archived': 'bg-secondary text-secondary-foreground'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-muted'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
          {userHasPermission('author') && (
            <Link to="/knowledge/create">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{articles.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success">
              {articles.filter(a => a.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning">
              {Object.values(categoryStats).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-info">
              {Math.max(...Object.values(articles.reduce((acc: Record<string, number>, a) => {
                if (a.views > (acc[a.author_name] || 0)) {
                  acc[a.author_name] = a.views;
                }
                return acc;
              }, {})), 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Top Views</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search protocols, guidelines, SOPs, drugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
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
              {paginated.map(article => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <Link to={`/knowledge/${article.id}`} className="hover:text-primary">
                      {article.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {article.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getAuthorName(article.author_id)}
                    {article.department_id && (
                      <div className="text-xs text-muted-foreground">
                        {getDeptName(article.department_id)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(article.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Link to={`/knowledge/${article.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No knowledge articles found matching your search.
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
          <span className="px-3 py-1 text-sm text-muted-foreground bg-card rounded-md">
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
    </div>
  );
};

export default KnowledgeBase;

