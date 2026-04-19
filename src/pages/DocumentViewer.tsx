// src/pages/DocumentViewer.tsx
// Renders document content using MDEditor.Markdown (same as knowledge articles).
// For file-based documents: shows a download button instead of a broken iframe.
// For markdown-only documents: shows the full rich content inline.
// Permission checks guard behind initialising to prevent blank page on refresh.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download, X, Eye, Share2, Tag, User, Calendar, FileText,
  Edit, Save, CheckCircle, XCircle, Archive, RotateCcw, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDocument, useUpdateDocument, useUpdateDocumentStatus } from '@/hooks';
import { documentsService } from '@/services';
import {
  STATUS_COLORS, STATUS_LABELS, getAllowedStatusTransitions, hasContentPermission,
} from '@/lib/permissions';
import CommentsSection from '@/components/content/CommentsSection';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DOCUMENT_CATEGORIES = [
  { value: 'protocol',  label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop',       label: 'SOP' },
  { value: 'manual',    label: 'Manual' },
  { value: 'training',  label: 'Training' },
  { value: 'report',    label: 'Report' },
];

const DocumentViewer = ({ documentId, isOpen, onClose }: DocumentViewerProps) => {
  const { user, initialising } = useAuth();
  const { toast }              = useToast();
  const { data, isLoading }    = useDocument(documentId);
  const doc = data?.data;

  const updateDoc    = useUpdateDocument();
  const updateStatus = useUpdateDocumentStatus();

  // Inline edit state
  const [editTitle,    setEditTitle]    = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags,     setEditTags]     = useState<string[]>([]);
  const [editContent,  setEditContent]  = useState('');

  useEffect(() => {
    if (doc) {
      setEditTitle(doc.title);
      setEditCategory(doc.category);
      setEditTags(doc.tags ?? []);
      setEditContent((doc as any).content ?? '');
    }
  }, [doc]);

  if (!isOpen) return null;

  // Permission checks — safe when user is null during session restore
  const canEdit = !initialising && doc
    ? hasContentPermission(user, 'update', 'document', doc.uploaded_by) : false;
  const docStatus   = (doc?.status ?? 'draft') as any;
  const transitions = !initialising && doc
    ? getAllowedStatusTransitions(user, docStatus, doc.uploaded_by) : [];

  const isMarkdownDoc = !doc?.file_path || doc.file_path === '' || doc?.mime_type === 'text/markdown';
  const hasFile       = doc?.file_path && doc.file_path !== '';
  const downloadUrl   = hasFile ? documentsService.getDownloadUrl(doc!.id) : null;

  const mimeIcon = !doc ? '📁'
    : isMarkdownDoc                                               ? '📝'
    : doc.mime_type.includes('pdf')                               ? '📄'
    : doc.mime_type.includes('spreadsheet') || doc.mime_type.includes('excel') ? '📊'
    : doc.mime_type.includes('word')                              ? '📝'
    : '📁';

  const addTag = () => {
    const t = editTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !editTags.includes(t)) setEditTags(p => [...p, t]);
    setEditTagInput('');
  };

  const saveEdits = () => {
    if (!doc) return;
    const fd = new FormData();
    fd.append('title',    editTitle);
    fd.append('category', editCategory);
    fd.append('tags',     JSON.stringify(editTags));
    fd.append('content',  editContent);
    updateDoc.mutate(
      { id: doc.id, formData: fd },
      {
        onSuccess: () => toast({ title: 'Document updated' }),
        onError:   () => toast({ title: 'Update failed', variant: 'destructive' }),
      },
    );
  };

  const handleStatus = (s: string) => {
    if (!doc) return;
    updateStatus.mutate(
      { id: doc.id, status: s },
      {
        onSuccess: () => toast({ title: STATUS_LABELS[s as any] ?? s }),
        onError:   () => toast({ title: 'Failed', variant: 'destructive' }),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[92vh] p-0 flex flex-col overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <DialogHeader className="p-5 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="text-3xl shrink-0">{mimeIcon}</div>
              <div className="min-w-0 flex-1">
                {isLoading ? <Skeleton className="h-7 w-64" /> : (
                  <>
                    <DialogTitle className="text-xl font-bold leading-tight">{doc?.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {isMarkdownDoc ? 'Markdown document' : doc?.filename}
                    </p>
                    {doc && (
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">{doc.category}</Badge>
                        {!isMarkdownDoc && <Badge variant="outline">{doc.size}</Badge>}
                        <Badge className={STATUS_COLORS[docStatus] || ''}>{STATUS_LABELS[docStatus] || docStatus}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />{doc.views ?? 0}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {downloadUrl && (
                <a href={downloadUrl} download={doc?.filename} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="icon" title="Download file">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Button variant="ghost" size="icon" title="Copy link"
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: 'Link copied' }); }}>
                <Share2 className="h-4 w-4" />
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : doc ? (
            <div className="grid lg:grid-cols-[1fr_260px] h-full overflow-hidden">

              {/* Main panel */}
              <div className="flex flex-col overflow-hidden">
                <Tabs defaultValue="view" className="flex flex-col h-full">
                  <TabsList className="mx-4 mt-3 w-fit shrink-0">
                    <TabsTrigger value="view">
                      {isMarkdownDoc ? 'Content' : 'Details'}
                    </TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    {canEdit && <TabsTrigger value="edit">Edit</TabsTrigger>}
                  </TabsList>

                  {/* View / Content tab */}
                  <TabsContent value="view" className="flex-1 overflow-auto m-0 p-4">
                    {isMarkdownDoc ? (
                      // ── Markdown content rendered with MDEditor ────────────
                      (doc as any).content ? (
                        <div className="rounded-lg border bg-card">
                          <div
                            data-color-mode="auto"
                            data-light-theme="light"
                            data-dark-theme="dark"
                          >
                            <MDEditor.Markdown
                              source={(doc as any).content}
                              style={{
                                backgroundColor: 'transparent',
                                color: 'inherit',
                                padding: '24px',
                                fontSize: '14px',
                                lineHeight: '1.75',
                                minHeight: '400px',
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
                          <FileText className="h-12 w-12 opacity-30" />
                          <p className="text-sm">No content yet.</p>
                          {canEdit && (
                            <p className="text-xs">Switch to the <strong>Edit</strong> tab to add content.</p>
                          )}
                        </div>
                      )
                    ) : (
                      // ── File-based document ────────────────────────────────
                      <div className="rounded-lg border bg-muted/30 p-10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                        <div className="text-6xl">{mimeIcon}</div>
                        <div className="text-center">
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {doc.size} · {doc.mime_type.split('/').pop()?.toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">Uploaded by {doc.uploaded_by_name}</p>
                        </div>
                        {downloadUrl && (
                          <a href={downloadUrl} download={doc.filename} target="_blank" rel="noreferrer">
                            <Button><Download className="h-4 w-4 mr-2" />Download to View</Button>
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground text-center max-w-xs">
                          This file type cannot be previewed in the browser. Download to view its full contents.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Comments tab */}
                  <TabsContent value="comments" className="flex-1 overflow-auto m-0 p-4">
                    <CommentsSection targetId={doc.id} targetType="document" title="Document Comments" />
                  </TabsContent>

                  {/* Edit tab */}
                  {canEdit && (
                    <TabsContent value="edit" className="flex-1 overflow-auto m-0 p-4">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={editCategory} onValueChange={setEditCategory}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Tags</Label>
                          <div className="flex gap-2">
                            <Input placeholder="Add tag…" value={editTagInput}
                              onChange={e => setEditTagInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }}} />
                            <Button type="button" variant="outline" size="sm" onClick={addTag}>
                              <Tag className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {editTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {editTags.map(tag => (
                                <Badge key={tag} variant="secondary" className="gap-1">
                                  {tag}
                                  <button onClick={() => setEditTags(p => p.filter(t => t !== tag))}>
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Markdown content editor */}
                        {isMarkdownDoc && (
                          <div className="space-y-2">
                            <Label>Content</Label>
                            <div data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
                              <MDEditor
                                value={editContent}
                                onChange={v => setEditContent(v || '')}
                                height={400}
                                preview="live"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button onClick={saveEdits} disabled={!editTitle.trim() || updateDoc.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            {updateDoc.isPending ? 'Saving…' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={() => {
                            if (doc) {
                              setEditTitle(doc.title);
                              setEditCategory(doc.category);
                              setEditTags(doc.tags ?? []);
                              setEditContent((doc as any).content ?? '');
                            }
                          }}>
                            Reset
                          </Button>
                        </div>

                        {hasFile && (
                          <p className="text-xs text-muted-foreground">
                            To replace the attached file, use{' '}
                            <Link to={`/documents/${doc.id}/edit`} className="underline hover:text-foreground" onClick={onClose}>
                              Edit Document page
                            </Link>.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="border-l p-4 bg-muted/20 space-y-5 overflow-y-auto">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Document Info
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" /><span>{doc.uploaded_by_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(doc.uploaded_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">
                        {isMarkdownDoc ? 'Markdown' : doc.mime_type.split('/').pop()?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {doc.tags && doc.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="h-3 w-3" />Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.tags.map(tag => (
                        <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workflow actions */}
                {transitions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Workflow</p>
                    <div className="space-y-2">
                      {transitions.includes('review') && docStatus === 'draft' && (
                        <Button className="w-full" size="sm" variant="outline" onClick={() => handleStatus('review')}>
                          Submit for Review
                        </Button>
                      )}
                      {transitions.includes('approved') && docStatus === 'review' && (
                        <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" size="sm"
                          onClick={() => handleStatus('approved')}>
                          <CheckCircle className="h-3.5 w-3.5 mr-2" />Approve
                        </Button>
                      )}
                      {transitions.includes('rejected') && docStatus === 'review' && (
                        <Button className="w-full" size="sm" variant="destructive" onClick={() => handleStatus('rejected')}>
                          <XCircle className="h-3.5 w-3.5 mr-2" />Reject
                        </Button>
                      )}
                      {transitions.includes('draft') && (docStatus === 'review' || docStatus === 'rejected') && (
                        <Button className="w-full" size="sm" variant="outline" onClick={() => handleStatus('draft')}>
                          <RotateCcw className="h-3.5 w-3.5 mr-2" />Return to Draft
                        </Button>
                      )}
                      {transitions.includes('archived') && docStatus === 'approved' && (
                        <Button className="w-full" size="sm" variant="outline" onClick={() => handleStatus('archived')}>
                          <Archive className="h-3.5 w-3.5 mr-2" />Archive
                        </Button>
                      )}
                      {transitions.includes('draft') && docStatus === 'archived' && (
                        <Button className="w-full" size="sm" variant="outline" onClick={() => handleStatus('draft')}>
                          <RotateCcw className="h-3.5 w-3.5 mr-2" />Restore
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t space-y-2">
                  {downloadUrl && (
                    <a href={downloadUrl} download={doc.filename} target="_blank" rel="noreferrer" className="block">
                      <Button className="w-full" size="sm"><Download className="h-3.5 w-3.5 mr-2" />Download File</Button>
                    </a>
                  )}
                  {canEdit && (
                    <Link to={`/documents/${doc.id}/edit`} onClick={onClose} className="block">
                      <Button variant="outline" className="w-full" size="sm">
                        <Edit className="h-3.5 w-3.5 mr-2" />Edit Document
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              Document not found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;