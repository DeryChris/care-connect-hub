import { useMemo, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCommentsForTarget, type CommentTargetType, type ContentComment } from '@/lib/mock-comments';

interface CommentsSectionProps {
  targetId: string;
  targetType: CommentTargetType;
  title?: string;
}

const CommentsSection = ({ targetId, targetType, title = 'Comments' }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [localComments, setLocalComments] = useState<ContentComment[]>([]);

  const comments = useMemo(
    () => [...getCommentsForTarget(targetType, targetId), ...localComments],
    [localComments, targetId, targetType],
  );

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || !user) return;

    setLocalComments(prev => [
      ...prev,
      {
        id: `${targetType}-${targetId}-${Date.now()}`,
        targetType,
        targetId,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.designation.replace('_', ' '),
        message: trimmed,
        createdAt: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setMessage('');
    toast({ title: 'Comment added', description: 'Your comment is now visible to other readers.' });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <Badge variant="secondary">{comments.length}</Badge>
        </div>

        <div className="space-y-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add a comment, note, or clarification for other readers..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!message.trim() || !user}>
              <Send className="mr-2 h-4 w-4" /> Post Comment
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{comment.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{comment.authorName}</p>
                    <Badge variant="outline" className="capitalize">{comment.authorRole}</Badge>
                    <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{comment.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
