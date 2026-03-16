import { useCallback, useState } from 'react';
import type { DocumentStatus } from '@/lib/permissions';

const documentStatusOverrides = new Map<string, DocumentStatus>();
const knowledgeStatusOverrides = new Map<string, DocumentStatus>();

export type WorkflowTarget = 'document' | 'knowledge';

export const normalizeDocumentStatus = (status: string): DocumentStatus => {
  if (status === 'active') return 'approved';
  if (status === 'draft' || status === 'review' || status === 'approved' || status === 'rejected' || status === 'archived') {
    return status;
  }
  return 'draft';
};

export const getWorkflowStatus = (target: WorkflowTarget, id: string, fallbackStatus: string): DocumentStatus => {
  const source = target === 'document' ? documentStatusOverrides : knowledgeStatusOverrides;
  return source.get(id) ?? normalizeDocumentStatus(fallbackStatus);
};

export const setWorkflowStatus = (target: WorkflowTarget, id: string, status: DocumentStatus) => {
  const source = target === 'document' ? documentStatusOverrides : knowledgeStatusOverrides;
  source.set(id, status);
};

export const useWorkflowRefresh = () => {
  const [, setVersion] = useState(0);
  return useCallback(() => setVersion(value => value + 1), []);
};
