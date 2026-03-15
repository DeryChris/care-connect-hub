import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Eye, Clock, User, Tag, BookOpen, Edit, CheckCircle } from 'lucide-react';
import { mockKnowledgeArticles } from '@/lib/mock-knowledge';
import { mockUsers, mockDepartments } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

const statusColors: Record<string, string> = {
  approved: 'bg-success text-success-foreground',
  review: 'bg-warning text-warning-foreground',
  draft: 'bg-muted text-muted-foreground',
  archived: 'bg-secondary text-secondary-foreground',
};

const categoryColors: Record<string, string> = {
  protocol: 'bg-primary/10 text-primary',
  guideline: 'bg-info/10 text-info',
  sop: 'bg-warning/10 text-warning-foreground',
  drug_info: 'bg-destructive/10 text-destructive',
  training: 'bg-success/10 text-success-foreground',
};

const KnowledgeArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const article = mockKnowledgeArticles.find(a => a.id === id);
  const author = article ? mockUsers.find(u => u.id === article.author_id) : null;
  const department = article?.department_id ? mockDepartments.find(d => d.id === article.department_id) : null;

  // Related articles: same category, exclude current
  const related = article
    ? mockKnowledgeArticles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 4)
    : [];

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Article not found</h2>
        <p className="text-muted-foreground">The article you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/knowledge')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Knowledge Base
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/knowledge" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Knowledge Base
        </Link>
        <span>/</span>
        <span className="capitalize">{article.category}</span>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{article.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <div className="space-y-4">
          {/* Header card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${categoryColors[article.category] || 'bg-muted text-muted-foreground'}`}>
                      {article.category.replace('_', ' ')}
                    </span>
                    <Badge className={statusColors[article.status] || 'bg-muted'}>
                      {article.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">v{article.version}</span>
                  </div>
                  <h1 className="text-2xl font-bold font-display">{article.title}</h1>
                </div>
                {(isAdmin || author?.id === '1') && (
                  <Link to={`/knowledge/${article.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{author?.name || article.author_name}</span>
                  {department && <span className="text-xs">· {department.name}</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(article.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{article.views} views</span>
                </div>
              </div>

              {article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {article.tags.map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article content rendered as markdown */}
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none
                prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-foreground prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-ul:my-2 prose-li:my-0.5
                prose-ol:my-2
                prose-table:w-full prose-table:text-sm
                prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50
                prose-td:p-2 prose-td:border prose-td:text-foreground
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              ">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About this article</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(article.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span>{new Date(article.updated_at).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>v{article.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span>{article.views}</span>
                </div>
                {department && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span>{department.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related articles */}
          {related.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Articles</p>
                <div className="space-y-2">
                  {related.map(rel => (
                    <Link
                      key={rel.id}
                      to={`/knowledge/${rel.id}`}
                      className="block p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-2 hover:text-primary">{rel.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusColors[rel.status] || ''} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {rel.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" /> {rel.views}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Knowledge Base
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeArticlePage;
