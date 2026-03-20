// src/pages/EditKnowledge.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Eye, Edit2, Tag, X, Save, Send, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasContentPermission, getAllowedStatusTransitions, STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';
import { useDepartments, useKnowledgeArticle, useUpdateKnowledgeArticle, useUpdateKnowledgeStatus } from '@/hooks';

type ArticleCategory = 'protocol' | 'guideline' | 'sop' | 'drug_info' | 'training';
type ViewMode = 'edit' | 'preview' | 'split';

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'protocol', label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop', label: 'SOP' },
  { value: 'drug_info', label: 'Drug Info' },
  { value: 'training', label: 'Training' },
];

const EditKnowledge = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useKnowledgeArticle(id ?? '');
  const article = data?.data;

  const { data: deptsData } = useDepartments({ active: true });
  const departments = deptsData?.data ?? [];

  const updateArticle = useUpdateKnowledgeArticle();
  const updateStatus = useUpdateKnowledgeStatus();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setCategory(article.category as ArticleCategory);
      setDepartmentId(article.department_id ?? '');
      setContent(article.content);
      setTags(article.tags);
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Article not found</h2>
        <Button onClick={() => navigate('/knowledge')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      </div>
    );
  }

  const canEdit = hasContentPermission(user, 'update', 'knowledge', article.author_id);
  const canApprove = hasContentPermission(user, 'approve', 'knowledge');
  const artStatus = article.status as any;
  const transitions = getAllowedStatusTransitions(user, artStatus, article.author_id);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-muted-foreground">You don't have permission to edit this article.</p>
        <Link to={`/knowledge/${id}`}><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Article</Button></Link>
      </div>
    );
  }

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
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
      { onSuccess: () => navigate(`/knowledge/${article.id}`) },
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/knowledge/${id}`)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="page-title">Edit Article</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={STATUS_COLORS[artStatus] || ''}>{STATUS_LABELS[artStatus] || artStatus}</Badge>
              <span className="text-xs text-muted-foreground">v{article.version}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(['edit', 'split', 'preview'] as ViewMode[]).map(mode => (
            <Button key={mode} variant={viewMode === mode ? 'default' : 'outline'} size="sm"
              onClick={() => setViewMode(mode)} className="capitalize">
              {mode === 'edit' ? <Edit2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="ml-1 hidden sm:inline">{mode}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title *</Label>
                <Input id="title" required value={title} onChange={e => setTitle(e.target.value)} className="text-lg" />
              </div>
              <div data-color-mode="light">
                {viewMode === 'edit' && <MDEditor value={content} onChange={v => setContent(v || '')} height={500} />}
                {viewMode === 'preview' && (
                  <div className="prose prose-sm max-w-none min-h-[500px] p-4 border rounded-lg bg-muted/20
                    prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground
                    prose-table:w-full prose-th:border prose-th:p-2 prose-th:bg-muted/50 prose-td:border prose-td:p-2">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                )}
                {viewMode === 'split' && (
                  <div className="grid grid-cols-2 gap-4">
                    <MDEditor value={content} onChange={v => setContent(v || '')} height={500} />
                    <div className="prose prose-sm max-w-none p-4 border rounded-lg bg-muted/20 overflow-auto h-[500px]
                      prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground
                      prose-table:w-full prose-th:border prose-th:p-2 prose-th:bg-muted/50 prose-td:border prose-td:p-2">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleSave()} disabled={!title.trim() || updateArticle.isPending}>
              <Save className="h-4 w-4 mr-2" />{updateArticle.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            {artStatus === 'draft' && (
              <Button variant="outline" onClick={() => handleSave('review')} disabled={updateArticle.isPending}>
                <Send className="h-4 w-4 mr-2" />Submit for Review
              </Button>
            )}
            {transitions.includes('approved') && artStatus === 'review' && canApprove && (
              <Button className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => updateStatus.mutate({ id: article.id, status: 'approved' }, { onSuccess: () => navigate(`/knowledge/${article.id}`) })}>
                <CheckCircle className="h-4 w-4 mr-2" />Approve
              </Button>
            )}
            {transitions.includes('rejected') && artStatus === 'review' && canApprove && (
              <Button variant="outline" className="text-destructive border-destructive/30"
                onClick={() => updateStatus.mutate({ id: article.id, status: 'rejected' }, { onSuccess: () => navigate(`/knowledge/${article.id}`) })}>
                <XCircle className="h-4 w-4 mr-2" />Reject
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate(`/knowledge/${id}`)}>Cancel</Button>
          </div>
        </div>

        {/* Sidebar */}
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
                  <Input placeholder="Add tag..." value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown} />
                  <Button type="button" size="sm" variant="outline" onClick={addTag}>
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditKnowledge;
