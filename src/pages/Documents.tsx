// src/pages/Documents.tsx  
// Same pattern as Wiki.tsx: sidebar list + inline create/edit/view.
// Supports markdown (MDEditor) and file upload. No top-level permission blocks.
import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Clock, FileText, Edit2, Eye, Plus, Tag, X, CheckCircle, XCircle, Archive, RotateCcw, Send, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments, useUploadDocument, useUpdateDocument, useUpdateDocumentStatus, useDepartments } from '@/hooks';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/permissions';
import { documentsService } from '@/services';

const CATS = [
  { value: 'protocol', label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop', label: 'SOP' },
  { value: 'manual', label: 'Manual' },
  { value: 'training', label: 'Training' },
  { value: 'report', label: 'Report' },
];

const DEFAULT_CONTENT = `## Overview\n\nDescribe the purpose of this document.\n\n## Procedure\n\nStep-by-step instructions here.\n\n## References\n\n- Reference 1\n`;

const getIcon = (mime: string) =>
  mime?.includes('pdf') ? '📄' : mime?.includes('word') ? '📝' : mime?.includes('sheet') || mime?.includes('excel') ? '📊' : mime === 'text/markdown' ? '📝' : '📁';

const isMarkdownDoc = (doc: any) => !doc?.file_path || doc.file_path === '' || doc?.mime_type === 'text/markdown';

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createMode, setCreateMode] = useState<'markdown' | 'file'>('markdown');
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statFilter, setStatFilter] = useState('all');
  const [dragOver, setDragOver] = useState(false);

  // edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCat, setEditCat] = useState('protocol');
  const [editDept, setEditDept] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editFile, setEditFile] = useState<File | null>(null);

  // new state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState(DEFAULT_CONTENT);
  const [newCat, setNewCat] = useState('protocol');
  const [newDept, setNewDept] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);

  const { data, isLoading } = useDocuments({ search: search || undefined, category: catFilter !== 'all' ? catFilter : undefined, status: statFilter !== 'all' ? statFilter : undefined, limit: 100 });
  const docs = data?.data ?? [];
  const selected = docs.find(d => (d as any).id === selectedId) ?? (docs.length > 0 ? docs[0] : null) as any;

  const { data: deptData } = useDepartments({ active: true });
  const departments = deptData?.data ?? [];

  const uploadDoc = useUploadDocument();
  const updateDoc = useUpdateDocument();
  const updateStatus = useUpdateDocumentStatus();

  const canCreate = user?.role === 'admin' || ['doctor','nurse','pharmacist','admin_staff','lab_technician','radiologist','hr_officer','it_staff'].includes(user?.designation ?? '');
  const canEditDoc = (uploadedBy: string) => user?.role === 'admin' || user?.id === uploadedBy || ['admin_staff'].includes(user?.designation ?? '');
  const canApprove = user?.role === 'admin' || ['doctor','admin_staff'].includes(user?.designation ?? '');

  const addTag = (inp: string, tags: string[], setTags: (t: string[]) => void, setInp: (s: string) => void) => {
    const t = inp.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setInp('');
  };

  const startCreate = () => {
    setIsCreating(true); setIsEditing(false); setSelectedId(null);
    setNewTitle(''); setNewContent(DEFAULT_CONTENT); setNewCat('protocol'); setNewDept(''); setNewTags([]); setNewFile(null);
  };

  const startEdit = () => {
    if (!selected) return;
    setEditTitle(selected.title); setEditContent(selected.content ?? '');
    setEditCat(selected.category); setEditDept(selected.department_id ?? '');
    setEditTags(selected.tags ?? []); setEditFile(null);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    const fd = new FormData();
    fd.append('title', editTitle); fd.append('category', editCat); fd.append('tags', JSON.stringify(editTags));
    if (editDept) fd.append('department_id', editDept);
    if (isMarkdownDoc(selected)) fd.append('content', editContent);
    if (editFile) fd.append('file', editFile);
    updateDoc.mutate({ id: selected.id, formData: fd }, { onSuccess: () => { setIsEditing(false); toast({ title: 'Document saved' }); } });
  };

  const handleCreate = (status: 'draft' | 'review' = 'draft') => {
    if (!newTitle.trim()) return;
    if (createMode === 'file' && !newFile) { toast({ title: 'Please select a file', variant: 'destructive' }); return; }
    const fd = new FormData();
    fd.append('title', newTitle.trim()); fd.append('category', newCat); fd.append('tags', JSON.stringify(newTags));
    if (newDept) fd.append('department_id', newDept);
    if (createMode === 'markdown') fd.append('content', newContent);
    else if (newFile) fd.append('file', newFile);
    uploadDoc.mutate(fd, { onSuccess: (res: any) => { setIsCreating(false); setSelectedId(res.data.id); toast({ title: 'Document created' }); } });
  };

  const changeStatus = (id: string, s: string) => {
    updateStatus.mutate({ id, status: s }, { onSuccess: () => toast({ title: STATUS_LABELS[s as any] ?? s }) });
  };

  const handleFileSelect = (file: File) => {
    setNewFile(file);
    if (!newTitle) setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="text-sm text-muted-foreground">{docs.length} documents</p>
        </div>
        {canCreate && !isCreating && <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />New Document</Button>}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">Documents</p>
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
            : docs.map((doc: any) => (
              <button key={doc.id}
                onClick={() => { setSelectedId(doc.id); setIsEditing(false); setIsCreating(false); }}
                className={`w-full text-left rounded-lg p-3 transition-colors border ${!isCreating && selected?.id === doc.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-secondary border-transparent'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg shrink-0">{getIcon(doc.mime_type)}</span>
                  <p className="text-sm font-medium line-clamp-2">{doc.title}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs capitalize py-0">{doc.category}</Badge>
                  <Badge className={`text-xs py-0 ${STATUS_COLORS[doc.status as any] || ''}`}>{STATUS_LABELS[doc.status as any] || doc.status}</Badge>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /><span>{new Date(doc.uploaded_at).toLocaleDateString('en-GB')}</span><span>· {doc.uploaded_by_name}</span>
                </div>
              </button>
            ))
          }
          {!isLoading && docs.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No documents found</p>}
        </div>

        {/* Main */}
        <div className="space-y-4">
          {/* Create */}
          {isCreating && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">New Document</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={createMode} onValueChange={v => setCreateMode(v as any)}>
                  <TabsList>
                    <TabsTrigger value="markdown" className="gap-2"><Edit2 className="h-3.5 w-3.5" />Write with Editor</TabsTrigger>
                    <TabsTrigger value="file" className="gap-2"><Upload className="h-3.5 w-3.5" />Upload File</TabsTrigger>
                  </TabsList>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Title *</Label>
                      <Input placeholder="Document title…" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="text-base font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newCat} onValueChange={setNewCat}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={newDept} onValueChange={setNewDept}>
                        <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                        <SelectContent><SelectItem value="">All departments</SelectItem>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
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
                  <TabsContent value="markdown" className="mt-4">
                    <div data-color-mode="light"><MDEditor value={newContent} onChange={v => setNewContent(v || '')} height={400} /></div>
                  </TabsContent>
                  <TabsContent value="file" className="mt-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                      onClick={() => fileRef.current?.click()}>
                      {newFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="text-left"><p className="font-medium text-sm">{newFile.name}</p><p className="text-xs text-muted-foreground">{(newFile.size/(1024*1024)).toFixed(2)} MB</p></div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setNewFile(null); }}><X className="h-3.5 w-3.5" /></Button>
                        </div>
                      ) : (
                        <div className="space-y-2"><Upload className="h-10 w-10 mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground">Drag & drop or click to browse</p><p className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint — max 20MB</p></div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} />
                  </TabsContent>
                </Tabs>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleCreate('draft')} disabled={!newTitle.trim() || uploadDoc.isPending}><Save className="h-4 w-4 mr-2" />{uploadDoc.isPending ? 'Saving…' : 'Save Draft'}</Button>
                  <Button variant="outline" onClick={() => handleCreate('review')} disabled={!newTitle.trim() || uploadDoc.isPending}><Send className="h-4 w-4 mr-2" />Submit for Review</Button>
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
                              <Badge variant="secondary" className="capitalize">{selected.category}</Badge>
                              <Badge className={STATUS_COLORS[selected.status as any] || ''}>{STATUS_LABELS[selected.status as any] || selected.status}</Badge>
                            </div>
                            <CardTitle className="text-xl flex items-center gap-2"><span className="text-2xl">{getIcon(selected.mime_type)}</span>{selected.title}</CardTitle>
                          </>
                      }
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{selected.uploaded_by_name}</span><span>·</span>
                        <span>{new Date(selected.uploaded_at).toLocaleDateString('en-GB', { day:'numeric',month:'short',year:'numeric' })}</span>
                        <span>· {selected.views ?? 0} views</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {!isEditing && <>
                        {isMarkdownDoc(selected) && <Button variant="ghost" size="icon" onClick={() => setViewMode(v => v === 'preview' ? 'edit' : 'preview')}>{viewMode === 'preview' ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>}
                        {!isMarkdownDoc(selected) && <a href={documentsService.getDownloadUrl(selected.id)} download={selected.filename} target="_blank" rel="noreferrer"><Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Download</Button></a>}
                        {canEditDoc(selected.uploaded_by) && <Button variant="outline" size="sm" onClick={startEdit}><Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit</Button>}
                        {selected.status === 'draft' && canEditDoc(selected.uploaded_by) && <Button variant="outline" size="sm" onClick={() => changeStatus(selected.id, 'review')}><Send className="h-3.5 w-3.5 mr-1.5" />Submit</Button>}
                        {selected.status === 'review' && canApprove && <>
                          <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => changeStatus(selected.id, 'approved')}><CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve</Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => changeStatus(selected.id, 'rejected')}><XCircle className="h-3.5 w-3.5 mr-1.5" />Reject</Button>
                        </>}
                        {(selected.status === 'review' || selected.status === 'rejected') && canEditDoc(selected.uploaded_by) && <Button size="sm" variant="outline" onClick={() => changeStatus(selected.id, 'draft')}><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Draft</Button>}
                        {selected.status === 'approved' && canApprove && <Button size="sm" variant="outline" onClick={() => changeStatus(selected.id, 'archived')}><Archive className="h-3.5 w-3.5 mr-1.5" />Archive</Button>}
                      </>}
                      {isEditing && <>
                        <Button size="sm" onClick={saveEdit} disabled={updateDoc.isPending}><Save className="h-3.5 w-3.5 mr-1.5" />{updateDoc.isPending ? 'Saving…' : 'Save'}</Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </>}
                    </div>
                  </div>
                  {!isEditing && selected.tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {selected.tags.map((t: string) => <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={editCat} onValueChange={setEditCat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={editDept} onValueChange={setEditDept}><SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger><SelectContent><SelectItem value="">All departments</SelectItem>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
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
                      {isMarkdownDoc(selected)
                        ? <div data-color-mode="light"><MDEditor value={editContent} onChange={v => setEditContent(v || '')} height={400} /></div>
                        : <div className="space-y-2">
                            <Label>Replace File (optional)</Label>
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                              <FileText className="h-7 w-7 text-primary shrink-0" />
                              <div><p className="font-medium text-sm">{selected.filename}</p><p className="text-xs text-muted-foreground">Current · {selected.size}</p></div>
                            </div>
                            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" className="block text-sm" onChange={e => { if (e.target.files?.[0]) setEditFile(e.target.files[0]); }} />
                          </div>
                      }
                    </div>
                  ) : isMarkdownDoc(selected) ? (
                    selected.content
                      ? <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-table:w-full prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50 prose-td:p-2 prose-td:border prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-blockquote:border-l-primary">
                          <ReactMarkdown>{selected.content}</ReactMarkdown>
                        </div>
                      : <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-muted-foreground">
                          <FileText className="h-10 w-10 opacity-30" />
                          <p className="text-sm">No content yet.</p>
                          {canEditDoc(selected.uploaded_by) && <Button size="sm" variant="outline" onClick={startEdit}><Edit2 className="h-3.5 w-3.5 mr-1.5" />Add Content</Button>}
                        </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                      <span className="text-5xl">{getIcon(selected.mime_type)}</span>
                      <div className="text-center"><p className="font-medium">{selected.filename}</p><p className="text-sm text-muted-foreground">{selected.size}</p></div>
                      <a href={documentsService.getDownloadUrl(selected.id)} download={selected.filename} target="_blank" rel="noreferrer">
                        <Button><Download className="h-4 w-4 mr-2" />Download to View</Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
              {!isEditing && <CommentsSection targetId={selected.id} targetType="document" title="Document Comments" />}
            </>
          )}

          {!isCreating && !selected && !isLoading && (
            <Card><CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Select a document from the sidebar</p>
              {canCreate && <Button className="mt-4" onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Create First Document</Button>}
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;