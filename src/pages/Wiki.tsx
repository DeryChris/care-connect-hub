// src/pages/Wiki.tsx
// Improved wiki with:
//  - Better create/edit UX with full MDEditor + live preview toggle
//  - Delete page confirmation
//  - KMS-aware permission checks (kms_wiki_edit key + fallback)
//  - Session-storage draft autosave while editing
//  - Search/filter pages in sidebar

import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Save, Clock, FileText, Edit2, Eye, Trash2, Plus, Search,
  X, BookOpen, User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWikiPages, useCreateWikiPage, useUpdateWikiPage, useDeleteWikiPage } from '@/hooks';

const DRAFT_KEY = 'wiki_draft_content';
const DRAFT_TITLE_KEY = 'wiki_draft_title';

const DEFAULT_CONTENT = `## Overview

Write a brief overview of this page here.

## Details

Add detailed content, steps, or guidelines.

## Notes

Any additional notes or references.
`;

const Wiki = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('preview');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState(DEFAULT_CONTENT);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useWikiPages();
  const allPages = data?.data ?? [];
  const pages = allPages.filter(p =>
    !sidebarSearch || p.title.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );
  const selectedPage = allPages.find(p => p.id === selectedId) ?? allPages[0];

  const updatePage = useUpdateWikiPage();
  const createPage = useCreateWikiPage();
  const deletePage = useDeleteWikiPage?.();  // may not exist — handled gracefully

  // ── Permission check ─────────────────────────────────────────────────────
  // Can edit if: admin, OR has kms_wiki_edit perm, OR is the page author,
  // OR has it_staff / admin_staff designation (fallback for older accounts)
  const canEditPage = (authorId?: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.permissions.includes('kms_wiki_edit')) return true;
    if (authorId && authorId === user.id) return true;
    return ['it_staff', 'admin_staff'].includes(user.designation ?? '');
  };

  const canCreatePage =
    !user ? false
    : user.role === 'admin'
    || user.permissions.includes('kms_wiki_edit')
    || user.permissions.includes('kms_create')
    || ['admin_staff', 'it_staff', 'doctor', 'nurse'].includes(user.designation ?? '');

  // ── Draft autosave ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isEditing) {
      sessionStorage.setItem(DRAFT_KEY, editContent);
      sessionStorage.setItem(DRAFT_TITLE_KEY, editTitle);
    }
  }, [editContent, editTitle, isEditing]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const startEdit = () => {
    if (!selectedPage) return;
    // Restore draft if it matches this page
    const savedTitle   = sessionStorage.getItem(DRAFT_TITLE_KEY);
    const savedContent = sessionStorage.getItem(DRAFT_KEY);
    setEditTitle(savedTitle && savedTitle !== selectedPage.title ? selectedPage.title : (savedTitle ?? selectedPage.title));
    setEditContent(savedContent ?? selectedPage.content);
    setIsEditing(true);
    setViewMode('edit');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_TITLE_KEY);
  };

  const saveEdit = () => {
    if (!selectedPage || !editTitle.trim()) return;
    updatePage.mutate(
      { id: selectedPage.id, data: { title: editTitle.trim(), content: editContent } },
      {
        onSuccess: () => {
          setIsEditing(false);
          sessionStorage.removeItem(DRAFT_KEY);
          sessionStorage.removeItem(DRAFT_TITLE_KEY);
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
        onSuccess: res => {
          setSelectedId(res.data.id);
          setShowNewDialog(false);
          setNewTitle('');
          setNewContent(DEFAULT_CONTENT);
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
        setDeleteTarget(null);
        if (selectedId === deleteTarget) setSelectedId(null);
        toast({ title: 'Page deleted' });
      },
      onError: () => toast({ title: 'Delete failed', variant: 'destructive' }),
    });
  };

  const canEdit = canEditPage(selectedPage?.author_id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Wiki</h1>
          <p className="text-sm text-muted-foreground">
            {allPages.length} pages · Collaborative knowledge space
          </p>
        </div>
        {canCreatePage && (
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />New Page
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Pages ({pages.length})
          </p>

          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
            : pages.length === 0
            ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No pages found</p>
                </div>
              )
            : pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => { setSelectedId(page.id); setIsEditing(false); }}
                  className={`w-full text-left rounded-lg p-3 transition-colors border group ${
                    selectedPage?.id === page.id
                      ? 'bg-primary/10 border-primary/20'
                      : 'hover:bg-secondary border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
                    </div>
                    {canEditPage(page.author_id) && (
                      <button
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity shrink-0"
                        onClick={e => { e.stopPropagation(); setDeleteTarget(page.id); }}
                        title="Delete page"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(page.updated_at).toLocaleDateString('en-GB')}</span>
                    <span>·</span>
                    <User className="h-3 w-3" />
                    <span className="truncate">{page.author}</span>
                  </div>
                </button>
              ))
          }
        </div>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="space-y-4 min-w-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : selectedPage ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Page Title</Label>
                          <Input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="text-lg font-bold"
                            placeholder="Page title..."
                          />
                        </div>
                      ) : (
                        <CardTitle className="text-xl font-display break-words">
                          {selectedPage.title}
                        </CardTitle>
                      )}
                      {!isEditing && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />Last edited by {selectedPage.author}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(selectedPage.updated_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          {/* View mode toggles */}
                          <div className="flex border rounded-md overflow-hidden text-xs">
                            {(['edit', 'split', 'preview'] as const).map(m => (
                              <button
                                key={m}
                                className={`px-2.5 py-1.5 capitalize transition-colors ${
                                  viewMode === m
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => setViewMode(m)}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
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
                        canEdit && (
                          <Button variant="outline" size="sm" onClick={startEdit}>
                            <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {isEditing ? (
                    <div data-color-mode="light">
                      {viewMode === 'edit' && (
                        <MDEditor
                          value={editContent}
                          onChange={v => setEditContent(v || '')}
                          height={450}
                          preview="edit"
                        />
                      )}
                      {viewMode === 'preview' && (
                        <MDEditor
                          value={editContent}
                          onChange={v => setEditContent(v || '')}
                          height={450}
                          preview="preview"
                        />
                      )}
                      {viewMode === 'split' && (
                        <MDEditor
                          value={editContent}
                          onChange={v => setEditContent(v || '')}
                          height={450}
                          preview="live"
                        />
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {editContent.length.toLocaleString()} characters ·
                        Draft auto-saved
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-table:w-full prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50 prose-td:p-2 prose-td:border">
                      <ReactMarkdown>{selectedPage.content}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <CommentsSection
                targetId={selectedPage.id}
                targetType="wiki"
                title="Page Discussion"
              />
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a page from the sidebar</p>
                {canCreatePage && (
                  <Button
                    variant="outline" size="sm" className="mt-4"
                    onClick={() => setShowNewDialog(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Create first page
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── New Page Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={showNewDialog} onOpenChange={open => { if (!open) setShowNewDialog(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Wiki Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto py-2">
            <div className="space-y-2">
              <Label>Page Title *</Label>
              <Input
                placeholder="Enter page title..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <div data-color-mode="light">
                <MDEditor
                  value={newContent}
                  onChange={v => setNewContent(v || '')}
                  height={350}
                  preview="live"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {newContent.length.toLocaleString()} characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowNewDialog(false); setNewTitle(''); setNewContent(DEFAULT_CONTENT); }}
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

      {/* ── Delete Confirm ────────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wiki Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the page and all its comments. This action cannot be undone.
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
    </div>
  );
};

export default Wiki;