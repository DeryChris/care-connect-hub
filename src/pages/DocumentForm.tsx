import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Send, Upload, X, Tag, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockDocuments, mockDepartments } from '@/lib/mock-data';
import { hasContentPermission, STATUS_LABELS, STATUS_COLORS, getAllowedStatusTransitions, type DocumentStatus } from '@/lib/permissions';

const DOCUMENT_CATEGORIES = [
  { value: 'protocol', label: 'Protocol' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'sop', label: 'SOP' },
  { value: 'manual', label: 'Manual' },
  { value: 'training', label: 'Training' },
  { value: 'report', label: 'Report' },
];

const DocumentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!id;

  const existingDoc = isEdit ? mockDocuments.find(d => d.id === id) : null;

  const [title, setTitle] = useState('');
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState('protocol');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<DocumentStatus>('draft');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingDoc) {
      setTitle(existingDoc.title);
      setFilename(existingDoc.filename);
      setCategory(existingDoc.category);
      setDepartmentId(existingDoc.department_id || '');
      setTags(existingDoc.tags || []);
      setStatus(existingDoc.status as DocumentStatus);
    }
  }, [existingDoc]);

  // Permission check
  const canEdit = isEdit
    ? hasContentPermission(user, 'update', 'document', existingDoc?.uploaded_by)
    : hasContentPermission(user, 'create', 'document');

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to {isEdit ? 'edit' : 'create'} documents.</p>
        <Button onClick={() => navigate('/documents')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Documents
        </Button>
      </div>
    );
  }

  const allowedTransitions = isEdit
    ? getAllowedStatusTransitions(user, status, existingDoc?.uploaded_by)
    : [];

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (targetStatus: DocumentStatus) => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    if (!filename.trim()) {
      toast({ title: 'Filename required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: isEdit ? 'Document updated' : 'Document created',
        description: targetStatus === 'review'
          ? 'Document submitted for review.'
          : `Document saved as ${STATUS_LABELS[targetStatus]}.`,
      });
      navigate('/documents');
    }, 600);
  };

  const handleStatusChange = (newStatus: DocumentStatus) => {
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: `Status changed to ${STATUS_LABELS[newStatus]}`,
        description: newStatus === 'approved'
          ? 'Document has been approved and published.'
          : newStatus === 'rejected'
          ? 'Document has been sent back for revision.'
          : undefined,
      });
      navigate('/documents');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/documents" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Documents
            </Link>
            <span>/</span>
            <span className="text-foreground">{isEdit ? 'Edit' : 'New'} Document</span>
          </div>
          <h1 className="page-title">{isEdit ? 'Edit Document' : 'Upload Document'}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSubmit('review')} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" /> Submit for Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main form */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Document Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g., COVID-19 Treatment Protocol v2.3"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="text-base font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="filename">Filename <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    id="filename"
                    placeholder="e.g., COVID19_Protocol_v2.3.pdf"
                    value={filename}
                    onChange={e => setFilename(e.target.value)}
                  />
                  <Button variant="outline" type="button">
                    <Upload className="h-4 w-4 mr-2" /> Browse
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Select or enter the document filename</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the document content and purpose..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* File upload simulation */}
          <Card>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium text-foreground">Drop file here or click to upload</p>
                <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, XLSX up to 50MB</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Review */}
          {isEdit && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status & Approval</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current:</span>
                  <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
                </div>
                {allowedTransitions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Change status to:</p>
                    <div className="flex flex-col gap-1.5">
                      {allowedTransitions.map(s => (
                        <Button
                          key={s}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleStatusChange(s)}
                          disabled={submitting}
                        >
                          <Badge className={`${STATUS_COLORS[s]} mr-2`} style={{ fontSize: '10px' }}>
                            {STATUS_LABELS[s]}
                          </Badge>
                          Move to {STATUS_LABELS[s]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Details</p>

              <div className="space-y-1.5">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All departments</SelectItem>
                    {mockDepartments.filter(d => d.is_active).map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Uploaded by</Label>
                <Input value={user?.name || ''} disabled className="bg-muted/40" />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Tag className="h-3 w-3" /> Tags
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="h-8 text-sm"
                />
                <Button variant="outline" size="sm" onClick={addTag} className="shrink-0">Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approval Workflow</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <span>Author creates → <strong>Draft</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <span>Submit → <strong>Under Review</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>Doctor/Admin approves → <strong>Approved</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span>Or rejected → <strong>Revision needed</strong></span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1 border-t">
                Your role: <strong className="text-foreground capitalize">{user?.designation?.replace('_', ' ')}</strong>
                {user?.role === 'admin' && ' (Full access)'}
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSubmit('review')} disabled={submitting} className="w-full">
              <Send className="h-4 w-4 mr-2" /> Submit for Review
            </Button>
            <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting} className="w-full">
              <Save className="h-4 w-4 mr-2" /> Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
