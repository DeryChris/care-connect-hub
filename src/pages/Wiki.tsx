// src/pages/Wiki.tsx
// Responsive card grid. Click any card → centred modal overlay.
// Create via Dialog. Delete with confirmation. pendingItem fix so overlay
// renders immediately after create without waiting for list refetch.

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Save, Clock, FileText, Edit2, Trash2, Plus, Search, X, BookOpen, User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWikiPages, useCreateWikiPage, useUpdateWikiPage, useDeleteWikiPage } from '@/hooks';

const DEFAULT_CONTENT = `## Overview\n\nWrite a brief overview of this page here.\n\n## Details\n\nAdd detailed content, steps, or guidelines.\n\n## Notes\n\nAny additional notes or references.\n`;

function excerpt(md: string, max = 130): string {
  const plain = md.replace(/#+\s/g, '').replace(/[*_`>\-]/g, '').replace(/\n+/g, ' ').trim();
  return plain.length > max ? plain.slice(0, max) + '…' : plain;
}

const Wiki = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Overlay state ─────────────────────────────────────────────────────────
  const [overlayId,    setOverlayId]   = useState<string | null>(null);
  const [pendingItem,  setPendingItem] = useState<any | null>(null);
  const [isEditing,    setIsEditing]   = useState(false);
  const [editTitle,    setEditTitle]   = useState('');
  const [editContent,  setEditContent] = useState('');

  // ── Create dialog state ───────────────────────────────────────────────────
  const [showCreate,  setShowCreate]  = useState(false);
  const [newTitle,    setNewTitle]    = useState('');
  const [newContent,  setNewContent]  = useState(DEFAULT_CONTENT);

  // ── List state ────────────────────────────────────────────────────────────
  const [search,       setSearch]      = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useWikiPages();
  const allPages   = data?.data ?? [];
  const pages      = allPages.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()),
  );

  // Use the live fetched version if available; fall back to pendingItem
  // This ensures the overlay renders immediately after create/edit without
  // waiting for the list query to refetch.
  const overlayPage = allPages.find(p => p.id === overlayId) ?? pendingItem;

  const updatePage = useUpdateWikiPage();
  const createPage = useCreateWikiPage();
  const deletePage = useDeleteWikiPage?.();

  // ── Permissions ───────────────────────────────────────────────────────────
  const canEditPage = (authorId?: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.permissions?.includes('kms_wiki_edit')) return true;
    if (authorId && authorId === user.id) return true;
    return ['it_staff', 'admin_staff'].includes(user.designation ?? '');
  };

  const canCreate =
    !user ? false
    : user.role === 'admin'
    || user.permissions?.includes('kms_wiki_edit')
    || user.permissions?.includes('kms_create')
    || ['admin_staff', 'it_staff', 'doctor', 'nurse'].includes(user.designation ?? '');

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openOverlay = (item: any) => {
    setOverlayId(item.id);
    setPendingItem(item);
    setIsEditing(false);
  };

  const closeOverlay = () => {
    setOverlayId(null);
    setPendingItem(null);
    setIsEditing(false);
  };

  const startEdit = () => {
    if (!overlayPage) return;
    setEditTitle(overlayPage.title);
    setEditContent(overlayPage.content);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const saveEdit = () => {
    if (!overlayPage || !editTitle.trim()) return;
    updatePage.mutate(
      { id: overlayPage.id, data: { title: editTitle.trim(), content: editContent } },
      {
        onSuccess: (res: any) => {
          setPendingItem(res.data); // update overlay immediately with fresh data
          setIsEditing(false);
          toast({ title: 'Page saved' });
        },
        onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
      },
    );
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createPage.mutate(
      { title: newTitle.trim(), content: newContent },
      {
        onSuccess: (res: any) => {
          setShowCreate(false);
          setNewTitle('');
          setNewContent(DEFAULT_CONTENT);
          openOverlay(res.data); // pass full item — no waiting for refetch
          toast({ title: 'Page created' });
        },
        onError: () => toast({ title: 'Create failed', variant: 'destructive' }),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget || !deletePage) return;
    deletePage.mutate(deleteTarget, {
      onSuccess: () => {
        if (overlayId === deleteTarget) closeOverlay();
        setDeleteTarget(null);
        toast({ title: 'Page deleted' });
      },
      onError: () => toast({ title: 'Delete failed', variant: 'destructive' }),
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Wiki</h1>
          <p className="text-sm text-muted-foreground">
            {allPages.length} pages · Collaborative knowledge space
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />New Page
          </Button>
        )}
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ── Card grid ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <BookOpen className="h-12 w-12 opacity-30" />
          <p className="text-sm">
            {search ? 'No pages match your search' : 'No wiki pages yet'}
          </p>
          {canCreate && !search && (
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
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
              onClick={() => openOverlay(page)}
            >
              <CardContent className="p-0 flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-primary/70 to-primary/20 w-full" />
                <div className="p-4 flex flex-col gap-3">

                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                        {page.title}
                      </p>
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

                  {/* Excerpt */}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                    {excerpt(page.content)}
                  </p>

                  {/* Footer */}
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

      {/* ── Centred read / edit overlay ─────────────────────────────────────── */}
      {overlayId && overlayPage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={closeOverlay}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal panel */}
          <div
            className="
              relative z-10 flex flex-col
              bg-card border border-border/50 rounded-2xl shadow-2xl
              w-full max-w-4xl max-h-[88vh]
              overflow-hidden
            "
            style={{ animation: 'overlayIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent shrink-0" />

            {/* Header */}
            <div className="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-border/60 shrink-0">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="text-lg font-bold"
                    placeholder="Page title…"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                    {overlayPage.title}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                  <User className="h-3 w-3" />
                  <span>{overlayPage.author}</span>
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(overlayPage.updated_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={!editTitle.trim() || updatePage.isPending}
                    >
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      {updatePage.isPending ? 'Saving…' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEdit}>
                      <X className="h-3.5 w-3.5 mr-1" />Cancel
                    </Button>
                  </>
                ) : (
                  canEditPage(overlayPage.author_id) && (
                    <Button variant="outline" size="sm" onClick={startEdit}>
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                    </Button>
                  )
                )}
                <button
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  onClick={closeOverlay}
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5">
                {isEditing ? (
                  <div data-color-mode="light">
                    <MDEditor
                      value={editContent}
                      onChange={v => setEditContent(v || '')}
                      height={380}
                      preview="live"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {editContent.length.toLocaleString()} characters
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none
                    prose-headings:font-bold prose-headings:text-foreground
                    prose-p:text-foreground/90 prose-strong:text-foreground
                    prose-table:w-full
                    prose-th:text-left prose-th:font-semibold prose-th:p-2
                    prose-th:border prose-th:bg-muted/50
                    prose-td:p-2 prose-td:border prose-td:text-foreground
                    prose-code:bg-muted prose-code:px-1 prose-code:rounded
                    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                    <ReactMarkdown>{overlayPage.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Comments — only shown in view mode */}
              {!isEditing && (
                <div className="px-6 pb-6">
                  <CommentsSection
                    targetId={overlayPage.id}
                    targetType="wiki"
                    title="Page Discussion"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Dialog ────────────────────────────────────────────────────── */}
      <Dialog
        open={showCreate}
        onOpenChange={open => {
          setShowCreate(open);
          if (!open) { setNewTitle(''); setNewContent(DEFAULT_CONTENT); }
        }}
      >
        <DialogContent className="w-full max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Wiki Page</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Page Title *</Label>
              <Input
                placeholder="Enter page title…"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <div data-color-mode="light">
                <MDEditor
                  value={newContent}
                  onChange={v => setNewContent(v || '')}
                  height={300}
                  preview="live"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {newContent.length.toLocaleString()} characters
              </p>
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-2">
            <Button
              variant="outline"
              onClick={() => { setShowCreate(false); setNewTitle(''); setNewContent(DEFAULT_CONTENT); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createPage.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {createPage.isPending ? 'Creating…' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wiki Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the page and all its comments.
              This action cannot be undone.
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

      {/* Overlay entrance animation */}
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default Wiki;