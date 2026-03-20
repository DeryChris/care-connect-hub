// src/pages/KnowledgeBase.tsx
// Same pattern as Wiki.tsx: sidebar list + inline create/edit/view.
// No top-level permission checks that block rendering.
import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Clock, BookOpen, Edit2, Eye, Plus, Tag, X, CheckCircle, XCircle, Archive, RotateCcw, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKnowledgeArticles, useCreateKnowledgeArticle, useUpdateKnowledgeArticle, useUpdateKnowledgeStatus, useDepartments } from '@/hooks';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';

const CATEGORIES = [
  { value: 'protocol', label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop', label: 'SOP' },
  { value: 'drug_info', label: 'Drug Info' },
  { value: 'training', label: 'Training' },
];

const catColor: Record<string, string> = {
  protocol: 'bg-primary/10 text-primary',
  guideline: 'bg-blue-500/10 text-blue-600',
  sop: 'bg-amber-500/10 text-amber-700',
  drug_info: 'bg-red-500/10 text-red-600',
  training: 'bg-emerald-500/10 text-emerald-700',
};

const DEFAULT_CONTENT = `## Overview\n\nBrief description.\n\n## Details\n\nMain content here.\n\n## References\n\n- Reference 1\n`;

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statFilter, setStatFilter] = useState('all');

  // edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCat, setEditCat] = useState('protocol');
  const [editDept, setEditDept] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  // new state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState(DEFAULT_CONTENT);
  const [newCat, setNewCat] = useState('protocol');
  const [newDept, setNewDept] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);

  const { data, isLoading } = useKnowledgeArticles({
    search: search || undefined,
    category: catFilter !== 'all' ? catFilter : undefined,
    status: statFilter !== 'all' ? statFilter : undefined,
    limit: 100,
  });
  const articles = data?.data ?? [];
  const selected = articles.find(a => a.id === selectedId) ?? (articles.length > 0 ? articles[0] : null);

  const { data: deptData } = useDepartments({ active: true });
  const departments = deptData?.data ?? [];

  const createA = useCreateKnowledgeArticle();
  const updateA = useUpdateKnowledgeArticle();
  const updateS = useUpdateKnowledgeStatus();

  // permission helpers — inline only, never block render
  const canCreate = user?.role === 'admin' || ['doctor','nurse','pharmacist','admin_staff','lab_technician','radiologist','hr_officer','it_staff'].includes(user?.designation ?? '');
  const canEditA = (authorId: string) => user?.role === 'admin' || user?.id === authorId || ['doctor','admin_staff'].includes(user?.designation ?? '');
  const canApprove = user?.role === 'admin' || ['doctor','admin_staff'].includes(user?.designation ?? '');

  const addTag = (input: string, tags: string[], setTags: (t: string[]) => void, setInput: (s: string) => void) => {
    const t = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setInput('');
  };

  const startEdit = () => {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditContent(selected.content);
    setEditCat(selected.category);
    setEditDept(selected.department_id ?? '');
    setEditTags(selected.tags ?? []);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    updateA.mutate(
      { id: selected.id, data: { title: editTitle, category: editCat, content: editContent, tags: editTags, department_id: editDept || undefined } },
      { onSuccess: () => { setIsEditing(false); toast({ title: 'Article saved' }); } },
    );
  };

  const handleCreate = (status: 'draft' | 'review' = 'draft') => {
    if (!newTitle.trim()) return;
    createA.mutate(
      { title: newTitle.trim(), category: newCat, content: newContent, tags: newTags, status, department_id: newDept || undefined },
      { onSuccess: (res: any) => { setIsCreating(false); setSelectedId(res.data.id); toast({ title: 'Article created' }); } },
    );
  };

  const changeStatus = (id: string, s: string) => {
    updateS.mutate({ id, status: s }, { onSuccess: () => toast({ title: STATUS_LABELS[s as any] ?? s }) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">{articles.length} articles</p>
        </div>
        {canCreate && !isCreating && (
          <Button onClick={() => { setIsCreating(true); setIsEditing(false); setSelectedId(null); setNewTitle(''); setNewContent(DEFAULT_CONTENT); setNewCat('protocol'); setNewDept(''); setNewTags([]); }}>
            <Plus className="h-4 w-4 mr-2" />New Article
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statFilter} onValueChange={setStatFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">Articles</p>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
            : articles.map(a => (
              <button key={a.id}
                onClick={() => { setSelectedId(a.id); setIsEditing(false); setIsCreating(false); }}
                className={`w-full text-left rounded-lg p-3 transition-colors border ${!isCreating && selected?.id === a.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-secondary border-transparent'}`}>
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-medium line-clamp-2">{a.title}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${catColor[a.category] || 'bg-muted text-muted-foreground'}`}>{a.category.replace('_',' ')}</span>
                  <Badge className={`text-xs py-0 ${STATUS_COLORS[a.status as any] || ''}`}>{STATUS_LABELS[a.status as any] || a.status}</Badge>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /><span>{new Date(a.updated_at).toLocaleDateString('en-GB')}</span><span>· {a.author_name}</span>
                </div>
              </button>
            ))
          }
          {!isLoading && articles.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No articles found</p>}
        </div>

        {/* Main */}
        <div className="space-y-4">
          {/* Create form */}
          {isCreating && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">New Article</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Title *</Label>
                    <Input placeholder="Article title…" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="text-base font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newCat} onValueChange={setNewCat}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={newDept} onValueChange={setNewDept}>
                      <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All departments</SelectItem>
                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Add tag…" value={newTagInput} onChange={e => setNewTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(newTagInput, newTags, setNewTags, setNewTagInput); }}} />
                      <Button type="button" variant="outline" size="sm" onClick={() => addTag(newTagInput, newTags, setNewTags, setNewTagInput)}><Tag className="h-3.5 w-3.5" /></Button>
                    </div>
                    {newTags.length > 0 && <div className="flex flex-wrap gap-1.5">{newTags.map(t => <Badge key={t} variant="secondary" className="gap-1">{t}<button onClick={() => setNewTags(newTags.filter(x => x !== t))}><X className="h-2.5 w-2.5" /></button></Badge>)}</div>}
                  </div>
                </div>
                <div data-color-mode="light">
                  <MDEditor value={newContent} onChange={v => setNewContent(v || '')} height={400} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleCreate('draft')} disabled={!newTitle.trim() || createA.isPending}>
                    <Save className="h-4 w-4 mr-2" />{createA.isPending ? 'Saving…' : 'Save Draft'}
                  </Button>
                  <Button variant="outline" onClick={() => handleCreate('review')} disabled={!newTitle.trim() || createA.isPending}>
                    <Send className="h-4 w-4 mr-2" />Submit for Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* View / Edit */}
          {!isCreating && selected && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {isEditing
                        ? <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-xl font-bold" />
                        : <>
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${catColor[selected.category] || ''}`}>{selected.category.replace('_',' ')}</span>
                              <Badge className={STATUS_COLORS[selected.status as any] || ''}>{STATUS_LABELS[selected.status as any] || selected.status}</Badge>
                              <span className="text-xs text-muted-foreground">v{selected.version}</span>
                            </div>
                            <CardTitle className="text-xl">{selected.title}</CardTitle>
                          </>
                      }
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{selected.author_name}</span><span>·</span>
                        <span>{new Date(selected.updated_at).toLocaleDateString('en-GB', { day:'numeric',month:'short',year:'numeric' })}</span>
                        <span>· {selected.views ?? 0} views</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {!isEditing && <>
                        <Button variant="ghost" size="icon" onClick={() => setViewMode(v => v === 'preview' ? 'edit' : 'preview')}>
                          {viewMode === 'preview' ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {canEditA(selected.author_id) && <Button variant="outline" size="sm" onClick={startEdit}><Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit</Button>}
                        {selected.status === 'draft' && canEditA(selected.author_id) && <Button variant="outline" size="sm" onClick={() => changeStatus(selected.id, 'review')}><Send className="h-3.5 w-3.5 mr-1.5" />Submit</Button>}
                        {selected.status === 'review' && canApprove && <>
                          <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => changeStatus(selected.id, 'approved')}><CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve</Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => changeStatus(selected.id, 'rejected')}><XCircle className="h-3.5 w-3.5 mr-1.5" />Reject</Button>
                        </>}
                        {(selected.status === 'review' || selected.status === 'rejected') && canEditA(selected.author_id) && <Button size="sm" variant="outline" onClick={() => changeStatus(selected.id, 'draft')}><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Draft</Button>}
                        {selected.status === 'approved' && canApprove && <Button size="sm" variant="outline" onClick={() => changeStatus(selected.id, 'archived')}><Archive className="h-3.5 w-3.5 mr-1.5" />Archive</Button>}
                      </>}
                      {isEditing && <>
                        <Button size="sm" onClick={saveEdit} disabled={updateA.isPending}><Save className="h-3.5 w-3.5 mr-1.5" />{updateA.isPending ? 'Saving…' : 'Save'}</Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </>}
                    </div>
                  </div>
                  {!isEditing && selected.tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {selected.tags.map(t => <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={editCat} onValueChange={setEditCat}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={editDept} onValueChange={setEditDept}>
                            <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All departments</SelectItem>
                              {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Tags</Label>
                          <div className="flex gap-2">
                            <Input placeholder="Add tag…" value={editTagInput} onChange={e => setEditTagInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(editTagInput, editTags, setEditTags, setEditTagInput); }}} />
                            <Button type="button" variant="outline" size="sm" onClick={() => addTag(editTagInput, editTags, setEditTags, setEditTagInput)}><Tag className="h-3.5 w-3.5" /></Button>
                          </div>
                          {editTags.length > 0 && <div className="flex flex-wrap gap-1.5">{editTags.map(t => <Badge key={t} variant="secondary" className="gap-1">{t}<button onClick={() => setEditTags(editTags.filter(x => x !== t))}><X className="h-2.5 w-2.5" /></button></Badge>)}</div>}
                        </div>
                      </div>
                      <div data-color-mode="light">
                        <MDEditor value={editContent} onChange={v => setEditContent(v || '')} height={450} />
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-table:w-full prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50 prose-td:p-2 prose-td:border prose-td:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                      <ReactMarkdown>{selected.content}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
              {!isEditing && <CommentsSection targetId={selected.id} targetType="knowledge" title="Reader Comments" />}
            </>
          )}

          {!isCreating && !selected && !isLoading && (
            <Card><CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Select an article from the sidebar</p>
              {canCreate && <Button className="mt-4" onClick={() => { setIsCreating(true); setSelectedId(null); setNewTitle(''); setNewContent(DEFAULT_CONTENT); setNewCat('protocol'); setNewDept(''); setNewTags([]); }}><Plus className="h-4 w-4 mr-2" />Create First Article</Button>}
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;