// src/pages/Documents.tsx
// Card grid + centred overlay. pendingItem fix so overlay works immediately after create.
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDocuments, useUploadDocument, useUpdateDocument, useUpdateDocumentStatus, useDepartments } from '@/hooks';
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

const DEFAULT_CONTENT = `## Overview\n\nDescribe the purpose of this document.\n\n## Procedure\n\nStep-by-step instructions here.\n\n## References\n\n- Reference 1\n`;

function excerpt(md: string, max = 130) {
  const plain = md.replace(/#+\s/g, '').replace(/[*_`>\-]/g, '').replace(/\n+/g, ' ').trim();
  return plain.length > max ? plain.slice(0, max) + '…' : plain;
}

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // FIX: pendingItem so overlay renders immediately without waiting for list refetch
  const [overlayId,   setOverlayId]   = useState<string | null>(null);
  const [pendingItem, setPendingItem] = useState<any | null>(null);
  const [isEditing,   setIsEditing]   = useState(false);
  const [editTitle,   setEditTitle]   = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCat,     setEditCat]     = useState<DocCategory>('protocol');
  const [editDept,    setEditDept]    = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags,    setEditTags]    = useState<string[]>([]);

  const [showCreate,  setShowCreate]  = useState(false);
  const [newTitle,    setNewTitle]    = useState('');
  const [newContent,  setNewContent]  = useState(DEFAULT_CONTENT);
  const [newCat,      setNewCat]      = useState<DocCategory>('protocol');
  const [newDept,     setNewDept]     = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags,     setNewTags]     = useState<string[]>([]);

  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('all');
  const [statFilter, setStatFilter] = useState('all');

  const { data, isLoading } = useDocuments({
    search: search || undefined,
    category: catFilter !== 'all' ? catFilter : undefined,
    status: statFilter !== 'all' ? statFilter : undefined,
    limit: 100,
  });
  const docs = (data?.data ?? []) as any[];

  // Use fetched version if available, fall back to pendingItem
  const overlayDoc = docs.find(d => d.id === overlayId) ?? pendingItem;

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

  const openOverlay  = (item: any) => { setOverlayId(item.id); setPendingItem(item); setIsEditing(false); };
  const closeOverlay = () => { setOverlayId(null); setPendingItem(null); setIsEditing(false); };

  const startEdit = () => {
    if (!overlayDoc) return;
    setEditTitle(overlayDoc.title);
    setEditContent(overlayDoc.content ?? '');
    setEditCat(overlayDoc.category);
    setEditDept(overlayDoc.department_id ?? '');
    setEditTags(overlayDoc.tags ?? []);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!overlayDoc) return;
    const fd = new FormData();
    fd.append('title', editTitle);
    fd.append('category', editCat);
    fd.append('tags', JSON.stringify(editTags));
    fd.append('content', editContent);
    if (editDept) fd.append('department_id', editDept);
    updateDoc.mutate(
      { id: overlayDoc.id, formData: fd },
      { onSuccess: (res: any) => {
        setPendingItem(res.data); // refresh overlay data immediately
        setIsEditing(false);
        toast({ title: 'Document saved' });
      }},
    );
  };

  const handleCreate = (status: 'draft' | 'review' = 'draft') => {
    if (!newTitle.trim()) return;
    const fd = new FormData();
    fd.append('title', newTitle.trim());
    fd.append('category', newCat);
    fd.append('tags', JSON.stringify(newTags));
    fd.append('status', status);
    fd.append('content', newContent);
    if (newDept) fd.append('department_id', newDept);
    uploadDoc.mutate(fd, {
      onSuccess: (res: any) => {
        setShowCreate(false);
        resetCreate();
        openOverlay(res.data); // pass full item
        toast({ title: 'Document created' });
      },
    });
  };

  const resetCreate = () => {
    setNewTitle(''); setNewContent(DEFAULT_CONTENT); setNewCat('protocol');
    setNewDept(''); setNewTags([]); setNewTagInput('');
  };

  const changeStatus = (id: string, s: string) => {
    updateStatus.mutate({ id, status: s }, {
      onSuccess: (res: any) => {
        setPendingItem(res.data);
        toast({ title: STATUS_LABELS[s as any] ?? s });
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="text-sm text-muted-foreground">{docs.length} documents</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />New Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <FileText className="h-12 w-12 opacity-30" />
          <p className="text-sm">{search || catFilter !== 'all' || statFilter !== 'all' ? 'No documents match your filters' : 'No documents yet'}</p>
          {canCreate && <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}><Plus className="h-3.5 w-3.5 mr-1.5" />Create first document</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {docs.map((doc: any) => (
            <Card
              key={doc.id}
              className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-border/60"
              onClick={() => openOverlay(doc)}
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

      {/* ── Centred overlay ──────────────────────────────────────────────────── */}
      {overlayId && overlayDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={closeOverlay}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative z-10 flex flex-col bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden"
            style={{ animation: 'overlayIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`h-1 w-full bg-gradient-to-r shrink-0 ${CAT_STRIP[overlayDoc.category] || 'from-primary/60 to-primary/20'}`} />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0 space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {isEditing
                    ? <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-lg font-bold" />
                    : <>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Badge variant="secondary" className="capitalize">{overlayDoc.category}</Badge>
                          <Badge className={STATUS_COLORS[overlayDoc.status as any] || ''}>
                            {STATUS_LABELS[overlayDoc.status as any] || overlayDoc.status}
                          </Badge>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          {overlayDoc.title}
                        </h2>
                      </>
                  }
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span>{overlayDoc.uploaded_by_name}</span><span>·</span>
                    <span>{new Date(overlayDoc.uploaded_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                    <span>·</span><span>{overlayDoc.views ?? 0} views</span>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0" onClick={closeOverlay}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={saveEdit} disabled={updateDoc.isPending}>
                      <Save className="h-3.5 w-3.5 mr-1.5" />{updateDoc.isPending ? 'Saving…' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-3.5 w-3.5 mr-1" />Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    {canEditDoc(overlayDoc.uploaded_by) && (
                      <Button variant="outline" size="sm" onClick={startEdit}>
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                      </Button>
                    )}
                    {overlayDoc.status === 'draft' && canEditDoc(overlayDoc.uploaded_by) && (
                      <Button variant="outline" size="sm" onClick={() => changeStatus(overlayDoc.id, 'review')}>
                        <Send className="h-3.5 w-3.5 mr-1.5" />Submit for Review
                      </Button>
                    )}
                    {overlayDoc.status === 'review' && canApprove && (
                      <>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => changeStatus(overlayDoc.id, 'approved')}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => changeStatus(overlayDoc.id, 'rejected')}>
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
                        </Button>
                      </>
                    )}
                    {(overlayDoc.status === 'review' || overlayDoc.status === 'rejected') && canEditDoc(overlayDoc.uploaded_by) && (
                      <Button size="sm" variant="outline" onClick={() => changeStatus(overlayDoc.id, 'draft')}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Back to Draft
                      </Button>
                    )}
                    {overlayDoc.status === 'approved' && canApprove && (
                      <Button size="sm" variant="outline" onClick={() => changeStatus(overlayDoc.id, 'archived')}>
                        <Archive className="h-3.5 w-3.5 mr-1.5" />Archive
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Tags */}
              {!isEditing && overlayDoc.tags?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {overlayDoc.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Select value={editCat} onValueChange={v => setEditCat(v as DocCategory)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Department</Label>
                        <Select value={editDept} onValueChange={setEditDept}>
                          <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All departments</SelectItem>
                            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                          <Input placeholder="Add tag…" value={editTagInput} onChange={e => setEditTagInput(e.target.value)}
                            onKeyDown={e => {if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(editTagInput,editTags,setEditTags,setEditTagInput);}}} />
                          <Button type="button" variant="outline" size="sm" onClick={() => addTag(editTagInput,editTags,setEditTags,setEditTagInput)}>
                            <Tag className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {editTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {editTags.map(t => (
                              <Badge key={t} variant="secondary" className="gap-1">{t}
                                <button onClick={() => setEditTags(editTags.filter(x=>x!==t))}><X className="h-2.5 w-2.5"/></button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div data-color-mode="light">
                      <MDEditor value={editContent} onChange={v => setEditContent(v || '')} height={360} />
                    </div>
                  </div>
                ) : overlayDoc.content ? (
                  <div className="prose prose-sm max-w-none
                    prose-headings:font-bold prose-headings:text-foreground
                    prose-p:text-foreground/90 prose-strong:text-foreground
                    prose-table:w-full prose-th:text-left prose-th:font-semibold
                    prose-th:p-2 prose-th:border prose-th:bg-muted/50
                    prose-td:p-2 prose-td:border prose-td:text-foreground
                    prose-code:bg-muted prose-code:px-1 prose-code:rounded
                    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                    <ReactMarkdown>{overlayDoc.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-muted-foreground">
                    <FileText className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No content yet.</p>
                    {canEditDoc(overlayDoc.uploaded_by) && (
                      <Button size="sm" variant="outline" onClick={startEdit}>
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" />Add Content
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {!isEditing && (
                <div className="px-6 pb-6">
                  <CommentsSection targetId={overlayDoc.id} targetType="document" title="Document Comments" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={open => { setShowCreate(open); if (!open) resetCreate(); }}>
        <DialogContent className="w-full max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>New Document</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Title *</Label>
                <Input placeholder="Document title…" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={newCat} onValueChange={v => setNewCat(v as DocCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={newDept} onValueChange={setNewDept}>
                  <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input placeholder="Add tag…" value={newTagInput} onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => {if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(newTagInput,newTags,setNewTags,setNewTagInput);}}} />
                  <Button type="button" variant="outline" size="sm" onClick={() => addTag(newTagInput,newTags,setNewTags,setNewTagInput)}>
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {newTags.map(t => (
                      <Badge key={t} variant="secondary" className="gap-1">{t}
                        <button onClick={() => setNewTags(newTags.filter(x=>x!==t))}><X className="h-2.5 w-2.5"/></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div data-color-mode="light">
              <MDEditor value={newContent} onChange={v => setNewContent(v || '')} height={280} />
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-2 flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setShowCreate(false); resetCreate(); }}>Cancel</Button>
            <Button variant="outline" onClick={() => handleCreate('review')} disabled={!newTitle.trim() || uploadDoc.isPending}>
              <Send className="h-4 w-4 mr-2" />Submit for Review
            </Button>
            <Button onClick={() => handleCreate('draft')} disabled={!newTitle.trim() || uploadDoc.isPending}>
              <Save className="h-4 w-4 mr-2" />{uploadDoc.isPending ? 'Saving…' : 'Save Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default Documents;