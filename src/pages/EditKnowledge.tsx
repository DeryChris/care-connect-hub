// src/pages/EditKnowledge.tsx
// Uses MDEditor throughout (edit / live / preview modes).
// Guards permission check behind initialising to prevent blank page on refresh.

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Tag, X, Save, Send, CheckCircle, XCircle,
  BookOpen, Archive, RotateCcw, Eye, Edit2, Columns,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  hasContentPermission, getAllowedStatusTransitions,
  STATUS_LABELS, STATUS_COLORS,
} from '@/lib/permissions';
import {
  useDepartments, useKnowledgeArticle,
  useUpdateKnowledgeArticle, useUpdateKnowledgeStatus,
} from '@/hooks';
import { useToast } from '@/hooks/use-toast';

type ArticleCategory = 'protocol' | 'guideline' | 'sop' | 'drug_info' | 'training';
type ViewMode = 'edit' | 'live' | 'preview';

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'protocol',  label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop',       label: 'SOP' },
  { value: 'drug_info', label: 'Drug Info' },
  { value: 'training',  label: 'Training' },
  // { value: 'administrative',  label: 'Administrative' },
];

const ModeIcon = ({ mode }: { mode: ViewMode }) =>
  mode === 'edit' ? <Edit2 className="h-3.5 w-3.5" />
  : mode === 'live' ? <Columns className="h-3.5 w-3.5" />
  : <Eye className="h-3.5 w-3.5" />;

const EditKnowledge = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { user, initialising } = useAuth();
  const { toast }    = useToast();

  const { data, isLoading } = useKnowledgeArticle(id ?? '');
  const article = data?.data;

  const { data: deptsData } = useDepartments({ active: true });
  const departments = deptsData?.data ?? [];

  const updateArticle = useUpdateKnowledgeArticle();
  const updateStatus  = useUpdateKnowledgeStatus();

  const [title,        setTitle]        = useState('');
  const [category,     setCategory]     = useState<ArticleCategory>('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [content,      setContent]      = useState('');
  const [tagInput,     setTagInput]     = useState('');
  const [tags,         setTags]         = useState<string[]>([]);
  const [viewMode,     setViewMode]     = useState<ViewMode>('edit');

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setCategory(article.category as ArticleCategory);
      setDepartmentId(article.department_id ?? '');
      setContent(article.content);
      setTags(article.tags ?? []);
    }
  }, [article]);

  // Loading — either session restoring or article loading
  if (initialising || isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Article not found</h2>
        <Button onClick={() => navigate('/knowledge')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const canEdit    = hasContentPermission(user, 'update', 'knowledge', article.author_id);
  const artStatus  = article.status as any;
  const transitions = getAllowedStatusTransitions(user, artStatus, article.author_id);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-muted-foreground">You don't have permission to edit this article.</p>
        <Link to={`/knowledge/${id}`}>
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Article</Button>
        </Link>
      </div>
    );
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput('');
  };

  const handleSave = (newStatus?: string) => {
    updateArticle.mutate(
      {
        id: article.id,
        data: {
          title, category, tags, content,
          department_id: departmentId || undefined,
          ...(newStatus ? { status: newStatus } : {}),
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Article saved' });
          navigate(`/knowledge/${article.id}`);
        },
        onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
      },
    );
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: article.id, status: newStatus },
      {
        onSuccess: () => {
          toast({ title: `${STATUS_LABELS[newStatus as any] ?? newStatus}` });
          navigate(`/knowledge/${article.id}`);
        },
        onError: () => toast({ title: 'Status update failed', variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/knowledge/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="page-title">Edit Article</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={STATUS_COLORS[artStatus] || ''}>
                {STATUS_LABELS[artStatus] || artStatus}
              </Badge>
              <span className="text-xs text-muted-foreground">v{article.version}</span>
            </div>
          </div>
        </div>
        {/* View mode toggle — same as CreateKnowledge */}
        <div className="flex border rounded-lg overflow-hidden shrink-0">
          {(['edit', 'live', 'preview'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              title={mode === 'edit' ? 'Editor only' : mode === 'live' ? 'Side-by-side' : 'Preview only'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                viewMode === mode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => setViewMode(mode)}
            >
              <ModeIcon mode={mode} />
              <span className="hidden sm:inline">{mode === 'live' ? 'Split' : mode}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main editor */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title *</Label>
                <Input id="title" required value={title}
                  onChange={e => setTitle(e.target.value)} className="text-lg font-semibold" />
              </div>

              <div data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
                <MDEditor
                  value={content}
                  onChange={v => setContent(v || '')}
                  height={520}
                  preview={viewMode}
                  hideToolbar={viewMode === 'preview'}
                />
              </div>

              <p className="text-xs text-muted-foreground text-right">
                {content.length.toLocaleString()} characters
              </p>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleSave()} disabled={!title.trim() || updateArticle.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateArticle.isPending ? 'Saving…' : 'Save Changes'}
            </Button>

            {artStatus === 'draft' && (
              <Button variant="outline" onClick={() => handleSave('review')} disabled={updateArticle.isPending}>
                <Send className="h-4 w-4 mr-2" />Submit for Review
              </Button>
            )}

            {transitions.includes('approved') && artStatus === 'review' && (
              <Button className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handleStatusChange('approved')}>
                <CheckCircle className="h-4 w-4 mr-2" />Approve
              </Button>
            )}

            {transitions.includes('rejected') && artStatus === 'review' && (
              <Button variant="outline" className="text-destructive border-destructive/30"
                onClick={() => handleStatusChange('rejected')}>
                <XCircle className="h-4 w-4 mr-2" />Reject
              </Button>
            )}

            {transitions.includes('draft') && (artStatus === 'review' || artStatus === 'rejected') && (
              <Button variant="outline" onClick={() => handleStatusChange('draft')}>
                <RotateCcw className="h-4 w-4 mr-2" />Return to Draft
              </Button>
            )}

            {transitions.includes('archived') && artStatus === 'approved' && (
              <Button variant="outline" onClick={() => handleStatusChange('archived')}>
                <Archive className="h-4 w-4 mr-2" />Archive
              </Button>
            )}

            <Button variant="ghost" onClick={() => navigate(`/knowledge/${id}`)}>Cancel</Button>
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Article Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={v => setCategory(v as ArticleCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input placeholder="Add tag…" value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }}} />
                  <Button type="button" size="sm" variant="outline" onClick={addTag}>
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                        {tag}
                        <button onClick={() => setTags(p => p.filter(t => t !== tag))}>
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Article meta */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Article Info</p>
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>Version</span><span className="font-medium text-foreground">v{article.version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <Badge className={`text-xs ${STATUS_COLORS[artStatus] || ''}`}>
                    {STATUS_LABELS[artStatus] || artStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Views</span><span className="font-medium text-foreground">{article.views ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Author</span>
                  <span className="font-medium text-foreground truncate ml-2 max-w-[120px]">{article.author_name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditKnowledge;