// src/pages/KMSDashboard.tsx
// Centralized KMS review/approval dashboard for doctors, admins, and admin_staff.
// Shows all knowledge articles, documents, and wiki pages pending review/approval
// in one place — the reviewer can approve, reject, or return to draft inline.

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle, XCircle, RotateCcw, BookOpen, FileText,
  PenLine, Clock, User, Eye, ChevronDown, ChevronUp, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  useKnowledgeArticles, useUpdateKnowledgeStatus,
  useDocuments, useUpdateDocumentStatus,
  useWikiPages, useUpdateWikiPage,
} from '@/hooks';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';

// ── Small expandable content preview ─────────────────────────────────────────
const ContentPreview = ({ content, label }: { content: string; label?: string }) => {
  const [open, setOpen] = useState(false);
  if (!content) return null;
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? 'Hide' : 'Preview'} {label ?? 'content'}
      </button>
      {open && (
        <div className="mt-2 rounded-lg border bg-muted/20 p-4 prose prose-sm max-w-none
          prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground
          prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
          prose-table:w-full prose-th:border prose-th:p-2 prose-th:bg-muted/50 prose-td:border prose-td:p-2">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

// ── Reusable review action bar ────────────────────────────────────────────────
const ReviewActions = ({
  onApprove, onReject, onReturnDraft, isPending, canApprove, currentStatus,
}: {
  onApprove: () => void;
  onReject: () => void;
  onReturnDraft: () => void;
  isPending: boolean;
  canApprove: boolean;
  currentStatus: string;
}) => (
  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
    {canApprove && currentStatus === 'review' && (
      <>
        <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground"
          onClick={onApprove} disabled={isPending}>
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve
        </Button>
        <Button size="sm" variant="outline" className="text-destructive border-destructive/30"
          onClick={onReject} disabled={isPending}>
          <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
        </Button>
      </>
    )}
    <Button size="sm" variant="outline" onClick={onReturnDraft} disabled={isPending}>
      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Return to Draft
    </Button>
  </div>
);

// ── Main dashboard ────────────────────────────────────────────────────────────
const KMSDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const canApprove = !!(user?.role === 'admin' || ['doctor', 'admin_staff'].includes(user?.designation ?? ''));
  const canReview  = !!(user?.role === 'admin' || ['doctor', 'admin_staff', 'pharmacist'].includes(user?.designation ?? ''));

  // ── Data — fetch all pending items ─────────────────────────────────────────
  const { data: artData,  isLoading: artLoading  } = useKnowledgeArticles({ status: 'review', limit: 100 });
  const { data: docData,  isLoading: docLoading  } = useDocuments({ status: 'review', limit: 100 });
  const { data: wikiData, isLoading: wikiLoading } = useWikiPages();

  const articles  = artData?.data  ?? [];
  const documents = docData?.data  ?? [];
  // Wiki pages don't have a review status — show recently updated ones as FYI
  const wikiPages = wikiData?.data ?? [];

  const updateArtStatus  = useUpdateKnowledgeStatus();
  const updateDocStatus  = useUpdateDocumentStatus();
  const updateWikiPage   = useUpdateWikiPage();

  const artStatus  = (id: string, status: string) =>
    updateArtStatus.mutate({ id, status }, { onSuccess: () => toast({ title: `Article ${STATUS_LABELS[status as any] ?? status}` }) });

  const docStatus  = (id: string, status: string) =>
    updateDocStatus.mutate({ id, status }, { onSuccess: () => toast({ title: `Document ${STATUS_LABELS[status as any] ?? status}` }) });

  const totalPending = articles.length + documents.length;

  if (!canReview) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <ShieldCheck className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-lg font-semibold">Access Restricted</p>
        <p className="text-muted-foreground text-sm">This dashboard is for designated reviewers and approvers only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">KMS Review Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {totalPending} item{totalPending !== 1 ? 's' : ''} pending review across all knowledge modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canApprove && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Approver
            </Badge>
          )}
          {canReview && !canApprove && (
            <Badge variant="secondary" className="text-xs px-3 py-1">
              Reviewer
            </Badge>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Articles Pending', value: articles.length, icon: BookOpen, color: 'text-primary' },
          { label: 'Documents Pending', value: documents.length, icon: FileText, color: 'text-info' },
          { label: 'Wiki Pages', value: wikiPages.length, icon: PenLine, color: 'text-warning' },
          { label: 'Total Pending', value: totalPending, icon: Clock, color: 'text-destructive' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`rounded-xl p-2.5 bg-current/10 ${stat.color.replace('text-', 'bg-').replace('-foreground','')}`} style={{ backgroundColor: 'hsl(var(--muted))' }}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles" className="gap-2">
            <BookOpen className="h-4 w-4" />Articles
            {articles.length > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-primary text-primary-foreground">{articles.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />Documents
            {documents.length > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-primary text-primary-foreground">{documents.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="wiki" className="gap-2">
            <PenLine className="h-4 w-4" />Wiki
          </TabsTrigger>
        </TabsList>

        {/* ── ARTICLES TAB ── */}
        <TabsContent value="articles" className="mt-4 space-y-3">
          {artLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
            : articles.length === 0 ? (
              <Card><CardContent className="p-10 text-center">
                <CheckCircle className="h-10 w-10 text-success mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No articles pending review</p>
              </CardContent></Card>
            ) : articles.map(article => (
              <Card key={article.id} className="border-l-4 border-l-warning">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge className={STATUS_COLORS[article.status as any] ?? ''}>{STATUS_LABELS[article.status as any] ?? article.status}</Badge>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                          {article.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">v{article.version}</span>
                      </div>
                      <h3 className="font-semibold text-base leading-snug">{article.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author_name}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(article.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views ?? 0} views</span>
                      </div>
                      {article.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.tags.map(t => (
                            <span key={t} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                      <ContentPreview content={article.content} label="article" />
                    </div>
                  </div>
                  <ReviewActions
                    canApprove={canApprove}
                    currentStatus={article.status}
                    isPending={updateArtStatus.isPending}
                    onApprove={()     => artStatus(article.id, 'approved')}
                    onReject={()      => artStatus(article.id, 'rejected')}
                    onReturnDraft={() => artStatus(article.id, 'draft')}
                  />
                </CardContent>
              </Card>
            ))
          }
        </TabsContent>

        {/* ── DOCUMENTS TAB ── */}
        <TabsContent value="documents" className="mt-4 space-y-3">
          {docLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
            : documents.length === 0 ? (
              <Card><CardContent className="p-10 text-center">
                <CheckCircle className="h-10 w-10 text-success mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No documents pending review</p>
              </CardContent></Card>
            ) : documents.map(doc => {
                const d = doc as any;
                const isMd = !d.file_path || d.file_path === '' || d.mime_type === 'text/markdown';
                return (
                  <Card key={d.id} className="border-l-4 border-l-info">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <Badge className={STATUS_COLORS[d.status as any] ?? ''}>{STATUS_LABELS[d.status as any] ?? d.status}</Badge>
                            <Badge variant="secondary" className="capitalize">{d.category}</Badge>
                            {!isMd && <Badge variant="outline">{d.size}</Badge>}
                          </div>
                          <h3 className="font-semibold text-base leading-snug">
                            {isMd ? '📝' : '📄'} {d.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{d.uploaded_by_name}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(d.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          {d.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {d.tags.map((t: string) => (
                                <span key={t} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
                              ))}
                            </div>
                          )}
                          {isMd && d.content && <ContentPreview content={d.content} label="document" />}
                          {!isMd && (
                            <p className="text-xs text-muted-foreground mt-2">
                              File: {d.filename} · {d.mime_type.split('/').pop()?.toUpperCase()}
                            </p>
                          )}
                        </div>
                      </div>
                      <ReviewActions
                        canApprove={canApprove}
                        currentStatus={d.status}
                        isPending={updateDocStatus.isPending}
                        onApprove={()     => docStatus(d.id, 'approved')}
                        onReject={()      => docStatus(d.id, 'rejected')}
                        onReturnDraft={() => docStatus(d.id, 'draft')}
                      />
                    </CardContent>
                  </Card>
                );
              })
          }
        </TabsContent>

        {/* ── WIKI TAB ── */}
        <TabsContent value="wiki" className="mt-4 space-y-3">
          {wikiLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
            : wikiPages.length === 0 ? (
              <Card><CardContent className="p-10 text-center">
                <PenLine className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No wiki pages yet</p>
              </CardContent></Card>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Wiki pages use an open editing model — no formal approval workflow. Review recent changes here.
                </p>
                {wikiPages.map((page: any) => (
                  <Card key={page.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base">{page.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{page.author}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />
                              {new Date(page.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <ContentPreview content={page.content} label="wiki page" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )
          }
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KMSDashboard;