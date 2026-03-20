// src/pages/CreateKnowledge.tsx
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
import { hasContentPermission } from '@/lib/permissions';
import { useDepartments } from '@/hooks';
import { useCreateKnowledgeArticle } from '@/hooks';

type ArticleCategory = 'protocol' | 'guideline' | 'sop' | 'drug_info' | 'training';
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
  const canCreate = hasContentPermission(user, 'create', 'knowledge');

  const { data: deptsData } = useDepartments({ active: true });
  const departments = deptsData?.data ?? [];
  const createArticle = useCreateKnowledgeArticle();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState('## Overview\n\nBrief description of this article.\n\n## Details\n\nMain content here.\n\n## References\n\n- Reference 1');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-muted-foreground">You don't have permission to create articles.</p>
        <Link to="/knowledge"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
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

  const handleSubmit = (status: 'draft' | 'review') => {
    if (!title.trim()) return;
    createArticle.mutate(
      {
        title,
        category,
        tags,
        content,
        status,
        department_id: departmentId || undefined,
      },
      { onSuccess: () => navigate('/knowledge') },
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/knowledge')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="page-title">New Knowledge Article</h1>
        </div>
        <div className="flex gap-2">
          {(['edit', 'split', 'preview'] as ViewMode[]).map(mode => (
            <Button key={mode} variant={viewMode === mode ? 'default' : 'outline'} size="sm"
              onClick={() => setViewMode(mode)} className="capitalize">
              {mode === 'edit' ? <><Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit</> : mode === 'preview' ? <><Eye className="h-3.5 w-3.5 mr-1.5" />Preview</> : 'Split'}
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
                <Input id="title" required placeholder="Enter article title" value={title} onChange={e => setTitle(e.target.value)} className="text-lg" />
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

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={!title.trim() || createArticle.isPending}>
              <Save className="h-4 w-4 mr-2" />{createArticle.isPending ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => handleSubmit('review')} disabled={!title.trim() || content.length < 50 || createArticle.isPending}>
              <Send className="h-4 w-4 mr-2" />Submit for Review
            </Button>
            <Button variant="ghost" onClick={() => navigate('/knowledge')}>Cancel</Button>
          </div>
        </div>

        {/* Sidebar */}
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

export default CreateKnowledge;
