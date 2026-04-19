// src/pages/Wiki.tsx
// Card grid layout. Single overlay handles VIEW / EDIT / CREATE.
// No Radix Dialog — same pattern as KnowledgeBase / Documents.

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Save, Clock, FileText, Edit2, Trash2, Plus, Search, X, BookOpen, User, Printer,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWikiPages, useCreateWikiPage, useUpdateWikiPage, useDeleteWikiPage } from '@/hooks';
import { printDocument } from '@/lib/printDocument';

const DEFAULT_CONTENT = `## Overview\n\nWrite a brief overview of this page here.\n\n## Details\n\nAdd detailed content, steps, or guidelines.\n\n## Notes\n\nAny additional notes or references.\n`;

function excerpt(md: string, max = 130): string {
  const plain = md.replace(/#+\s/g, '').replace(/[*_`>\-]/g, '').replace(/\n+/g, ' ').trim();
  return plain.length > max ? plain.slice(0, max) + '…' : plain;
}

type OverlayMode = 'view' | 'edit' | 'create';

const Wiki = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [mode,         setMode]         = useState<OverlayMode | null>(null);
  const [activeItem,   setActiveItem]   = useState<any | null>(null);
  const [editTitle,    setEditTitle]    = useState('');
  const [editContent,  setEditContent]  = useState('');
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useWikiPages();
  const allPages = data?.data ?? [];
  const pages    = allPages.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const updatePage = useUpdateWikiPage();
  const createPage = useCreateWikiPage();
  const deletePage = useDeleteWikiPage?.();

  // ── Permissions ───────────────────────────────────────────────────────────
  const canEditPage = (authorId?: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.permissions?.includes('kms_wiki_edit')) return true;
    if (authorId && authorId === user.id) return true;
    return ['it_staff', 'admin_staff'].includes(user.designation ?? '');
  };

  const canCreate = !user ? false
    : user.role === 'admin'
    || user.permissions?.includes('kms_wiki_edit')
    || user.permissions?.includes('kms_create')
    || ['admin_staff', 'it_staff', 'doctor', 'nurse'].includes(user.designation ?? '');

  // ── Overlay helpers ───────────────────────────────────────────────────────
  const closeOverlay = () => { setMode(null); setActiveItem(null); setEditTitle(''); setEditContent(''); };

  const openView = (item: any) => { setActiveItem(item); setMode('view'); };

  const openCreate = () => {
    setEditTitle(''); setEditContent(DEFAULT_CONTENT);
    setActiveItem(null); setMode('create');
  };

  const openEdit = () => {
    if (!activeItem) return;
    setEditTitle(activeItem.title);
    setEditContent(activeItem.content);
    setMode('edit');
  };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!editTitle.trim()) return;
    createPage.mutate(
      { title: editTitle.trim(), content: editContent },
      {
        onSuccess: (res: any) => {
          setActiveItem(res.data);
          setMode('view');
          toast({ title: 'Page created' });
        },
        onError: () => toast({ title: 'Create failed', variant: 'destructive' }),
      },
    );
  };

  const handleSaveEdit = () => {
    if (!activeItem || !editTitle.trim()) return;
    updatePage.mutate(
      { id: activeItem.id, data: { title: editTitle.trim(), content: editContent } },
      {
        onSuccess: (res: any) => {
          setActiveItem(res.data);
          setMode('view');
          toast({ title: 'Page saved' });
        },
        onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget || !deletePage) return;
    deletePage.mutate(deleteTarget, {
      onSuccess: () => {
        if (activeItem?.id === deleteTarget) closeOverlay();
        setDeleteTarget(null);
        toast({ title: 'Page deleted' });
      },
      onError: () => toast({ title: 'Delete failed', variant: 'destructive' }),
    });
  };

  const handlePrint = () => {
    if (!activeItem) return;
    printDocument({
      title: activeItem.title,
      content: activeItem.content,
      meta: {
        author: activeItem.author,
        date: new Date(activeItem.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      },
    });
  };

  const overlayOpen = mode !== null;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Wiki</h1>
          <p className="text-sm text-muted-foreground">{allPages.length} pages · Collaborative knowledge space</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />New Page
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search pages…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <BookOpen className="h-12 w-12 opacity-30" />
          <p className="text-sm">{search ? 'No pages match your search' : 'No wiki pages yet'}</p>
          {canCreate && !search && (
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Create first page
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pages.map(page => (
            <Card
              key={page.id}
              className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-border/60"
              onClick={() => openView(page)}
            >
              <CardContent className="p-0 flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-primary/70 to-primary/20 w-full" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{page.title}</p>
                    </div>
                    {canEditPage(page.author_id) && (
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all shrink-0 mt-0.5"
                        onClick={e => { e.stopPropagation(); setDeleteTarget(page.id); }}
                        title="Delete page"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">{excerpt(page.content)}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{page.author}</span>
                    <span className="ml-auto flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(page.updated_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Overlay — view / edit / create ───────────────────────────────── */}
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
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent shrink-0" />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0 space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {mode === 'view' ? (
                    <>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">{activeItem?.title}</h2>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <User className="h-3 w-3" /><span>{activeItem?.author}</span>
                        <span>·</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(activeItem?.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <Label>{mode === 'create' ? 'Title *' : 'Title'}</Label>
                      <Input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Page title…"
                        className="text-lg font-bold"
                        autoFocus={mode === 'create'}
                      />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {mode === 'view' && (
                    <>
                      <Button variant="outline" size="sm" onClick={handlePrint} title="Print / Save as PDF">
                        <Printer className="h-3.5 w-3.5 mr-1.5" />Print
                      </Button>
                      {canEditPage(activeItem?.author_id) && (
                        <Button variant="outline" size="sm" onClick={openEdit}>
                          <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                        </Button>
                      )}
                    </>
                  )}
                  {mode === 'edit' && (
                    <>
                      <Button size="sm" onClick={handleSaveEdit} disabled={!editTitle.trim() || updatePage.isPending}>
                        <Save className="h-3.5 w-3.5 mr-1.5" />{updatePage.isPending ? 'Saving…' : 'Save'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setMode('view')}>
                        <X className="h-3.5 w-3.5 mr-1" />Cancel
                      </Button>
                    </>
                  )}
                  {mode === 'create' && (
                    <Button size="sm" onClick={handleCreate} disabled={!editTitle.trim() || createPage.isPending}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />{createPage.isPending ? 'Creating…' : 'Create Page'}
                    </Button>
                  )}
                  <button
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    onClick={closeOverlay}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5">
                {mode === 'view' && <MarkdownRenderer content={activeItem?.content ?? ''} />}
                {(mode === 'edit' || mode === 'create') && (
                  <div data-color-mode="light">
                    <MDEditor value={editContent} onChange={v => setEditContent(v || '')} height={400} preview="live" />
                    <p className="text-xs text-muted-foreground mt-2">{editContent.length.toLocaleString()} characters</p>
                  </div>
                )}
              </div>
              {mode === 'view' && activeItem && (
                <div className="px-6 pb-6">
                  <CommentsSection targetId={activeItem.id} targetType="wiki" title="Page Discussion" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wiki Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the page and all its comments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Wiki;