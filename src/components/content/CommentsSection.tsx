// src/components/content/CommentsSection.tsx
// Interactive comments: threaded replies, heart/like, delete.

import { useState } from 'react';
import { Heart, MessageSquare, Send, Trash2, CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, usePostComment, useToggleLike, useDeleteComment } from '@/hooks';
import type { ContentCommentAPI } from '@/services';
import { cn } from '@/lib/utils';

interface Props {
  targetId: string;
  targetType: 'document' | 'knowledge' | 'wiki';
  title?: string;
}

// Relative time helper
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Avatar colour based on name
const AVATAR_COLORS = [
  'bg-primary/80','bg-blue-500','bg-emerald-500','bg-amber-500',
  'bg-rose-500','bg-violet-500','bg-cyan-500','bg-orange-500',
];
function avatarColor(name: string) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

// ── Single comment bubble ─────────────────────────────────────────────────────
interface CommentBubbleProps {
  comment: ContentCommentAPI;
  allComments: ContentCommentAPI[];
  depth?: number;
  onReply: (id: string, name: string) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
  likeLoading: string | null;
}

function CommentBubble({
  comment, allComments, depth = 0, onReply, onLike, onDelete,
  currentUserId, isAdmin, likeLoading,
}: CommentBubbleProps) {
  const [showReplies, setShowReplies] = useState(true);
  const replies = allComments.filter(c => c.parent_id === comment.id);
  const canDelete = currentUserId === comment.author_id || isAdmin;
  const isLiking  = likeLoading === comment.id;

  return (
    <div className={cn('group', depth > 0 && 'ml-8 sm:ml-10')}>
      <div className={cn(
        'rounded-xl p-3.5 transition-colors',
        depth === 0
          ? 'bg-muted/30 border border-border/50'
          : 'bg-muted/15 border border-border/30',
      )}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className={cn('text-xs font-bold text-white', avatarColor(comment.author_name))}>
              {comment.author_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{comment.author_name}</span>
              <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4">{comment.author_role}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{relativeTime(comment.created_at)}</span>
            </div>

            {/* Message */}
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
              {comment.message}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 pt-0.5">
              {/* Like */}
              <button
                onClick={() => onLike(comment.id)}
                disabled={isLiking}
                className={cn(
                  'flex items-center gap-1 text-xs rounded-full px-2.5 py-1 transition-all',
                  comment.liked_by_me
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                    : 'text-muted-foreground hover:bg-muted hover:text-rose-500',
                )}
              >
                <Heart className={cn('h-3.5 w-3.5 transition-transform', comment.liked_by_me && 'fill-current scale-110')} />
                {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
              </button>

              {/* Reply */}
              {depth < 2 && (
                <button
                  onClick={() => onReply(comment.id, comment.author_name)}
                  className="flex items-center gap-1 text-xs rounded-full px-2.5 py-1 text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}

              {/* Show/hide replies */}
              {replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(v => !v)}
                  className="flex items-center gap-1 text-xs rounded-full px-2.5 py-1 text-muted-foreground hover:bg-muted transition-all ml-0.5"
                >
                  {showReplies
                    ? <><ChevronUp className="h-3 w-3" />{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</>
                    : <><ChevronDown className="h-3 w-3" />Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</>
                  }
                </button>
              )}

              {/* Delete */}
              {canDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs rounded-full px-2 py-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map(r => (
            <CommentBubble
              key={r.id}
              comment={r}
              allComments={allComments}
              depth={depth + 1}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              likeLoading={likeLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main CommentsSection ──────────────────────────────────────────────────────
const CommentsSection = ({ targetId, targetType, title = 'Comments' }: Props) => {
  const { user } = useAuth();

  const [message, setMessage]       = useState('');
  const [replyTo, setReplyTo]       = useState<{ id: string; name: string } | null>(null);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  const { data, isLoading } = useComments(targetType, targetId);
  const allComments = (data?.data ?? []) as ContentCommentAPI[];
  const topLevel    = allComments.filter(c => !c.parent_id);

  const postComment  = usePostComment(targetType, targetId);
  const toggleLike   = useToggleLike(targetType, targetId);
  const deleteComment = useDeleteComment(targetType, targetId);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || !user) return;
    postComment.mutate(
      { message: trimmed, parentId: replyTo?.id },
      { onSuccess: () => { setMessage(''); setReplyTo(null); } },
    );
  };

  const handleLike = async (id: string) => {
    if (!user || likeLoading) return;
    setLikeLoading(id);
    toggleLike.mutate(id, { onSettled: () => setLikeLoading(null) });
  };

  const handleReply = (id: string, name: string) => {
    setReplyTo({ id, name });
    setMessage(`@${name} `);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setMessage('');
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {isLoading ? '…' : allComments.length}
        </span>
      </div>

      {/* Compose */}
      <div className="space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs">
            <CornerDownRight className="h-3.5 w-3.5 shrink-0" />
            <span>Replying to <strong>{replyTo.name}</strong></span>
            <button onClick={cancelReply} className="ml-auto hover:text-destructive transition-colors">
              <span className="text-base leading-none">×</span>
            </button>
          </div>
        )}
        <div className="flex gap-2 items-start">
          {user && (
            <Avatar className="h-8 w-8 shrink-0 mt-1">
              <AvatarFallback className={cn('text-xs font-bold text-white', avatarColor(user.name))}>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 space-y-2">
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSubmit(); } }}
              placeholder={replyTo ? `Reply to ${replyTo.name}…` : 'Write a comment… (Ctrl+Enter to post)'}
              rows={2}
              disabled={postComment.isPending}
              className="resize-none text-sm"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!message.trim() || !user || postComment.isPending}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {postComment.isPending ? 'Posting…' : replyTo ? 'Post Reply' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/30">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))
        ) : topLevel.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-20" />
            <p className="text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          topLevel.map(comment => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              allComments={allComments}
              onReply={handleReply}
              onLike={handleLike}
              onDelete={id => deleteComment.mutate(id)}
              currentUserId={user?.id}
              isAdmin={user?.role === 'admin'}
              likeLoading={likeLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;