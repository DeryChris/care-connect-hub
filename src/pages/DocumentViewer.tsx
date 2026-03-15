import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, Eye, Share2 } from 'lucide-react';
import { mockDocuments } from '@/lib/mock-data';
import { Document as DocumentType } from '@/lib/constants';

interface DocumentViewerProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const sampleContent = {
  '1': `## COVID-19 Treatment Protocol v2.3

### **Initial Assessment (0-6 hours)**
1. **Oxygen**: Target SpO2 94-98% (88-92% if COPD)
2. **Corticosteroids**: Dexamethasone 6mg daily if SpO2 <94%
3. **Anticoagulation**: LMWH if CrCl >30

### **Moderate Disease** (RR >22 OR SpO2 90-94%)
- Remdesivir 200mg day 1, 100mg days 2-5
- Dexamethasone 6mg daily x10 days

### **Severe Disease** (RR >30 OR PaO2/FiO2 <300)
- High flow nasal cannula
- Tocilizumab if CRP >75mg/L

### **Contraindications**
- Baricitinib: Active TB
- Remdesivir: eGFR <30

**Contact**: Dr. Sarah Wilson (Cardiology Dept)`,
  '2': `## Hypertension Management Guideline 2024

### **BP Targets**
| Age Group | Target BP |
|-----------|-----------|
| <60 years | <130/80 |
| ≥60 years | <150/90 |

### **First Line Combinations**
1. **ACEI/ARB + CCB** (preferred)
2. **ACEI/ARB + Thiazide**
3. **CCB + Thiazide**

### **Compelling Indications**
- Heart Failure: ACEI/ARB + BB
- Post-MI: BB + ACEI
- CKD: ACEI/ARB
- Stroke/TIA: ACEI + Thiazide

### **Monitoring**
- Check BP 2 weeks after start
- Annual renal function, K+

**Approved**: Dr. James Chen (Cardiology)`,
  '3': `## Emergency Department SOP v1.8

### **Triage Categories**
| Category | Color | Wait Time |
|----------|-------|-----------|
| Resuscitation | Red | Immediate |
| Emergency | Orange | <10 min |
| Urgent | Yellow | <60 min |
| Semi-urgent | Green | <120 min |
| Non-urgent | Blue | <240 min |

### **Documentation Requirements**
1. **Vital signs** every patient
2. **Pain score** all ages
3. **Weight** for medications
4. **Allergies** confirmed

### **Escalation Protocol**
- HR >140 OR SBP <90 → Senior review
- GCS <15 → Notify ICU

**Last Updated**: 2024-12-10`,
  // Add more sample content for other documents...
};

const DocumentViewer = ({ documentId, isOpen, onClose }: DocumentViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen && documentId) {
      const doc = mockDocuments.find(d => d.id === documentId);
      setDocument(doc || null);
      if (doc) {
        setLoading(true);
        setTimeout(() => {
          setContent(sampleContent[doc.id as keyof typeof sampleContent] || 'Content not available');
          setLoading(false);
        }, 800);
      }
    }
  }, [isOpen, documentId]);

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{document.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="capitalize">{document.category}</Badge>
                <Badge variant="outline">{document.size}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-3 w-3" /> {document.views} views
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title="Download">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Share">
                <Share2 className="h-4 w-4" />
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {loading ? (
<div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-muted/50 to-background prose prose-sm max-w-none">
              <div className="prose prose-headings:font-display prose-headings:font-bold prose-a:no-underline prose-pre:bg-muted/50 prose-code:bg-muted/50 prose-blockquote:border-l-primary prose-blockquote:pl-4 max-w-none">
                <pre className="whitespace-pre-wrap text-xs bg-muted/30 p-4 rounded-lg border font-mono overflow-x-auto">
                  {content}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;

