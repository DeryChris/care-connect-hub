import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockKnowledgeArticles } from "@/lib/mock-knowledge";
import { mockDocuments } from "@/lib/mock-data";
import { KnowledgeArticle, Document } from "@/lib/constants";
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function ApprovalsPage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(mockKnowledgeArticles);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const pendingArticles = useMemo(() => articles.filter(a => a.status === 'pending_approval'), [articles]);
  const pendingDocuments = useMemo(() => documents.filter(d => d.status === 'pending_approval'), [documents]);

  const handleApprove = (type: 'article' | 'document', id: string) => {
    if (type === 'article') {
      setArticles(articles.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    } else {
      setDocuments(documents.map(d => d.id === id ? { ...d, status: 'approved' } : d));
    }
  };

  const handleReject = (type: 'article' | 'document', id: string) => {
    if (type === 'article') {
      setArticles(articles.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    } else {
      setDocuments(documents.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Approvals</h1>
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Knowledge Articles ({pendingArticles.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({pendingDocuments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <div className="space-y-4 mt-4">
            {pendingArticles.map(article => (
              <div key={article.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">Author: {article.author_name}</p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleApprove('article', article.id)}><Check className="h-4 w-4 mr-2" />Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject('article', article.id)}><X className="h-4 w-4 mr-2" />Reject</Button>
                </div>
              </div>
            ))}
            {pendingArticles.length === 0 && <p>No articles pending approval.</p>}
          </div>
        </TabsContent>
        <TabsContent value="documents">
          <div className="space-y-4 mt-4">
            {pendingDocuments.map(doc => (
              <div key={doc.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">Uploader: {doc.uploaded_by_name}</p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleApprove('document', doc.id)}><Check className="h-4 w-4 mr-2" />Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject('document', doc.id)}><X className="h-4 w-4 mr-2" />Reject</Button>
                </div>
              </div>
            ))}
            {pendingDocuments.length === 0 && <p>No documents pending approval.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
