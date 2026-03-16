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
import { ArrowLeft, Eye, Edit2, Tag, X, Save, Send, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockDepartments } from '@/lib/mock-data';
import { mockKnowledgeArticles } from '@/lib/mock-knowledge';
import { hasContentPermission, getAllowedStatusTransitions, STATUS_LABELS, STATUS_COLORS, type DocumentStatus } from '@/lib/permissions';
import { getWorkflowStatus } from '@/lib/content-workflow';

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
  const { toast } = useToast();

  const article = mockKnowledgeArticles.find(a => a.id === id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setCategory(article.category);
      setDepartmentId(article.department_id || '__all__');
      setContent(article.content);
      setTags(article.tags);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Article not found</h2>
        <Button onClick={() => navigate('/knowledge')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const canEdit = hasContentPermission(user, 'update', 'knowledge', article.author_id);
  const canReview = hasContentPermission(user, 'review', 'knowledge', article.author_id);
  const canApprove = hasContentPermission(user, 'approve', 'knowledge', article.author_id);

  const currentStatus = article.status as DocumentStatus;
  const allowedTransitions = getAllowedStatusTransitions(user, currentStatus, article.author_id);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to edit this article.</p>
        <Button onClick={() => navigate(`/knowledge/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> View Article
        </Button>
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

  const handleSave = (targetStatus: DocumentStatus) => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    if (!content.trim() || content.length < 50) {
      toast({ title: 'Content too short', description: 'Article needs more content.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: 'Article updated',
        description: `Status: ${STATUS_LABELS[targetStatus]}`,
      });
      navigate(`/knowledge/${id}`);
    }, 600);
  };

  const handleStatusChange = (newStatus: DocumentStatus) => {
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: `Status changed to ${STATUS_LABELS[newStatus]}`,
        description: newStatus === 'approved'
          ? 'Article has been approved and published to the Knowledge Base.'
          : newStatus === 'rejected'
          ? 'Article has been sent back to the author for revision.'
          : undefined,
      });
      navigate(`/knowledge/${id}`);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/knowledge" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Knowledge Base
            </Link>
            <span>/</span>
            <Link to={`/knowledge/${id}`} className="hover:text-foreground">
              {article.title.substring(0, 30)}...
            </Link>
            <span>/</span>
            <span className="text-foreground">Edit</span>
          </div>
          <h1 className="page-title">Edit Article</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(currentStatus)} disabled={submitting}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          {currentStatus === 'draft' && (
            <Button onClick={() => handleSave('review')} disabled={submitting}>
              <Send className="h-4 w-4 mr-2" /> Submit for Review
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="text-base font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Content <span className="text-destructive">*</span></CardTitle>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  {(['edit', 'split', 'preview'] as ViewMode[]).map(mode => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setViewMode(mode)}
                    >
                      {mode === 'edit' && <Edit2 className="h-3 w-3 mr-1" />}
                      {mode === 'preview' && <Eye className="h-3 w-3 mr-1" />}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {viewMode === 'edit' && (
                <MDEditor value={content} onChange={val => setContent(val || '')} height={480} preview="edit" data-color-mode="light" />
              )}
              {viewMode === 'preview' && (
                <div className="min-h-[480px] p-4 border rounded-lg bg-muted/20">
                  <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-table:w-full prose-table:text-sm prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50 prose-td:p-2 prose-td:border prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                </div>
              )}
              {viewMode === 'split' && (
                <div className="grid grid-cols-2 gap-4">
                  <MDEditor value={content} onChange={val => setContent(val || '')} height={480} preview="edit" data-color-mode="light" />
                  <div className="min-h-[480px] p-4 border rounded-lg bg-muted/20 overflow-y-auto">
                    <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-table:w-full prose-table:text-sm prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50 prose-td:p-2 prose-td:border prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Approval */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status & Approval</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current:</span>
                <Badge className={STATUS_COLORS[currentStatus]}>{STATUS_LABELS[currentStatus]}</Badge>
                <span className="text-xs text-muted-foreground">v{article.version}</span>
              </div>

              {allowedTransitions.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Actions available:</p>
                  <div className="flex flex-col gap-1.5">
                    {allowedTransitions.includes('approved') && (
                      <Button
                        size="sm"
                        className="w-full justify-start bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleStatusChange('approved')}
                        disabled={submitting}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-2" /> Approve Article
                      </Button>
                    )}
                    {allowedTransitions.includes('rejected') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleStatusChange('rejected')}
                        disabled={submitting}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-2" /> Reject / Request Changes
                      </Button>
                    )}
                    {allowedTransitions.filter(s => !['approved', 'rejected'].includes(s)).map(s => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleStatusChange(s)}
                        disabled={submitting}
                      >
                        <Badge className={`${STATUS_COLORS[s]} mr-2`} style={{ fontSize: '10px' }}>
                          {STATUS_LABELS[s]}
                        </Badge>
                        Move to {STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Article Details</p>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={v => setCategory(v as ArticleCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All departments</SelectItem>
                    {mockDepartments.filter(d => d.is_active).map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Author</Label>
                <Input value={article.author_name} disabled className="bg-muted/40" />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Tag className="h-3 w-3" /> Tags
              </p>
              <div className="flex gap-2">
                <Input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="h-8 text-sm" />
                <Button variant="outline" size="sm" onClick={addTag} className="shrink-0">Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Permissions</p>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Edit', allowed: canEdit },
                  { label: 'Review', allowed: canReview },
                  { label: 'Approve', allowed: canApprove },
                ].map(p => (
                  <div key={p.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{p.label}</span>
                    <Badge variant={p.allowed ? 'default' : 'outline'} className={`text-[10px] ${p.allowed ? 'bg-success text-success-foreground' : ''}`}>
                      {p.allowed ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditKnowledge;
