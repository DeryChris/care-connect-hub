// src/hooks/useDocumentBlobUrl.ts
// Fetches a protected document/file endpoint using the in-memory JWT token
// and returns a blob: URL that can be used safely in <iframe> or <img>.
//
// Why this is needed:
//   The download endpoint requires "Authorization: Bearer <token>".
//   <iframe src="..."> fires a plain browser request with NO custom headers,
//   so it gets 401 UNAUTHORIZED.
//   This hook solves that by fetching through the api client and creating
//   a temporary object URL that the browser can display without auth headers.

import { useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/api';

interface UseBlobUrlResult {
  blobUrl:   string | null;
  loading:   boolean;
  error:     string | null;
  mimeType:  string | null;
}

export function useDocumentBlobUrl(documentId: string | null): UseBlobUrlResult {
  const [blobUrl,  setBlobUrl]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);
    setBlobUrl(null);
    setMimeType(null);

    const fetchFile = async () => {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/documents/${documentId}/download`, {
          credentials: 'include',
          headers,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body?.error?.message ?? `Error ${res.status}`);
          return;
        }

        const blob = await res.blob();
        const detectedMime = res.headers.get('Content-Type') ?? blob.type;
        setMimeType(detectedMime);
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    // Cleanup: revoke the object URL when the component unmounts or id changes
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId]);

  return { blobUrl, loading, error, mimeType };
}