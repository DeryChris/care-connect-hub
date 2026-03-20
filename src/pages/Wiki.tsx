// src/pages/Wiki.tsx
// Replaces the hardcoded initialPages array with useWikiPages() + useUpdateWikiPage() API hooks.
// All MDEditor, CommentsSection, and UI logic is unchanged.

import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Clock, FileText, Edit2, Eye, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWikiPages, useCreateWikiPage, useUpdateWikiPage } from '@/hooks';

const Wiki = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { data, isLoading } = useWikiPages();
  const pages = data?.data ?? [];
  const selectedPage = pages.find(p => p.id === selectedId) ?? pages[0];

  const updatePage = useUpdateWikiPage();
  const createPage = useCreateWikiPage();

  const canEdit = user?.role === 'admin' ||
    selectedPage?.author_id === user?.id ||
    ['it_staff', 'admin_staff'].includes(user?.designation ?? '');

  const startEdit = () => {
    if (!selectedPage) return;
    setEditTitle(selectedPage.title);
    setEditContent(selectedPage.content);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedPage) return;
    updatePage.mutate(
      { id: selectedPage.id, data: { title: editTitle, content: editContent } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createPage.mutate(
      { title: newTitle.trim(), content: `## ${newTitle}\n\nStart writing here...` },
      {
        onSuccess: (res) => {
          setSelectedId(res.data.id);
          setShowNewForm(false);
          setNewTitle('');
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Wiki</h1>
          <p className="text-sm text-muted-foreground">
            {pages.length} pages · Collaborative knowledge base
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="h-4 w-4 mr-2" /> New Page
          </Button>
        )}
      </div>

      {showNewForm && (
        <Card>
          <CardContent className="p-4 flex gap-3">
            <Input
              placeholder="Page title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="flex-1"
            />
            <Button onClick={handleCreate} disabled={!newTitle.trim() || createPage.isPending}>
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">Pages</p>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            : pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => { setSelectedId(page.id); setIsEditing(false); }}
                  className={`w-full text-left rounded-lg p-3 transition-colors border ${
                    selectedPage?.id === page.id
                      ? 'bg-primary/10 border-primary/20'
                      : 'hover:bg-secondary border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(page.updated_at).toLocaleDateString('en-GB')}</span>
                    <span>· {page.author}</span>
                  </div>
                </button>
              ))
          }
        </div>

        {/* Content area */}
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </CardContent></Card>
          ) : selectedPage ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {isEditing
                        ? <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-xl font-bold" />
                        : <CardTitle className="text-xl font-display">{selectedPage.title}</CardTitle>
                      }
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Last edited by {selectedPage.author}</span>
                        <span>·</span>
                        <span>{new Date(selectedPage.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!isEditing && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => setViewMode(v => v === 'preview' ? 'edit' : 'preview')}>
                            {viewMode === 'preview' ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          {canEdit && (
                            <Button variant="outline" size="sm" onClick={startEdit}>
                              <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                            </Button>
                          )}
                        </>
                      )}
                      {isEditing && (
                        <>
                          <Button size="sm" onClick={saveEdit} disabled={updatePage.isPending}>
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                            {updatePage.isPending ? 'Saving…' : 'Save'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div data-color-mode="light">
                      <MDEditor value={editContent} onChange={v => setEditContent(v || '')} height={400} />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-table:w-full prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50 prose-td:p-2 prose-td:border">
                      <ReactMarkdown>{selectedPage.content}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <CommentsSection
                targetId={selectedPage.id}
                targetType="wiki"
              />
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a page from the sidebar</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wiki;
