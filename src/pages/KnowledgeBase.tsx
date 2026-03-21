// src/pages/KnowledgeBase.tsx
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Save, Clock, BookOpen, Edit2, Eye, Plus, Tag, X,
  CheckCircle, XCircle, Archive, RotateCcw, Send, Search, User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useKnowledgeArticles, useCreateKnowledgeArticle, useUpdateKnowledgeArticle, useUpdateKnowledgeStatus, useDepartments } from '@/hooks';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';

type KnowledgeCategory = 'protocol' | 'guideline' | 'sop' | 'drug_info' | 'training';

const CATEGORIES: { value: KnowledgeCategory; label: string }[] = [
  { value: 'protocol',  label: 'Protocol'  },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop',       label: 'SOP'       },
  { value: 'drug_info', label: 'Drug Info' },
  { value: 'training',  label: 'Training'  },
];

const catColor: Record<string, string> = {
  protocol:  'bg-primary/10 text-primary',
  guideline: 'bg-blue-500/10 text-blue-600',
  sop:       'bg-amber-500/10 text-amber-700',
  drug_info: 'bg-red-500/10 text-red-600',
  training:  'bg-emerald-500/10 text-emerald-700',
};

const DEFAULT_CONTENT = `## Overview\n\nBrief description of this article.\n\n## Details\n\nMain content here.\n\n## References\n\n- Reference 1\n`;

// Sentinel for "no department selected" — Radix Select forbids value=""
const NO_DEPT = '__none__';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('preview');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statFilter, setStatFilter] = useState('all');

  // edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCat, setEditCat] = useState<KnowledgeCategory>('protocol');
  const [editDept, setEditDept] = useState(NO_DEPT);
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  // new state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState(DEFAULT_CONTENT);
  const [newCat, setNewCat] = useState<KnowledgeCategory>('protocol');
  const [newDept, setNewDept] = useState(NO_DEPT);
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);

  const { data, isLoading } = useKnowledgeArticles({
    search: sidebarSearch || undefined,
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

  const canCreate = user?.role === 'admin' || ['doctor','nurse','pharmacist','admin_staff','lab_technician','radiologist','hr_officer','it_staff'].includes(user?.designation ?? '');
  const canEditA  = (authorId: string) => user?.role === 'admin' || user?.id === authorId || ['doctor','admin_staff'].includes(user?.designation ?? '');
  const canApprove = user?.role === 'admin' || ['doctor','admin_staff'].includes(user?.designation ?? '');

  const addTag = (inp: string, tags: string[], setTags: (t: string[]) => void, setInp: (s: string) => void) => {
    const t = inp.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setInp('');
  };

  const startEdit = () => {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditContent(selected.content);
    setEditCat(selected.category);
    setEditDept(selected.department_id ?? NO_DEPT);
    setEditTags(selected.tags ?? []);
    setIsEditing(true);
    setViewMode('edit');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const saveEdit = () => {
    if (!selected || !editTitle.trim()) return;
    updateA.mutate(
      {
        id: selected.id,
        data: {
          title: editTitle.trim(),
          category: editCat,
          content: editContent,
          tags: editTags,
          department_id: editDept === NO_DEPT ? undefined : editDept,
        },
      },
      {
        onSuccess: () => { setIsEditing(false); toast({ title: 'Article saved' }); },
        onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
      },
    );
  };

  const handleCreate = (status: 'draft' | 'review' = 'draft') => {
    if (!newTitle.trim()) return;
    createA.mutate(
      {
        title: newTitle.trim(),
        category: newCat,
        content: newContent,
        tags: newTags,
        status,
        department_id: newDept === NO_DEPT ? undefined : newDept,
      },
      {
        onSuccess: (res: any) => {
          setSelectedId(res.data.id);
          setShowNewDialog(false);
          setNewTitle('');
          setNewContent(DEFAULT_CONTENT);
          setNewCat('protocol');
          setNewDept(NO_DEPT);
          setNewTags([]);
          toast({ title: 'Article created' });
        },
        onError: () => toast({ title: 'Create failed', variant: 'destructive' }),
      },
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
        {canCreate && (
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />New Article
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles…" value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} className="pl-9 max-w-xs" />
        </div>
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
            Articles ({articles.length})
          </p>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
            : articles.length === 0
            ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No articles found</p>
                </div>
              )
            : articles.map(a => (
                <button
                  key={a.id}
                  onClick={() => { setSelectedId(a.id); setIsEditing(false); }}
                  className={`w-full text-left rounded-lg p-3 transition-colors border ${
                    selected?.id === a.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-secondary border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm font-medium line-clamp-2">{a.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${catColor[a.category] || 'bg-muted text-muted-foreground'}`}>
                      {a.category.replace('_', ' ')}
                    </span>
                    <Badge className={`text-xs py-0 ${STATUS_COLORS[a.status as any] || ''}`}>
                      {STATUS_LABELS[a.status as any] || a.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(a.updated_at).toLocaleDateString('en-GB')}</span>
                    <span>·</span>
                    <User className="h-3 w-3" />
                    <span className="truncate">{a.author_name}</span>
                  </div>
                </button>
              ))
          }
        </div>

        {/* Main */}
        <div className="space-y-4 min-w-0">
          {isLoading ? (
            <Card><CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" />
            </CardContent></Card>
          ) : selected ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <Input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="text-lg font-bold"
                            placeholder="Article title..."
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${catColor[selected.category] || ''}`}>
                              {selected.category.replace('_', ' ')}
                            </span>
                            <Badge className={STATUS_COLORS[selected.status as any] || ''}>
                              {STATUS_LABELS[selected.status as any] || selected.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">v{selected.version}</span>
                          </div>
                          <CardTitle className="text-xl">{selected.title}</CardTitle>
                        </>
                      )}
                      {!isEditing && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{selected.author_name}</span>
                          <span>·</span>
                          <span>{new Date(selected.updated_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                          <span>· {selected.views ?? 0} views</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {isEditing ? (
                        <>
                          <div className="flex border rounded-md overflow-hidden text-xs">
                            {(['edit', 'split', 'preview'] as const).map(m => (
                              <button
                                key={m}
                                className={`px-2.5 py-1.5 capitalize transition-colors ${viewMode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                onClick={() => setViewMode(m)}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                          <Button size="sm" onClick={saveEdit} disabled={!editTitle.trim() || updateA.isPending}>
                            <Save className="h-3.5 w-3.5 mr-1.5" />{updateA.isPending ? 'Saving…' : 'Save'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit}>
                            <X className="h-3.5 w-3.5 mr-1" />Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => setViewMode(v => v === 'preview' ? 'edit' : 'preview')}>
                            {viewMode === 'preview' ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          {canEditA(selected.author_id) && (
                            <Button variant="outline" size="sm" onClick={startEdit}>
                              <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                            </Button>
                          )}
                          {selected.status === 'draft' && canEditA(selected.author_id) && (
                            <Button variant="outline" size="sm" onClick={() => changeStatus(selected.id, 'review')}>
                              <Send className="h-3.5 w-3.5 mr-1.5" />Submit
                            </Button>
                          )}
                          {selected.status === 'review' && canApprove && (
                            <>
                              <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => changeStatus(selected.id, 'approved')}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => changeStatus(selected.id, 'rejected')}>
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
                              </Button>
                            </>
                          )}
                          {(selected.status === 'review' || selected.status === 'rejected') && canEditA(selected.author_id) && (
                            <Button size="sm" variant="outline" onClick={() => changeStatus(selected.id, 'draft')}>
                              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Draft
                            </Button>
                          )}
                          {selected.status === 'approved' && canApprove && (
                            <Button size="sm" variant="outline" onClick={() => changeStatus(selected.id, 'archived')}>
                              <Archive className="h-3.5 w-3.5 mr-1.5" />Archive
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {!isEditing && selected.tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {selected.tags.map(t => (
                        <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Edit metadata */}
                      <div className="grid gap-4 sm:grid-cols-2 p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={editCat} onValueChange={v => setEditCat(v as KnowledgeCategory)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={editDept} onValueChange={setEditDept}>
                            <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NO_DEPT}>All departments</SelectItem>
                              {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Tags</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add tag and press Enter…"
                              value={editTagInput}
                              onChange={e => setEditTagInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ',') {
                                  e.preventDefault();
                                  addTag(editTagInput, editTags, setEditTags, setEditTagInput);
                                }
                              }}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => addTag(editTagInput, editTags, setEditTags, setEditTagInput)}>
                              <Tag className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {editTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {editTags.map(t => (
                                <Badge key={t} variant="secondary" className="gap-1">
                                  {t}
                                  <button onClick={() => setEditTags(editTags.filter(x => x !== t))}>
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* MDEditor */}
                      <div data-color-mode="light">
                        <MDEditor
                          value={editContent}
                          onChange={v => setEditContent(v || '')}
                          height={450}
                          preview={viewMode === 'split' ? 'live' : viewMode}
                        />
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
          ) : (
            <Card><CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Select an article from the sidebar</p>
              {canCreate && (
                <Button className="mt-4" onClick={() => setShowNewDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create First Article
                </Button>
              )}
            </CardContent></Card>
          )}
        </div>
      </div>

      {/* New Article Dialog */}
      <Dialog open={showNewDialog} onOpenChange={open => { if (!open) { setShowNewDialog(false); setNewTitle(''); setNewContent(DEFAULT_CONTENT); setNewCat('protocol'); setNewDept(NO_DEPT); setNewTags([]); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Article title…"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCat} onValueChange={v => setNewCat(v as KnowledgeCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={newDept} onValueChange={setNewDept}>
                  <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DEPT}>All departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag and press Enter…"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(newTagInput, newTags, setNewTags, setNewTagInput);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => addTag(newTagInput, newTags, setNewTags, setNewTagInput)}>
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {newTags.map(t => (
                      <Badge key={t} variant="secondary" className="gap-1">
                        {t}
                        <button onClick={() => setNewTags(newTags.filter(x => x !== t))}>
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <div data-color-mode="light">
                <MDEditor value={newContent} onChange={v => setNewContent(v || '')} height={350} preview="live" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowNewDialog(false); setNewTitle(''); setNewContent(DEFAULT_CONTENT); setNewCat('protocol'); setNewDept(NO_DEPT); setNewTags([]); }}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleCreate('review')} disabled={!newTitle.trim() || createA.isPending}>
              <Send className="h-4 w-4 mr-2" />Submit for Review
            </Button>
            <Button onClick={() => handleCreate('draft')} disabled={!newTitle.trim() || createA.isPending}>
              <Save className="h-4 w-4 mr-2" />{createA.isPending ? 'Creating…' : 'Save Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;