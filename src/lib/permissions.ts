import { User } from './constants';

/**
 * Content permission model for Documents, Knowledge Articles, and Wiki pages.
 * 
 * Permissions are determined by user role + designation:
 * - Admin: full access to everything (CRUD, review, approve)
 * - Doctor: can create, edit own, review, approve within their scope
 * - Nurse/Pharmacist/Lab Tech: can create, edit own, submit for review
 * - Other staff: can view only, create drafts
 */

export type ContentAction = 'create' | 'read' | 'update' | 'delete' | 'review' | 'approve';

export type ContentType = 'document' | 'knowledge' | 'wiki';

// Roles that can review content
const REVIEWER_DESIGNATIONS = ['doctor', 'pharmacist', 'admin_staff'];

// Roles that can approve content (final sign-off)
const APPROVER_DESIGNATIONS = ['doctor'];

// Roles that can create content
const CREATOR_DESIGNATIONS = [
  'doctor', 'nurse', 'pharmacist', 'lab_technician', 'radiologist',
  'admin_staff', 'hr_officer', 'it_staff',
];

/**
 * Check if a user has a specific permission on a content type.
 */
export function hasContentPermission(
  user: User | null,
  action: ContentAction,
  contentType: ContentType,
  authorId?: string
): boolean {
  if (!user) return false;

  // Admins have full access
  if (user.role === 'admin') return true;

  switch (action) {
    case 'read':
      return true; // All authenticated users can read

    case 'create':
      return CREATOR_DESIGNATIONS.includes(user.designation);

    case 'update':
      // Can edit own content, or reviewers/approvers can edit any
      if (authorId && authorId === user.id) return true;
      return REVIEWER_DESIGNATIONS.includes(user.designation) || 
             APPROVER_DESIGNATIONS.includes(user.designation);

    case 'delete':
      // Only admins (handled above) or content owner
      return authorId ? authorId === user.id : false;

    case 'review':
      // Reviewers can mark content as reviewed
      return REVIEWER_DESIGNATIONS.includes(user.designation) || 
             APPROVER_DESIGNATIONS.includes(user.designation);

    case 'approve':
      // Only doctors and admins can give final approval
      return APPROVER_DESIGNATIONS.includes(user.designation);

    default:
      return false;
  }
}

/**
 * Get all permissions a user has for a specific content item.
 */
export function getContentPermissions(
  user: User | null,
  contentType: ContentType,
  authorId?: string
): Record<ContentAction, boolean> {
  const actions: ContentAction[] = ['create', 'read', 'update', 'delete', 'review', 'approve'];
  return actions.reduce((acc, action) => {
    acc[action] = hasContentPermission(user, action, contentType, authorId);
    return acc;
  }, {} as Record<ContentAction, boolean>);
}

/**
 * Status transitions allowed based on permissions.
 */
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';

export function getAllowedStatusTransitions(
  user: User | null,
  currentStatus: DocumentStatus,
  authorId?: string
): DocumentStatus[] {
  if (!user) return [];

  const isAdmin = user.role === 'admin';
  const isReviewer = REVIEWER_DESIGNATIONS.includes(user.designation) || isAdmin;
  const isApprover = APPROVER_DESIGNATIONS.includes(user.designation) || isAdmin;
  const isAuthor = authorId === user.id;

  switch (currentStatus) {
    case 'draft':
      if (isAuthor || isAdmin) return ['review'];
      return [];

    case 'review':
      const transitions: DocumentStatus[] = [];
      if (isReviewer || isAdmin) transitions.push('draft'); // Send back
      if (isApprover) transitions.push('approved', 'rejected');
      return transitions;

    case 'approved':
      if (isAdmin) return ['archived', 'draft'];
      return [];

    case 'rejected':
      if (isAuthor || isAdmin) return ['draft', 'review'];
      return [];

    case 'archived':
      if (isAdmin) return ['draft'];
      return [];

    default:
      return [];
  }
}

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-warning text-warning-foreground',
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
  archived: 'bg-secondary text-secondary-foreground',
};
