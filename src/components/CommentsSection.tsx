// src/components/content/CommentsSection.tsx
// Replaces mock-comments.ts with real API calls.
// The UI is completely unchanged — same Avatar, Badge, Textarea, Button layout.

import { useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, usePostComment, useDeleteComment } from '@/hooks';

interface CommentsSectionProps {
  targetId: string;
  targetType: 'document' | 'knowledge' | 'wiki';
  title?: string;
}

const CommentsSection = ({ targetId, targetType, title = 'Comments' }: CommentsSectionProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const { data, isLoading } = useComments(targetType, targetId);
  const comments = data?.data ?? [];

  const postComment = usePostComment(targetType, targetId);
  const deleteComment = useDeleteComment(targetType, targetId);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || !user) return;
    postComment.mutate(trimmed, {
      onSuccess: () => setMessage(''),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <Badge variant="secondary">{isLoading ? '...' : comments.length}</Badge>
        </div>

        {/* Compose */}
        <div className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment, note, or clarification for other readers… (Ctrl+Enter to submit)"
            rows={3}
            disabled={postComment.isPending}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || !user || postComment.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {postComment.isPending ? 'Posting…' : 'Post Comment'}
            </Button>
          </div>
        </div>

        {/* Comment thread */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to add one.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {comment.author_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{comment.author_name}</p>
                      <Badge variant="outline" className="capitalize">{comment.author_role}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{comment.message}</p>
                  </div>
                  {/* Delete button — only own comments or admin */}
                  {user && (user.id === comment.author_id || user.role === 'admin') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteComment.mutate(comment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
