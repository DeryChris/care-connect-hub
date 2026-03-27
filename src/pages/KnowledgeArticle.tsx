// src/pages/KnowledgeArticle.tsx
// Uses MDEditor's preview mode for rendering — gives the same rich styling
// as the editor (code blocks, tables, syntax highlighting) and ensures
// create/edit/view all look identical.

import { Link, useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Eye, Clock, User, Tag, BookOpen, Edit, CheckCircle, XCircle, Archive, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasContentPermission, getAllowedStatusTransitions, STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';
import { useKnowledgeArticle, useUpdateKnowledgeStatus, useKnowledgeArticles } from '@/hooks';
import CommentsSection from '@/components/content/CommentsSection';
import { useToast } from '@/hooks/use-toast';

const categoryColors: Record<string, string> = {
  protocol:  'bg-primary/10 text-primary',
  guideline: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  sop:       'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  drug_info: 'bg-red-500/10 text-red-600 dark:text-red-400',
  training:  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  administrative:  'bg-red-500/10 text-emerald-700 dark:text-emerald-400',
};

const KnowledgeArticlePage = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { toast }    = useToast();

  const { data, isLoading } = useKnowledgeArticle(id ?? '');
  const article = data?.data;

  const { data: relatedData } = useKnowledgeArticles({
    category: article?.category,
    status: 'approved',
    limit: 5,
  });
  const related = (relatedData?.data ?? []).filter(a => a.id !== id).slice(0, 4);

  const updateStatus = useUpdateKnowledgeStatus();

  const changeStatus = (newStatus: string) => {
    if (!article) return;
    updateStatus.mutate(
      { id: article.id, status: newStatus },
      {
        onSuccess: () => toast({ title: `Article ${STATUS_LABELS[newStatus as any] ?? newStatus}` }),
        onError:   () => toast({ title: 'Update failed', variant: 'destructive' }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Article not found</h2>
        <p className="text-muted-foreground">This article doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/knowledge')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const canEdit    = hasContentPermission(user, 'update', 'knowledge', article.author_id);
  const canApprove = hasContentPermission(user, 'approve', 'knowledge');
  const artStatus  = article.status as any;
  const transitions = getAllowedStatusTransitions(user, artStatus, article.author_id);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/knowledge" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />Knowledge Base
        </Link>
        <span>/</span>
        <span className="capitalize">{article.category.replace('_', ' ')}</span>
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
                    <Badge className={STATUS_COLORS[artStatus] || ''}>
                      {STATUS_LABELS[artStatus] || artStatus}
                    </Badge>
                    <span className="text-xs text-muted-foreground">v{article.version}</span>
                  </div>
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {article.title}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {canEdit && (
                    <Link to={`/knowledge/${article.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3.5 w-3.5 mr-1.5" />Edit
                      </Button>
                    </Link>
                  )}
                  {transitions.includes('approved') && artStatus === 'review' && canApprove && (
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground"
                      onClick={() => changeStatus('approved')}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve
                    </Button>
                  )}
                  {transitions.includes('rejected') && artStatus === 'review' && canApprove && (
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30"
                      onClick={() => changeStatus('rejected')}>
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
                    </Button>
                  )}
                  {transitions.includes('draft') && (artStatus === 'review' || artStatus === 'rejected') && (
                    <Button variant="outline" size="sm" onClick={() => changeStatus('draft')}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Return to Draft
                    </Button>
                  )}
                  {transitions.includes('archived') && artStatus === 'approved' && (
                    <Button variant="outline" size="sm" onClick={() => changeStatus('archived')}>
                      <Archive className="h-3.5 w-3.5 mr-1.5" />Archive
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /><span>{article.author_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(article.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /><span>{article.views ?? 0} views</span>
                </div>
              </div>

              {article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {article.tags.map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article body — MDEditor preview mode */}
          <Card>
            <CardContent className="p-2 md:p-4">
              {/* data-color-mode tells MDEditor to match the page theme */}
              <div data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
                <MDEditor.Markdown
                  source={article.content}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    padding: '16px',
                    fontSize: '14px',
                    lineHeight: '1.7',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <CommentsSection targetId={article.id} targetType="knowledge" title="Reader Comments" />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={STATUS_COLORS[artStatus] || ''} style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {STATUS_LABELS[artStatus] || artStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {related.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Articles</p>
                <div className="space-y-2">
                  {related.map(rel => (
                    <Link key={rel.id} to={`/knowledge/${rel.id}`} className="block p-2 rounded-lg hover:bg-muted transition-colors">
                      <p className="text-sm font-medium line-clamp-2 hover:text-primary">{rel.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={STATUS_COLORS[rel.status as any] || ''} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {STATUS_LABELS[rel.status as any] || rel.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" />{rel.views ?? 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Knowledge Base
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeArticlePage;