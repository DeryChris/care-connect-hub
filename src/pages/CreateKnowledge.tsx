// src/pages/CreateKnowledge.tsx
// Uses MDEditor throughout (edit / live-split / preview modes).
// Guards permission check behind initialising to prevent blank page on refresh.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Tag, X, Save, Send, Eye, Edit2, Columns } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasContentPermission } from '@/lib/permissions';
import { useDepartments, useCreateKnowledgeArticle } from '@/hooks';

type ArticleCategory = 'protocol' | 'guideline' | 'sop' | 'drug_info' | 'training' | 'administrative';
type ViewMode = 'edit' | 'live' | 'preview';

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'protocol',  label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop',       label: 'SOP' },
  { value: 'drug_info', label: 'Drug Info' },
  { value: 'training',  label: 'Training' },
  { value: 'administrative',  label: 'Administrative' },
];

const DEFAULT_CONTENT = `## Overview

Brief description of this article.

## Details

Main content here.

## References

- Reference 1
`;

const ModeIcon = ({ mode }: { mode: ViewMode }) =>
  mode === 'edit' ? <Edit2 className="h-3.5 w-3.5" />
  : mode === 'live' ? <Columns className="h-3.5 w-3.5" />
  : <Eye className="h-3.5 w-3.5" />;

const CreateKnowledge = () => {
  const navigate = useNavigate();
  const { user, initialising } = useAuth();

  const { data: deptsData } = useDepartments({ active: true });
  const departments = deptsData?.data ?? [];
  const createArticle = useCreateKnowledgeArticle();

  const [title,        setTitle]        = useState('');
  const [category,     setCategory]     = useState<ArticleCategory>('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [content,      setContent]      = useState(DEFAULT_CONTENT);
  const [tagInput,     setTagInput]     = useState('');
  const [tags,         setTags]         = useState<string[]>([]);
  const [viewMode,     setViewMode]     = useState<ViewMode>('edit');

  if (initialising) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  if (!hasContentPermission(user, 'create', 'knowledge')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-muted-foreground">You don't have permission to create articles.</p>
        <Link to="/knowledge"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
      </div>
    );
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput('');
  };

  const handleSubmit = (status: 'draft' | 'review') => {
    if (!title.trim()) return;
    createArticle.mutate(
      { title, category, tags, content, status, department_id: departmentId || undefined },
      { onSuccess: () => navigate('/knowledge') },
    );
  };

  // Map our ViewMode to MDEditor's preview prop
  const editorPreview: 'edit' | 'live' | 'preview' = viewMode;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">New Knowledge Article</h1>
        </div>
        {/* View mode toggle */}
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
                <Input
                  id="title" required placeholder="Enter article title"
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              <div data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
                <MDEditor
                  value={content}
                  onChange={v => setContent(v || '')}
                  height={520}
                  preview={editorPreview}
                  hideToolbar={viewMode === 'preview'}
                />
              </div>

              <p className="text-xs text-muted-foreground text-right">
                {content.length.toLocaleString()} characters
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={!title.trim() || createArticle.isPending}
            >
              <Save className="h-4 w-4 mr-2" />{createArticle.isPending ? 'Saving…' : 'Save Draft'}
            </Button>
            <Button
              onClick={() => handleSubmit('review')}
              disabled={!title.trim() || content.length < 50 || createArticle.isPending}
            >
              <Send className="h-4 w-4 mr-2" />Submit for Review
            </Button>
            <Button variant="ghost" onClick={() => navigate('/knowledge')}>Cancel</Button>
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Article Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
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

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Workflow:</strong> Save as draft first, then submit for review when ready. An approver will publish it to the Knowledge Base.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateKnowledge;
