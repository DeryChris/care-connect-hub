// src/pages/DocumentForm.tsx
// Two modes selectable via tabs:
//   1. Markdown mode  — write content inline with MDEditor (no file needed)
//   2. File upload    — upload a PDF, Word, Excel, etc. (traditional)
// Guards permission check behind `initialising` to prevent blank page on refresh.

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Save, Send, Upload, X, Tag, FileText, Edit3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  hasContentPermission, STATUS_LABELS, STATUS_COLORS,
} from '@/lib/permissions';
import {
  useDepartments, useDocument, useUploadDocument,
  useUpdateDocument, useUpdateDocumentStatus,
} from '@/hooks';
import { useToast } from '@/hooks/use-toast';

const DOCUMENT_CATEGORIES = [
  { value: 'protocol',  label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop',       label: 'SOP' },
  { value: 'manual',    label: 'Manual' },
  { value: 'training',  label: 'Training' },
  { value: 'report',    label: 'Report' },
];

const ALLOWED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg';

const DEFAULT_CONTENT = `## Overview

Describe the purpose of this document.

## Procedure

Step-by-step instructions here.

## References

- Reference 1
`;

type DocMode = 'markdown' | 'file';

const DocumentForm = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { user, initialising } = useAuth();
  const { toast }    = useToast();
  const isEdit       = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existing, isLoading: loadingDoc } = useDocument(id ?? '');
  const { data: deptsData } = useDepartments({ active: true });
  const departments = deptsData?.data ?? [];

  const uploadDoc    = useUploadDocument();
  const updateDoc    = useUpdateDocument();
  const updateStatus = useUpdateDocumentStatus();

  const [mode,         setMode]         = useState<DocMode>('markdown');
  const [title,        setTitle]        = useState('');
  const [category,     setCategory]     = useState('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [content,      setContent]      = useState(DEFAULT_CONTENT);
  const [tagInput,     setTagInput]     = useState('');
  const [tags,         setTags]         = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver,     setDragOver]     = useState(false);

  useEffect(() => {
    if (existing?.data) {
      const d = existing.data as any;
      setTitle(d.title);
      setCategory(d.category);
      setDepartmentId(d.department_id ?? '');
      setTags(d.tags ?? []);
      // Determine mode from existing doc
      if (d.file_path && d.file_path !== '') {
        setMode('file');
      } else {
        setMode('markdown');
        setContent(d.content ?? DEFAULT_CONTENT);
      }
    }
  }, [existing]);

  // ── Loading states ────────────────────────────────────────────────────────
  if (initialising || (isEdit && loadingDoc)) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  const existingDoc = existing?.data as any;

  // Permission check (safe — user is not null here, initialising is false)
  const canEdit = isEdit
    ? hasContentPermission(user, 'update', 'document', existingDoc?.uploaded_by)
    : hasContentPermission(user, 'create', 'document');

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-muted-foreground">
          You don't have permission to {isEdit ? 'edit' : 'create'} documents.
        </p>
        <Link to="/documents">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
      </div>
    );
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput('');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleSubmit = (submitStatus: 'draft' | 'review' = 'draft') => {
    if (!title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }

    const fd = new FormData();
    fd.append('title',    title.trim());
    fd.append('category', category);
    fd.append('tags',     JSON.stringify(tags));
    if (departmentId) fd.append('department_id', departmentId);

    if (mode === 'markdown') {
      fd.append('content', content);
    } else {
      if (!isEdit && !selectedFile) {
        toast({ title: 'Please select a file', variant: 'destructive' });
        return;
      }
      if (selectedFile) fd.append('file', selectedFile);
    }

    if (isEdit && id) {
      updateDoc.mutate(
        { id, formData: fd },
        {
          onSuccess: () => { toast({ title: 'Document updated' }); navigate('/documents'); },
          onError:   (e: any) => toast({ title: e?.error?.message ?? 'Update failed', variant: 'destructive' }),
        },
      );
    } else {
      uploadDoc.mutate(fd, {
        onSuccess: () => { toast({ title: 'Document created' }); navigate('/documents'); },
        onError:   (e: any) => toast({ title: e?.error?.message ?? 'Create failed', variant: 'destructive' }),
      });
    }
  };

  const isPending = uploadDoc.isPending || updateDoc.isPending;
  const docStatus = existingDoc?.status as any;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Document' : 'New Document'}</h1>
            {isEdit && existingDoc && (
              <Badge className={STATUS_COLORS[docStatus] || ''}>{STATUS_LABELS[docStatus] || docStatus}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Mode selector — only shown when creating a new document */}
      {!isEdit && (
        <Tabs value={mode} onValueChange={v => setMode(v as DocMode)}>
          <TabsList className="w-full max-w-sm">
            <TabsTrigger value="markdown" className="flex-1 gap-2">
              <Edit3 className="h-4 w-4" />Write with Editor
            </TabsTrigger>
            <TabsTrigger value="file" className="flex-1 gap-2">
              <Upload className="h-4 w-4" />Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markdown" className="mt-0">
            {/* Metadata card */}
            <div className="grid gap-6 lg:grid-cols-[1fr_280px] mt-6">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-md">Document Title *</Label>
                      <Input id="title-md" placeholder="Enter document title"
                        value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <div data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
                        <MDEditor
                          value={content}
                          onChange={v => setContent(v || '')}
                          height={500}
                          preview="live"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {content.length.toLocaleString()} characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <ActionBar onDraft={() => handleSubmit('draft')} onReview={() => handleSubmit('review')}
                  onCancel={() => navigate('/documents')} disabled={!title.trim()} pending={isPending} />
              </div>
              <SettingsSidebar category={category} setCategory={setCategory}
                departmentId={departmentId} setDepartmentId={setDepartmentId}
                departments={departments} tagInput={tagInput} setTagInput={setTagInput}
                tags={tags} setTags={setTags} addTag={addTag} />
            </div>
          </TabsContent>

          <TabsContent value="file" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-[1fr_280px] mt-6">
              <div className="space-y-4">
                <FileUploadCard
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
                  onClear={() => setSelectedFile(null)}
                  fileInputRef={fileInputRef}
                  dragOver={dragOver}
                  setDragOver={setDragOver}
                />
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-file">Document Title *</Label>
                      <Input id="title-file" placeholder="Enter document title"
                        value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
                <ActionBar onDraft={() => handleSubmit('draft')} onReview={() => handleSubmit('review')}
                  onCancel={() => navigate('/documents')} disabled={!title.trim() || !selectedFile} pending={isPending} />
              </div>
              <SettingsSidebar category={category} setCategory={setCategory}
                departmentId={departmentId} setDepartmentId={setDepartmentId}
                departments={departments} tagInput={tagInput} setTagInput={setTagInput}
                tags={tags} setTags={setTags} addTag={addTag} />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit mode — show form based on existing doc type */}
      {isEdit && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title-edit">Document Title *</Label>
                  <Input id="title-edit" value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-medium" />
                </div>

                {/* Show MDEditor if it was a markdown doc, or file uploader if file-based */}
                {mode === 'markdown' ? (
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <div data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
                      <MDEditor
                        value={content}
                        onChange={v => setContent(v || '')}
                        height={500}
                        preview="live"
                      />
                    </div>
                  </div>
                ) : (
                  <FileUploadCard
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    onClear={() => setSelectedFile(null)}
                    fileInputRef={fileInputRef}
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    existingFilename={existingDoc?.filename}
                  />
                )}
              </CardContent>
            </Card>
            <ActionBar onDraft={() => handleSubmit('draft')} onReview={() => handleSubmit('review')}
              onCancel={() => navigate('/documents')} disabled={!title.trim()} pending={isPending}
              isEdit submitLabel="Save Changes" />
          </div>
          <SettingsSidebar category={category} setCategory={setCategory}
            departmentId={departmentId} setDepartmentId={setDepartmentId}
            departments={departments} tagInput={tagInput} setTagInput={setTagInput}
            tags={tags} setTags={setTags} addTag={addTag} />
        </div>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ActionBar({ onDraft, onReview, onCancel, disabled, pending, isEdit = false, submitLabel }: {
  onDraft: () => void; onReview: () => void; onCancel: () => void;
  disabled: boolean; pending: boolean; isEdit?: boolean; submitLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onDraft} disabled={disabled || pending}>
        <Save className="h-4 w-4 mr-2" />
        {pending ? 'Saving…' : submitLabel ?? (isEdit ? 'Save Changes' : 'Save as Draft')}
      </Button>
      {!isEdit && (
        <Button variant="outline" onClick={onReview} disabled={disabled || pending}>
          <Send className="h-4 w-4 mr-2" />Submit for Review
        </Button>
      )}
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
    </div>
  );
}

function FileUploadCard({ selectedFile, onFileSelect, onClear, fileInputRef, dragOver, setDragOver, existingFilename }: {
  selectedFile: File | null;
  onFileSelect: (f: File) => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  existingFilename?: string;
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">
        {existingFilename ? 'Replace File (optional)' : 'Select File *'}
      </CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {existingFilename && !selectedFile && (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            <FileText className="h-7 w-7 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">{existingFilename}</p>
              <p className="text-xs text-muted-foreground">Current file</p>
            </div>
          </div>
        )}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFileSelect(f); }}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-2"
                onClick={e => { e.stopPropagation(); onClear(); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, Images — max 20MB</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES} className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }} />
      </CardContent>
    </Card>
  );
}

function SettingsSidebar({ category, setCategory, departmentId, setDepartmentId, departments,
  tagInput, setTagInput, tags, setTags, addTag }: any) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Document Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input placeholder="Add tag…" value={tagInput}
                onChange={(e: any) => setTagInput(e.target.value)}
                onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }}} />
              <Button type="button" size="sm" variant="outline" onClick={addTag}>
                <Tag className="h-3.5 w-3.5" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <button onClick={() => setTags((p: string[]) => p.filter(t => t !== tag))}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentForm;