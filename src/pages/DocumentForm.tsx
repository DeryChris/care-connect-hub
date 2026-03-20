// src/pages/DocumentForm.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Save, Send, Upload, X, Tag, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasContentPermission, STATUS_LABELS, STATUS_COLORS, getAllowedStatusTransitions } from '@/lib/permissions';
import { useDepartments, useDocument, useUploadDocument, useUpdateDocument, useUpdateDocumentStatus } from '@/hooks';

const DOCUMENT_CATEGORIES = [
  { value: 'protocol', label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop', label: 'SOP' },
  { value: 'manual', label: 'Manual' },
  { value: 'training', label: 'Training' },
  { value: 'report', label: 'Report' },
];

const ALLOWED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg';

const DocumentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existing, isLoading: loadingDoc } = useDocument(id ?? '');
  const { data: deptsData } = useDepartments({ active: true });
  const departments = deptsData?.data ?? [];

  const uploadDoc = useUploadDocument();
  const updateDoc = useUpdateDocument();
  const updateStatus = useUpdateDocumentStatus();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (existing?.data) {
      const d = existing.data;
      setTitle(d.title);
      setCategory(d.category);
      setDepartmentId(d.department_id ?? '');
      setTags(d.tags ?? []);
    }
  }, [existing]);

  const existingDoc = existing?.data;
  const canEdit = isEdit
    ? hasContentPermission(user, 'update', 'document', existingDoc?.uploaded_by)
    : hasContentPermission(user, 'create', 'document');

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-muted-foreground">You don't have permission to {isEdit ? 'edit' : 'upload'} documents.</p>
        <Link to="/documents"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
      </div>
    );
  }

  if (isEdit && loadingDoc) {
    return <div className="space-y-6 max-w-3xl"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full rounded-xl" /></div>;
  }

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = (submitStatus: 'draft' | 'review' = 'draft') => {
    if (!title.trim()) return;

    if (isEdit && id) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      if (departmentId) formData.append('department_id', departmentId);
      formData.append('tags', JSON.stringify(tags));
      if (selectedFile) formData.append('file', selectedFile);
      updateDoc.mutate({ id, formData }, { onSuccess: () => navigate('/documents') });
    } else {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('category', category);
      if (departmentId) formData.append('department_id', departmentId);
      formData.append('tags', JSON.stringify(tags));
      uploadDoc.mutate(formData, { onSuccess: () => navigate('/documents') });
    }
  };

  const isPending = uploadDoc.isPending || updateDoc.isPending;

  const docStatus = existingDoc?.status as any;
  const transitions = existingDoc ? getAllowedStatusTransitions(user, docStatus, existingDoc.uploaded_by) : [];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/documents')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Document' : 'Upload Document'}</h1>
            {isEdit && existingDoc && (
              <Badge className={STATUS_COLORS[docStatus] || ''}>{STATUS_LABELS[docStatus] || docStatus}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* File Upload Area */}
        <Card>
          <CardHeader><CardTitle className="text-lg">
            {isEdit ? 'Replace File (optional)' : 'Select File *'}
          </CardTitle></CardHeader>
          <CardContent>
            {isEdit && existingDoc && !selectedFile && (
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30 mb-4">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">{existingDoc.filename}</p>
                  <p className="text-xs text-muted-foreground">{existingDoc.size}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">Current file</Badge>
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-2" onClick={e => { e.stopPropagation(); setSelectedFile(null); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop a file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, Images — max 20MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES}
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
            />
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Document Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input id="title" required placeholder="Enter document title" value={title}
                onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input placeholder="Add tag and press Enter..." value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown} />
                <Button type="button" size="sm" variant="outline" onClick={addTag}>
                  <Tag className="h-3.5 w-3.5" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleSubmit('draft')}
            disabled={!title.trim() || (!isEdit && !selectedFile) || isPending}
          >
            <Save className="h-4 w-4 mr-2" />{isPending ? 'Uploading...' : isEdit ? 'Save Changes' : 'Save as Draft'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('review')}
            disabled={!title.trim() || (!isEdit && !selectedFile) || isPending}
          >
            <Send className="h-4 w-4 mr-2" />Submit for Review
          </Button>
          {isEdit && existingDoc && transitions.includes('approved') && docStatus === 'review' && (
            <Button
              className="bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => updateStatus.mutate({ id: existingDoc.id, status: 'approved' }, { onSuccess: () => navigate('/documents') })}
            >
              Approve Document
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => navigate('/documents')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
