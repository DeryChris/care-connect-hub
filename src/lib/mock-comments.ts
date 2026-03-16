import { mockDocuments } from './mock-data';
import { mockKnowledgeArticles } from './mock-knowledge';
import { mockUsers } from './mock-data';

export type CommentTargetType = 'document' | 'knowledge';

export interface ContentComment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

const sampleMessages = {
  document: [
    'Helpful reference for daily clinical work — the steps are clear and easy to follow.',
    'Please keep this version pinned; the workflow summary is especially useful during handover.',
    'I reviewed this with the team this morning and it aligns well with current practice.',
  ],
  knowledge: [
    'Great article — the overview and treatment pathway are concise and practical.',
    'This was useful during rounds; consider adding one more note on escalation criteria later.',
    'Shared with the unit team. The structure makes it easy to scan quickly in urgent cases.',
  ],
};

const seededDocumentComments: ContentComment[] = mockDocuments.flatMap((doc, index) => {
  const firstUser = mockUsers[index % mockUsers.length];
  const secondUser = mockUsers[(index + 2) % mockUsers.length];

  return [
    {
      id: `doc-comment-${doc.id}-1`,
      targetType: 'document',
      targetId: doc.id,
      authorId: firstUser.id,
      authorName: firstUser.name,
      authorRole: firstUser.designation.replace('_', ' '),
      message: sampleMessages.document[index % sampleMessages.document.length],
      createdAt: `2024-12-${String(10 + (index % 9)).padStart(2, '0')} 09:15`,
    },
    {
      id: `doc-comment-${doc.id}-2`,
      targetType: 'document',
      targetId: doc.id,
      authorId: secondUser.id,
      authorName: secondUser.name,
      authorRole: secondUser.designation.replace('_', ' '),
      message: sampleMessages.document[(index + 1) % sampleMessages.document.length],
      createdAt: `2024-12-${String(11 + (index % 9)).padStart(2, '0')} 14:40`,
    },
  ];
});

const seededKnowledgeComments: ContentComment[] = mockKnowledgeArticles.map((article, index) => {
  const commenter = mockUsers[(index + 1) % mockUsers.length];

  return {
    id: `knowledge-comment-${article.id}-1`,
    targetType: 'knowledge',
    targetId: article.id,
    authorId: commenter.id,
    authorName: commenter.name,
    authorRole: commenter.designation.replace('_', ' '),
    message: sampleMessages.knowledge[index % sampleMessages.knowledge.length],
    createdAt: `2024-12-${String(5 + (index % 20)).padStart(2, '0')} 11:20`,
  };
});

export const mockContentComments: ContentComment[] = [
  ...seededDocumentComments,
  ...seededKnowledgeComments,
];

export function getCommentsForTarget(targetType: CommentTargetType, targetId: string) {
  return mockContentComments.filter(comment => comment.targetType === targetType && comment.targetId === targetId);
}
