import CommentsSection from '@/components/content/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, FileText, Edit2, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


interface WikiPage {
  id: string;
  title: string;
  content: string;
  author: string;
  updatedAt: string;
}

const initialPages: WikiPage[] = [
  {
    id: '1',
    title: 'Hospital Overview',
    content: `## Care Connect Hospital

Welcome to the internal wiki. This is the central knowledge hub for hospital staff.

## Quick Links
- [Protocols & Guidelines](/knowledge)
- [Document Library](/documents)
- [Staff Directory](/users)

## Mission
To provide exceptional patient care through evidence-based practice, continuous learning, and collaborative teamwork.

## Key Contacts
| Department | Extension |
|------------|-----------|
| Emergency | Ext. 100 |
| ICU | Ext. 200 |
| Pharmacy | Ext. 300 |
| Lab | Ext. 400 |`,
    author: 'Admin User',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    title: 'IT Systems Guide',
    content: `## Systems Overview

### HMIS (Hospital Management Information System)
The main system for patient records, appointments, lab results, and billing.

**Login**: Use your hospital email and assigned password.
**Password Reset**: Contact IT at Ext. 500 or it@hmis.com

### Email
- Webmail: https://mail.hospital.local
- All clinical communication must use hospital email only

### Network
- Clinical Wi-Fi: **HospitalClinical** (password at nursing station)
- Staff Wi-Fi: **HospitalStaff** (use your login credentials)

## Requesting IT Support
1. Submit a ticket via the IT portal
2. Urgent issues: Call Ext. 500
3. Out-of-hours emergencies: Use on-call IT pager`,
    author: 'Admin User',
    updatedAt: '2024-11-15',
  },
  {
    id: '3',
    title: 'Pharmacy Formulary Summary',
    content: `## Approved Formulary Categories

### Analgesics
- Paracetamol 500mg/1g tablets, IV
- Ibuprofen 200mg/400mg
- Morphine 10mg/ml injection, oral solution

### Antibiotics (Common)
- Amoxicillin 250mg/500mg
- Co-amoxiclav 625mg tablets, 1.2g IV
- Flucloxacillin 500mg capsules, 1g IV
- Metronidazole 400mg tablets, 500mg IV

### Cardiovascular
- Atenolol 25mg/50mg
- Ramipril 2.5mg/5mg/10mg
- Atorvastatin 10mg/20mg/40mg/80mg
- Furosemide 20mg/40mg tablets, IV

## Non-Formulary Requests
Submit via pharmacy form — allow 48hrs for approval`,
    author: 'Michael Brown',
    updatedAt: '2024-10-20',
  },
];

type ViewMode = 'list' | 'view' | 'edit' | 'new';

const Wiki = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [pages, setPages] = useState<WikiPage[]>(initialPages);
  const [mode, setMode] = useState<ViewMode>('list');
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'split'>('edit');

  const openPage = (page: WikiPage) => {
    setSelectedPage(page);
    setMode('view');
  };

  const startEdit = (page: WikiPage) => {
    setSelectedPage(page);
    setEditTitle(page.title);
    setEditContent(page.content);
    setPreviewMode('edit');
    setMode('edit');
  };

  const startNew = () => {
    setSelectedPage(null);
    setEditTitle('');
    setEditContent('## Overview\n\nWrite your content here.');
    setPreviewMode('edit');
    setMode('new');
  };

  const savePage = () => {
    if (!editTitle.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }

    const now = new Date().toISOString().split('T')[0];

    if (mode === 'new') {
      const newPage: WikiPage = {
        id: Date.now().toString(),
        title: editTitle,
        content: editContent,
        author: user?.name || 'Unknown',
        updatedAt: now,
      };
      setPages(prev => [...prev, newPage]);
      setSelectedPage(newPage);
    } else if (selectedPage) {
      const updated = {
        ...selectedPage,
        title: editTitle,
        content: editContent,
        updatedAt: now,
      };
      setPages(prev => prev.map(p => p.id === selectedPage.id ? updated : p));
      setSelectedPage(updated);
    }

    toast({ title: 'Page saved successfully' });
    setMode('view');
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setMode('list');
    toast({ title: 'Page deleted' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Wiki</h1>
          <p className="text-sm text-muted-foreground">{pages.length} pages</p>
        </div>
        <div className="flex gap-2">
          {mode !== 'list' && (
            <Button variant="outline" onClick={() => setMode('list')}>
              ← All Pages
            </Button>
          )}
          {(mode === 'view' || mode === 'list') && (
            <Button onClick={startNew}>
              <FileText className="h-4 w-4 mr-2" /> New Page
            </Button>
          )}
          {mode === 'view' && selectedPage && (
            <Button variant="outline" onClick={() => startEdit(selectedPage)}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
          {(mode === 'edit' || mode === 'new') && (
            <Button onClick={savePage}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          )}
        </div>
      </div>

      {/* Page list */}
      {mode === 'list' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map(page => (
            <Card
              key={page.id}
              className="stat-card cursor-pointer"
              onClick={() => openPage(page)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1">{page.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {page.content.replace(/#+\s/g, '').replace(/\*\*/g, '').substring(0, 100)}...
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {page.updatedAt}
                  </span>
                  <span>{page.author}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {pages.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-40" />
              <p>No wiki pages yet. Create the first one!</p>
            </div>
          )}
        </div>
      )}

      {/* View mode */}
      {mode === 'view' && selectedPage && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
          <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold font-display">{selectedPage.title}</CardTitle>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground pb-4 border-b mt-2">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedPage.updatedAt}</span>
                <span>by {selectedPage.author}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="prose prose-sm max-w-none
                prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-foreground prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-table:w-full prose-table:text-sm
                prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50
                prose-td:p-2 prose-td:border
                prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
              ">
                <ReactMarkdown>{selectedPage.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
          <CommentsSection targetId={selectedPage.id} targetType="wiki" />
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Info</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last edited</span>
                    <span>{selectedPage.updatedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author</span>
                    <span>{selectedPage.author}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => startEdit(selectedPage)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit Page
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => deletePage(selectedPage.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other Pages</p>
                {pages.filter(p => p.id !== selectedPage.id).map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left text-sm p-2 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => openPage(p)}
                  >
                    {p.title}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit / New mode */}
      {(mode === 'edit' || mode === 'new') && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Input
                placeholder="Page title..."
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0 pt-4 px-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Content</p>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={previewMode === 'edit' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPreviewMode('edit')}
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant={previewMode === 'split' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPreviewMode('split')}
                  >
                    Split
                  </Button>
                  <Button
                    variant={previewMode === 'preview' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPreviewMode('preview')}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {previewMode === 'edit' && (
                <MDEditor
                  value={editContent}
                  onChange={val => setEditContent(val || '')}
                  height={520}
                  preview="edit"
                  data-color-mode="light"
                />
              )}
              {previewMode === 'preview' && (
                <div className="min-h-[520px] p-4 border rounded-lg bg-muted/20">
                  <div className="prose prose-sm max-w-none
                    prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                    prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                    prose-p:text-foreground prose-p:leading-relaxed
                    prose-strong:text-foreground
                    prose-table:w-full prose-table:text-sm
                    prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50
                    prose-td:p-2 prose-td:border
                    prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
                  ">
                    <ReactMarkdown>{editContent}</ReactMarkdown>
                  </div>
                </div>
              )}
              {previewMode === 'split' && (
                <div className="grid grid-cols-2 gap-4">
                  <MDEditor
                    value={editContent}
                    onChange={val => setEditContent(val || '')}
                    height={520}
                    preview="edit"
                    data-color-mode="light"
                  />
                  <div className="min-h-[520px] p-4 border rounded-lg bg-muted/20 overflow-y-auto">
                    <div className="prose prose-sm max-w-none
                      prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                      prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                      prose-p:text-foreground prose-p:leading-relaxed
                      prose-strong:text-foreground
                      prose-table:w-full prose-table:text-sm
                      prose-th:text-left prose-th:font-semibold prose-th:p-2 prose-th:border prose-th:bg-muted/50
                      prose-td:p-2 prose-td:border
                      prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
                    ">
                      <ReactMarkdown>{editContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMode(selectedPage ? 'view' : 'list')}>Cancel</Button>
            <Button onClick={savePage}>
              <Save className="h-4 w-4 mr-2" /> Save Page
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wiki;
