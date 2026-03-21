// src/pages/Documents.tsx — markdown-only, same pattern as Wiki/KnowledgeBase
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
  Save, Clock, FileText, Edit2, Eye, Plus, Tag, X,
  CheckCircle, XCircle, Archive, RotateCcw, Send, Search, User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments, useUploadDocument, useUpdateDocument, useUpdateDocumentStatus, useDepartments } from '@/hooks';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';

type DocumentCategory = 'protocol' | 'guideline' | 'sop' | 'manual' | 'training' | 'report';

const CATS: { value: DocumentCategory; label: string }[] = [
  { value: 'protocol',  label: 'Protocol'  },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop',       label: 'SOP'       },
  { value: 'manual',    label: 'Manual'    },
  { value: 'training',  label: 'Training'  },
  { value: 'report',    label: 'Report'    },
];

const DEFAULT_CONTENT = `## Overview\n\nDescribe the purpose of this document.\n\n## Procedure\n\nStep-by-step instructions here.\n\n## References\n\n- Reference 1\n`;

// Sentinel for "no department" — Radix Select forbids value=""
const NO_DEPT = '__none__';

const Documents = () => {
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
  const [editCat, setEditCat] = useState<DocumentCategory>('protocol');
  const [editDept, setEditDept] = useState(NO_DEPT);
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  // new state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState(DEFAULT_CONTENT);
  const [newCat, setNewCat] = useState<DocumentCategory>('protocol');
  const [newDept, setNewDept] = useState(NO_DEPT);
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);

  const { data, isLoading } = useDocuments({
    search: sidebarSearch || undefined,
    category: catFilter !== 'all' ? catFilter : undefined,
    status: statFilter !== 'all' ? statFilter : undefined,
    limit: 100,
  });
  const docs = data?.data ?? [];
  const selected = docs.find((d: any) => d.id === selectedId) ?? (docs.length > 0 ? docs[0] : null) as any;

  const { data: deptData } = useDepartments({ active: true });
  const departments = deptData?.data ?? [];

  const uploadDoc    = useUploadDocument();
  const updateDoc    = useUpdateDocument();
  const updateStatus = useUpdateDocumentStatus();

  const canCreate  = user?.role === 'admin' || ['doctor','nurse','pharmacist','admin_staff','lab_technician','radiologist','hr_officer','it_staff'].includes(user?.designation ?? '');
  const canEditDoc = (uploadedBy: string) => user?.role === 'admin' || user?.id === uploadedBy || ['admin_staff'].includes(user?.designation ?? '');
  const canApprove = user?.role === 'admin' || ['doctor','admin_staff'].includes(user?.designation ?? '');

  const addTag = (inp: string, tags: string[], setTags: (t: string[]) => void, setInp: (s: string) => void) => {
    const t = inp.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setInp('');
  };

  const startEdit = () => {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditContent(selected.content ?? '');
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
    const fd = new FormData();
    fd.append('title', editTitle.trim());
    fd.append('category', editCat);
    fd.append('content', editContent);
    fd.append('tags', JSON.stringify(editTags));
    if (editDept !== NO_DEPT) fd.append('department_id', editDept);
    updateDoc.mutate(
      { id: selected.id, formData: fd },
      {
        onSuccess: () => { setIsEditing(false); toast({ title: 'Document saved' }); },
        onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
      },
    );
  };

  const handleCreate = (status: 'draft' | 'review' = 'draft') => {
    if (!newTitle.trim()) return;
    const fd = new FormData();
    fd.append('title', newTitle.trim());
    fd.append('category', newCat);
    fd.append('content', newContent);
    fd.append('tags', JSON.stringify(newTags));
    fd.append('status', status);
    if (newDept !== NO_DEPT) fd.append('department_id', newDept);
    uploadDoc.mutate(fd, {
      onSuccess: (res: any) => {
        setSelectedId(res.data.id);
        setShowNewDialog(false);
        setNewTitle('');
        setNewContent(DEFAULT_CONTENT);
        setNewCat('protocol');
        setNewDept(NO_DEPT);
        setNewTags([]);
        toast({ title: 'Document created' });
      },
      onError: () => toast({ title: 'Create failed', variant: 'destructive' }),
    });
  };

  const changeStatus = (id: string, s: string) => {
    updateStatus.mutate({ id, status: s }, { onSuccess: () => toast({ title: STATUS_LABELS[s as any] ?? s }) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="text-sm text-muted-foreground">{docs.length} documents</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />New Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documents…" value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} className="pl-9 max-w-xs" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
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
            Documents ({docs.length})
          </p>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
            : docs.length === 0
            ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No documents found</p>
                </div>
              )
            : docs.map((doc: any) => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedId(doc.id); setIsEditing(false); }}
                  className={`w-full text-left rounded-lg p-3 transition-colors border ${
                    selected?.id === doc.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-secondary border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm font-medium line-clamp-2">{doc.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs capitalize py-0">{doc.category}</Badge>
                    <Badge className={`text-xs py-0 ${STATUS_COLORS[doc.status as any] || ''}`}>
                      {STATUS_LABELS[doc.status as any] || doc.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(doc.uploaded_at).toLocaleDateString('en-GB')}</span>
                    <span>·</span>
                    <User className="h-3 w-3" />
                    <span className="truncate">{doc.uploaded_by_name}</span>
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
                            placeholder="Document title..."
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="capitalize">{selected.category}</Badge>
                            <Badge className={STATUS_COLORS[selected.status as any] || ''}>
                              {STATUS_LABELS[selected.status as any] || selected.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">{selected.title}</CardTitle>
                        </>
                      )}
                      {!isEditing && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{selected.uploaded_by_name}</span>
                          <span>·</span>
                          <span>{new Date(selected.uploaded_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
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
                          <Button size="sm" onClick={saveEdit} disabled={!editTitle.trim() || updateDoc.isPending}>
                            <Save className="h-3.5 w-3.5 mr-1.5" />{updateDoc.isPending ? 'Saving…' : 'Save'}
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
                          {canEditDoc(selected.uploaded_by) && (
                            <Button variant="outline" size="sm" onClick={startEdit}>
                              <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                            </Button>
                          )}
                          {selected.status === 'draft' && canEditDoc(selected.uploaded_by) && (
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
                          {(selected.status === 'review' || selected.status === 'rejected') && canEditDoc(selected.uploaded_by) && (
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
                      {selected.tags.map((t: string) => (
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
                          <Select value={editCat} onValueChange={v => setEditCat(v as DocumentCategory)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
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
                  ) : selected.content ? (
                    <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-table:w-full prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50 prose-td:p-2 prose-td:border prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-blockquote:border-l-primary">
                      <ReactMarkdown>{selected.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-30" />
                      <p className="text-sm">No content yet.</p>
                      {canEditDoc(selected.uploaded_by) && (
                        <Button size="sm" variant="outline" onClick={startEdit}>
                          <Edit2 className="h-3.5 w-3.5 mr-1.5" />Add Content
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              {!isEditing && <CommentsSection targetId={selected.id} targetType="document" title="Document Comments" />}
            </>
          ) : (
            <Card><CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Select a document from the sidebar</p>
              {canCreate && (
                <Button className="mt-4" onClick={() => setShowNewDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create First Document
                </Button>
              )}
            </CardContent></Card>
          )}
        </div>
      </div>

      {/* New Document Dialog */}
      <Dialog open={showNewDialog} onOpenChange={open => { if (!open) { setShowNewDialog(false); setNewTitle(''); setNewContent(DEFAULT_CONTENT); setNewCat('protocol'); setNewDept(NO_DEPT); setNewTags([]); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Document title…"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCat} onValueChange={v => setNewCat(v as DocumentCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
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
            <Button variant="outline" onClick={() => handleCreate('review')} disabled={!newTitle.trim() || uploadDoc.isPending}>
              <Send className="h-4 w-4 mr-2" />Submit for Review
            </Button>
            <Button onClick={() => handleCreate('draft')} disabled={!newTitle.trim() || uploadDoc.isPending}>
              <Save className="h-4 w-4 mr-2" />{uploadDoc.isPending ? 'Creating…' : 'Save Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;