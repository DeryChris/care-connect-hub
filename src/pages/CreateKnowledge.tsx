import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Edit2, Tag, X, Save, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockDepartments } from '@/lib/mock-data';

type ArticleCategory = 'protocol' | 'guideline' | 'sop' | 'drug_info' | 'training';
type ArticleStatus = 'draft' | 'review';
type ViewMode = 'edit' | 'preview' | 'split';

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'protocol', label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop', label: 'SOP' },
  { value: 'drug_info', label: 'Drug Info' },
  { value: 'training', label: 'Training' },
];

const CreateKnowledge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState(`## Overview\n\nBrief description of this article.\n\n## Details\n\nMain content here.\n\n## References\n\n- Reference 1`);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (status: ArticleStatus) => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please enter an article title.', variant: 'destructive' });
      return;
    }
    if (!content.trim() || content.length < 50) {
      toast({ title: 'Content too short', description: 'Please write more content before submitting.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: status === 'review' ? 'Submitted for review' : 'Draft saved',
        description: status === 'review'
          ? 'Your article has been submitted and is pending approval.'
          : 'Article saved as draft.',
      });
      navigate('/knowledge');
    }, 800);
  };

  const isReviewer = user?.role === 'admin' || user?.designation === 'doctor';

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
            <span className="text-foreground">New Article</span>
          </div>
          <h1 className="page-title">Create Article</h1>
          <p className="text-sm text-muted-foreground">
            {isReviewer
              ? 'As an author, you can submit articles directly for review.'
              : 'Submit a new clinical article for review and approval.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSubmit('review')} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" /> Submit for Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left — main editor */}
        <div className="space-y-4">
          {/* Title */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g., Acute Asthma Management Protocol"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="text-base font-medium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card>
            <CardHeader className="pb-0 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Content <span className="text-destructive">*</span></CardTitle>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewMode('edit')}
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewMode('split')}
                  >
                    Split
                  </Button>
                  <Button
                    variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {viewMode === 'edit' && (
                <MDEditor
                  value={content}
                  onChange={val => setContent(val || '')}
                  height={480}
                  preview="edit"
                  data-color-mode="light"
                />
              )}
              {viewMode === 'preview' && (
                <div className="min-h-[480px] p-4 border rounded-lg bg-muted/20">
                  <div className="prose prose-sm max-w-none
                    prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                    prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                    prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                    prose-p:text-foreground prose-p:leading-relaxed
                    prose-strong:text-foreground
                    prose-table:w-full prose-table:text-sm
                    prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50
                    prose-td:p-2 prose-td:border
                    prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
                  ">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                </div>
              )}
              {viewMode === 'split' && (
                <div className="grid grid-cols-2 gap-4">
                  <MDEditor
                    value={content}
                    onChange={val => setContent(val || '')}
                    height={480}
                    preview="edit"
                    data-color-mode="light"
                  />
                  <div className="min-h-[480px] p-4 border rounded-lg bg-muted/20 overflow-y-auto">
                    <div className="prose prose-sm max-w-none
                      prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                      prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                      prose-p:text-foreground prose-p:leading-relaxed
                      prose-strong:text-foreground
                      prose-table:w-full prose-table:text-sm
                      prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50
                      prose-td:p-2 prose-td:border
                      prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
                    ">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Markdown supported — use ## for headings, **bold**, | tables |, - lists
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar — metadata */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Article Details</p>

              <div className="space-y-1.5">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={v => setCategory(v as ArticleCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
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
                <Input value={user?.name || ''} disabled className="bg-muted/40" />
                <p className="text-xs text-muted-foreground">Automatically set to your account</p>
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
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="h-8 text-sm"
                />
                <Button variant="outline" size="sm" onClick={addTag} className="shrink-0">Add</Button>
              </div>
              <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workflow</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <span>Author submits → <strong>Review</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <span>Reviewer approves → <strong>Approved</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>Published to Knowledge Base</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1 border-t">
                Your role: <strong className="text-foreground capitalize">{user?.designation?.replace('_', ' ')}</strong>
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSubmit('review')} disabled={submitting} className="w-full">
              <Send className="h-4 w-4 mr-2" /> Submit for Review
            </Button>
            <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting} className="w-full">
              <Save className="h-4 w-4 mr-2" /> Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateKnowledge;
