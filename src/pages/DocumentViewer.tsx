import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, Eye, Share2, Tag, User, Calendar, FileText } from 'lucide-react';
import { mockDocuments } from '@/lib/mock-data';
import { Document as DocumentType } from '@/lib/constants';
import CommentsSection from '@/components/content/CommentsSection';
import { getWorkflowStatus } from '@/lib/content-workflow';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/permissions';

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
  '8': `## Ventilator Management Protocol

### **Lung Protective Ventilation**
- Tidal volume: 6ml/kg ideal body weight
- Plateau pressure: ≤30 cmH2O
- PEEP: 5-15 cmH2O (titrate to oxygenation)
- FiO2: lowest to achieve SpO2 92-96%

### **Daily Goals**
- Spontaneous Breathing Trial (SBT) if criteria met
- Sedation vacation (SAT)
- Head of bed 30-45°
- Oral care every 4hrs (VAP prevention)

### **Weaning Criteria**
- FiO2 ≤0.4, PEEP ≤8
- RR <35, SpO2 >90% on above settings
- Adequate cough and airway reflexes
- Haemodynamically stable

**ICU Team Lead**: Contact Dr. Sarah Wilson`,
};

const DocumentViewer = ({ documentId, isOpen, onClose }: DocumentViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<DocumentType | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen && documentId) {
      const found = mockDocuments.find(d => d.id === documentId);
      setDoc(found || null);
      if (found) {
        setLoading(true);
        setTimeout(() => {
          setContent(sampleContent[found.id as keyof typeof sampleContent] || `## ${found.title}\n\nFull document content is available for download.\n\nThis document (${found.filename}) was uploaded on ${found.uploaded_at} by ${found.uploaded_by_name}.\n\nPlease download the file to view complete contents.`);
          setLoading(false);
        }, 300);
      }
    }
  }, [isOpen, documentId]);

  if (!doc) return null;

  const mimeIcon = doc.mime_type.includes('pdf') ? '📄' : doc.mime_type.includes('spreadsheet') ? '📊' : doc.mime_type.includes('word') ? '📝' : '📁';
  const workflowStatus = getWorkflowStatus('document', doc.id, doc.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
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
                  <Badge className={STATUS_COLORS[workflowStatus]}>{STATUS_LABELS[workflowStatus]}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" /> {doc.views} views</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Download className="h-3 w-3" /> {doc.downloads} downloads</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" title="Download"><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" title="Share"><Share2 className="h-4 w-4" /></Button>
              <DialogClose asChild><Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button></DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_260px] min-h-0">
              <div className="p-6 space-y-6">
                <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-6 rounded-lg border font-mono overflow-x-auto leading-relaxed">{content}</pre>
                <CommentsSection targetId={doc.id} targetType="document" title="Document Comments" />
              </div>

              <div className="border-l p-4 bg-muted/20 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Document Info</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><User className="h-3.5 w-3.5 shrink-0" /><span>{doc.uploaded_by_name}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5 shrink-0" /><span>{doc.uploaded_at}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><FileText className="h-3.5 w-3.5 shrink-0" /><span className="truncate text-xs">{doc.mime_type.split('/').pop()?.toUpperCase()}</span></div>
                  </div>
                </div>

                {doc.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Tag className="h-3 w-3" /> Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.tags.map(tag => <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>)}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t space-y-2">
                  <Button className="w-full" size="sm"><Download className="h-3.5 w-3.5 mr-2" /> Download</Button>
                  <Button variant="outline" className="w-full" size="sm"><Share2 className="h-3.5 w-3.5 mr-2" /> Share</Button>
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
