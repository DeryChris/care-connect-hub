// src/pages/DocumentViewer.tsx
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, X, Eye, Share2, Tag, User, Calendar, FileText } from 'lucide-react';
import { useDocument } from '@/hooks';
import { documentsService } from '@/services';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/permissions';
import CommentsSection from '@/components/content/CommentsSection';

interface DocumentViewerProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer = ({ documentId, isOpen, onClose }: DocumentViewerProps) => {
  const { data, isLoading } = useDocument(documentId);
  const doc = data?.data;

  if (!doc) return null;

  const mimeIcon = doc.mime_type.includes('pdf') ? '📄'
    : doc.mime_type.includes('spreadsheet') || doc.mime_type.includes('excel') ? '📊'
    : doc.mime_type.includes('word') ? '📝' : '📁';

  const docStatus = doc.status as any;
  const downloadUrl = documentsService.getDownloadUrl(doc.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="text-3xl shrink-0">{mimeIcon}</div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold leading-tight">{doc.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{doc.filename}</p>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">{doc.category}</Badge>
                  <Badge variant="outline">{doc.size}</Badge>
                  <Badge className={STATUS_COLORS[docStatus] || ''}>{STATUS_LABELS[docStatus] || docStatus}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />{doc.views ?? 0} views
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Download className="h-3 w-3" />{doc.downloads ?? 0} downloads
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a href={downloadUrl} download={doc.filename} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="icon" title="Download"><Download className="h-4 w-4" /></Button>
              </a>
              <Button variant="ghost" size="icon" title="Share" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_260px] min-h-0">
              {/* Content panel */}
              <div className="p-6 space-y-6">
                {/* File preview area */}
                <div className="rounded-lg border bg-muted/30 p-6 min-h-[300px] flex flex-col items-center justify-center gap-4">
                  <div className="text-6xl">{mimeIcon}</div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{doc.filename}</p>
                    <p className="text-sm text-muted-foreground mt-1">{doc.size} · {doc.mime_type.split('/').pop()?.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Uploaded by {doc.uploaded_by_name}</p>
                  </div>
                  <a href={downloadUrl} download={doc.filename} target="_blank" rel="noreferrer">
                    <Button>
                      <Download className="h-4 w-4 mr-2" />Download to View
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    File preview is not available in the browser. Download the file to view its full contents.
                  </p>
                </div>

                {/* Comments */}
                <CommentsSection
                  targetId={doc.id}
                  targetType="document"
                  title="Document Comments"
                />
              </div>

              {/* Sidebar */}
              <div className="border-l p-4 bg-muted/20 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Document Info</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>{doc.uploaded_by_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(doc.uploaded_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate text-xs">{doc.mime_type.split('/').pop()?.toUpperCase()}</span>
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

                <div className="pt-2 border-t space-y-2">
                  <a href={downloadUrl} download={doc.filename} target="_blank" rel="noreferrer" className="block">
                    <Button className="w-full" size="sm"><Download className="h-3.5 w-3.5 mr-2" />Download</Button>
                  </a>
                  <Button variant="outline" className="w-full" size="sm"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/documents`)}>
                    <Share2 className="h-3.5 w-3.5 mr-2" />Copy Link
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
