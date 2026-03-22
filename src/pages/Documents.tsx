// src/pages/Documents.tsx
// Card grid. Single overlay handles CREATE, VIEW and EDIT.
// No Radix Dialog — avoids focus-trap/z-index conflicts.
// Markdown-only (no file upload).

import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Save, Clock, FileText, Edit2, Plus, Tag, X,
  CheckCircle, XCircle, Archive, RotateCcw, Send, Search,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useDocuments, useUploadDocument, useUpdateDocument,
  useUpdateDocumentStatus, useDepartments,
} from '@/hooks';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';

const CATS = [
  { value: 'protocol',  label: 'Protocol'  },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop',       label: 'SOP'       },
  { value: 'manual',    label: 'Manual'    },
  { value: 'training',  label: 'Training'  },
  { value: 'report',    label: 'Report'    },
] as const;
type DocCategory = typeof CATS[number]['value'];

const CAT_STRIP: Record<string, string> = {
  protocol:  'from-primary/60 to-primary/20',
  guideline: 'from-blue-400/60 to-blue-400/20',
  sop:       'from-amber-400/60 to-amber-400/20',
  manual:    'from-purple-400/60 to-purple-400/20',
  training:  'from-emerald-400/60 to-emerald-400/20',
  report:    'from-rose-400/60 to-rose-400/20',
};

const DEFAULT_CONTENT =
  `## Overview\n\nDescribe the purpose of this document.\n\n## Procedure\n\nStep-by-step instructions here.\n\n## References\n\n- Reference 1\n`;

function excerpt(md: string, max = 130) {
  const plain = md.replace(/#+\s/g, '').replace(/[*_`>\-]/g, '').replace(/\n+/g, ' ').trim();
  return plain.length > max ? plain.slice(0, max) + '…' : plain;
}

type OverlayMode = 'view' | 'edit' | 'create';

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Single overlay state ──────────────────────────────────────────────────
  const [mode,         setMode]         = useState<OverlayMode | null>(null);
  const [activeItem,   setActiveItem]   = useState<any | null>(null);
  const [editTitle,    setEditTitle]    = useState('');
  const [editContent,  setEditContent]  = useState('');
  const [editCat,      setEditCat]      = useState<DocCategory>('protocol');
  const [editDept,     setEditDept]     = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags,     setEditTags]     = useState<string[]>([]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('all');
  const [statFilter, setStatFilter] = useState('all');

  const { data, isLoading } = useDocuments({
    search:   search || undefined,
    category: catFilter  !== 'all' ? catFilter  : undefined,
    status:   statFilter !== 'all' ? statFilter : undefined,
    limit: 100,
  });
  const docs = (data?.data ?? []) as any[];

  const { data: deptData } = useDepartments({ active: true });
  const departments = deptData?.data ?? [];

  const uploadDoc    = useUploadDocument();
  const updateDoc    = useUpdateDocument();
  const updateStatus = useUpdateDocumentStatus();

  // ── Permissions ───────────────────────────────────────────────────────────
  const canCreate = user?.role === 'admin' ||
    ['doctor','nurse','pharmacist','admin_staff','lab_technician',
     'radiologist','hr_officer','it_staff'].includes(user?.designation ?? '');
  const canEditDoc = (uploadedBy: string) =>
    user?.role === 'admin' || user?.id === uploadedBy ||
    ['admin_staff'].includes(user?.designation ?? '');
  const canApprove = user?.role === 'admin' ||
    ['doctor','admin_staff'].includes(user?.designation ?? '');

  const addTag = (inp: string, tags: string[], setTags: (t: string[]) => void, setInp: (s: string) => void) => {
    const t = inp.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setInp('');
  };

  // ── Overlay helpers ───────────────────────────────────────────────────────
  const closeOverlay = () => {
    setMode(null);
    setActiveItem(null);
    setEditTitle(''); setEditContent('');
    setEditTagInput(''); setEditTags([]);
  };

  const openView = (item: any) => {
    setActiveItem(item);
    setMode('view');
  };

  const openCreate = () => {
    setEditTitle('');
    setEditContent(DEFAULT_CONTENT);
    setEditCat('protocol');
    setEditDept('');
    setEditTags([]);
    setEditTagInput('');
    setMode('create');
    setActiveItem(null);
  };

  const openEdit = () => {
    if (!activeItem) return;
    setEditTitle(activeItem.title);
    setEditContent(activeItem.content ?? '');
    setEditCat(activeItem.category);
    setEditDept(activeItem.department_id ?? '');
    setEditTags(activeItem.tags ?? []);
    setEditTagInput('');
    setMode('edit');
  };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const handleCreate = (status: 'draft' | 'review' = 'draft') => {
    if (!editTitle.trim()) return;
    const fd = new FormData();
    fd.append('title',    editTitle.trim());
    fd.append('category', editCat);
    fd.append('tags',     JSON.stringify(editTags));
    fd.append('status',   status);
    fd.append('content',  editContent);
    if (editDept) fd.append('department_id', editDept);
    uploadDoc.mutate(fd, {
      onSuccess: (res: any) => {
        setActiveItem(res.data);
        setMode('view');
        toast({ title: 'Document created' });
      },
      onError: () => toast({ title: 'Create failed', variant: 'destructive' }),
    });
  };

  const handleSaveEdit = () => {
    if (!activeItem || !editTitle.trim()) return;
    const fd = new FormData();
    fd.append('title',    editTitle);
    fd.append('category', editCat);
    fd.append('tags',     JSON.stringify(editTags));
    fd.append('content',  editContent);
    if (editDept) fd.append('department_id', editDept);
    updateDoc.mutate(
      { id: activeItem.id, formData: fd },
      {
        onSuccess: (res: any) => {
          setActiveItem(res.data);
          setMode('view');
          toast({ title: 'Document saved' });
        },
        onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
      },
    );
  };

  const changeStatus = (id: string, s: string) => {
    updateStatus.mutate(
      { id, status: s },
      {
        onSuccess: (res: any) => {
          setActiveItem(res.data);
          toast({ title: STATUS_LABELS[s as any] ?? s });
        },
        onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
      },
    );
  };

  const overlayOpen = mode !== null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="text-sm text-muted-foreground">{docs.length} documents</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />New Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
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

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <FileText className="h-12 w-12 opacity-30" />
          <p className="text-sm">
            {search || catFilter !== 'all' || statFilter !== 'all'
              ? 'No documents match your filters' : 'No documents yet'}
          </p>
          {canCreate && (
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Create first document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {docs.map((doc: any) => (
            <Card
              key={doc.id}
              className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-border/60"
              onClick={() => openView(doc)}
            >
              <CardContent className="p-0 flex flex-col">
                <div className={`h-1.5 bg-gradient-to-r w-full ${CAT_STRIP[doc.category] || 'from-muted to-muted/50'}`} />
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{doc.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs capitalize">{doc.category}</Badge>
                    <Badge className={`text-xs ${STATUS_COLORS[doc.status as any] || ''}`}>
                      {STATUS_LABELS[doc.status as any] || doc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                    {doc.content ? excerpt(doc.content) : 'No content yet.'}
                  </p>
                  {doc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                      ))}
                      {doc.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{doc.tags.length - 3}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{new Date(doc.uploaded_at).toLocaleDateString('en-GB')}</span>
                    <span>·</span>
                    <span className="truncate">{doc.uploaded_by_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Overlay — create / view / edit ──────────────────────────────── */}
      {overlayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={mode === 'view' ? closeOverlay : undefined}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative z-10 flex flex-col bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden"
            style={{ animation: 'overlayIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className={`h-1 w-full bg-gradient-to-r shrink-0 ${
              CAT_STRIP[activeItem?.category ?? editCat] || 'from-primary/60 to-primary/20'
            }`} />

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0 space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {mode === 'view' ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant="secondary" className="capitalize">{activeItem?.category}</Badge>
                        <Badge className={STATUS_COLORS[activeItem?.status as any] || ''}>
                          {STATUS_LABELS[activeItem?.status as any] || activeItem?.status}
                        </Badge>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        {activeItem?.title}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span>{activeItem?.uploaded_by_name}</span><span>·</span>
                        <span>{new Date(activeItem?.uploaded_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                        <span>·</span><span>{activeItem?.views ?? 0} views</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <Label>{mode === 'create' ? 'Title *' : 'Title'}</Label>
                      <Input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Document title…"
                        className="text-lg font-bold"
                        autoFocus={mode === 'create'}
                      />
                    </div>
                  )}
                </div>
                <button
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  onClick={closeOverlay}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {mode === 'view' && (
                  <>
                    {canEditDoc(activeItem?.uploaded_by) && (
                      <Button variant="outline" size="sm" onClick={openEdit}>
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                      </Button>
                    )}
                    {activeItem?.status === 'draft' && canEditDoc(activeItem?.uploaded_by) && (
                      <Button variant="outline" size="sm" onClick={() => changeStatus(activeItem.id, 'review')}>
                        <Send className="h-3.5 w-3.5 mr-1.5" />Submit for Review
                      </Button>
                    )}
                    {activeItem?.status === 'review' && canApprove && (
                      <>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => changeStatus(activeItem.id, 'approved')}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => changeStatus(activeItem.id, 'rejected')}>
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
                        </Button>
                      </>
                    )}
                    {(activeItem?.status === 'review' || activeItem?.status === 'rejected') && canEditDoc(activeItem?.uploaded_by) && (
                      <Button size="sm" variant="outline" onClick={() => changeStatus(activeItem.id, 'draft')}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Back to Draft
                      </Button>
                    )}
                    {activeItem?.status === 'approved' && canApprove && (
                      <Button size="sm" variant="outline" onClick={() => changeStatus(activeItem.id, 'archived')}>
                        <Archive className="h-3.5 w-3.5 mr-1.5" />Archive
                      </Button>
                    )}
                  </>
                )}
                {mode === 'edit' && (
                  <>
                    <Button size="sm" onClick={handleSaveEdit} disabled={!editTitle.trim() || updateDoc.isPending}>
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      {updateDoc.isPending ? 'Saving…' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMode('view')}>
                      <X className="h-3.5 w-3.5 mr-1" />Cancel
                    </Button>
                  </>
                )}
                {mode === 'create' && (
                  <>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handleCreate('review')}
                      disabled={!editTitle.trim() || uploadDoc.isPending}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />Submit for Review
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCreate('draft')}
                      disabled={!editTitle.trim() || uploadDoc.isPending}
                    >
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      {uploadDoc.isPending ? 'Saving…' : 'Save Draft'}
                    </Button>
                  </>
                )}
              </div>

              {/* Tags display (view mode) */}
              {mode === 'view' && activeItem?.tags?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {activeItem.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Scrollable body ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5">

                {/* VIEW mode */}
                {mode === 'view' && (
                  activeItem?.content ? (
                    <div className="prose prose-sm max-w-none
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-p:text-foreground/90 prose-strong:text-foreground
                      prose-table:w-full prose-th:text-left prose-th:font-semibold
                      prose-th:p-2 prose-th:border prose-th:bg-muted/50
                      prose-td:p-2 prose-td:border prose-td:text-foreground
                      prose-code:bg-muted prose-code:px-1 prose-code:rounded
                      prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                      <ReactMarkdown>{activeItem.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-30" />
                      <p className="text-sm">No content yet.</p>
                      {canEditDoc(activeItem?.uploaded_by) && (
                        <Button size="sm" variant="outline" onClick={openEdit}>
                          <Edit2 className="h-3.5 w-3.5 mr-1.5" />Add Content
                        </Button>
                      )}
                    </div>
                  )
                )}

                {/* CREATE or EDIT mode */}
                {(mode === 'create' || mode === 'edit') && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Select value={editCat} onValueChange={v => setEditCat(v as DocCategory)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Department</Label>
                        <Select value={editDept} onValueChange={setEditDept}>
                          <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">All departments</SelectItem>
                            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add tag…"
                            value={editTagInput}
                            onChange={e => setEditTagInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                addTag(editTagInput, editTags, setEditTags, setEditTagInput);
                              }
                            }}
                          />
                          <Button
                            type="button" variant="outline" size="sm"
                            onClick={() => addTag(editTagInput, editTags, setEditTags, setEditTagInput)}
                          >
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
                    <div data-color-mode="light">
                      <MDEditor
                        value={editContent}
                        onChange={v => setEditContent(v || '')}
                        height={360}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Comments — view mode only */}
              {mode === 'view' && activeItem && (
                <div className="px-6 pb-6">
                  <CommentsSection
                    targetId={activeItem.id}
                    targetType="document"
                    title="Document Comments"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Documents;