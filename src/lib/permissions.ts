// src/lib/permissions.ts
// KMS content permission model.
// Permissions are checked in two layers:
//   1. Role:  admin → full access always
//   2. KMS module permissions in user.permissions[] → fine-grained control
//   3. Designation fallback → legacy behaviour when no KMS keys are set

import { User } from './constants';

export type ContentAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'review'
  | 'approve'
  | 'disapprove'
  | 'archive';

export type ContentType = 'document' | 'knowledge' | 'wiki';

// ── Designation-based fallbacks (used when user has no explicit KMS perms) ───
const REVIEWER_DESIGNATIONS   = ['doctor', 'pharmacist', 'admin_staff'];
const APPROVER_DESIGNATIONS   = ['doctor'];
const CREATOR_DESIGNATIONS    = [
  'doctor', 'nurse', 'pharmacist', 'lab_technician', 'radiologist',
  'admin_staff', 'hr_officer', 'it_staff',
];

// ── KMS permission key helpers ────────────────────────────────────────────────
function hasKMSPerm(user: User, key: string): boolean {
  return user.permissions.includes(key);
}

/**
 * Returns true if the user has ANY explicit KMS permission keys set.
 * If they have none, we fall back to designation-based logic for backwards
 * compatibility.
 */
function hasAnyKMSPerm(user: User): boolean {
  return user.permissions.some(p => p.startsWith('kms_'));
}

// ── Main permission check ─────────────────────────────────────────────────────
export function hasContentPermission(
  user: User | null,
  action: ContentAction,
  contentType: ContentType,
  authorId?: string,
): boolean {
  if (!user) return false;

  // Admins always have full access
  if (user.role === 'admin') return true;

  const isAuthor = !!authorId && authorId === user.id;
  const useKMSKeys = hasAnyKMSPerm(user);

  switch (action) {
    case 'read':
      // Everyone authenticated can read
      // (or require kms_read if you want stricter control)
      if (useKMSKeys) return hasKMSPerm(user, 'kms_read') || hasKMSPerm(user, 'kms_create');
      return true;

    case 'create':
      if (useKMSKeys) return hasKMSPerm(user, 'kms_create');
      return CREATOR_DESIGNATIONS.includes(user.designation);

    case 'update':
      if (useKMSKeys) {
        // Can edit if: they have edit perm AND (it's their own content OR they have review perm)
        if (!hasKMSPerm(user, 'kms_edit')) return false;
        return isAuthor || hasKMSPerm(user, 'kms_review') || hasKMSPerm(user, 'kms_approve');
      }
      if (isAuthor) return true;
      return REVIEWER_DESIGNATIONS.includes(user.designation) ||
             APPROVER_DESIGNATIONS.includes(user.designation);

    case 'delete':
      if (useKMSKeys) return hasKMSPerm(user, 'kms_delete') && isAuthor;
      return isAuthor;

    case 'review':
      if (useKMSKeys) return hasKMSPerm(user, 'kms_review') || hasKMSPerm(user, 'kms_approve');
      return REVIEWER_DESIGNATIONS.includes(user.designation) ||
             APPROVER_DESIGNATIONS.includes(user.designation);

    case 'approve':
      if (useKMSKeys) return hasKMSPerm(user, 'kms_approve');
      return APPROVER_DESIGNATIONS.includes(user.designation);

    case 'disapprove':
      if (useKMSKeys) return hasKMSPerm(user, 'kms_disapprove') || hasKMSPerm(user, 'kms_approve');
      return APPROVER_DESIGNATIONS.includes(user.designation) ||
             REVIEWER_DESIGNATIONS.includes(user.designation);

    case 'archive':
      if (useKMSKeys) return hasKMSPerm(user, 'kms_archive');
      return APPROVER_DESIGNATIONS.includes(user.designation);

    default:
      return false;
  }
}

/**
 * Get a full permission map for a content item.
 */
export function getContentPermissions(
  user: User | null,
  contentType: ContentType,
  authorId?: string,
): Record<ContentAction, boolean> {
  const actions: ContentAction[] = [
    'create', 'read', 'update', 'delete', 'review', 'approve', 'disapprove', 'archive',
  ];
  return actions.reduce((acc, action) => {
    acc[action] = hasContentPermission(user, action, contentType, authorId);
    return acc;
  }, {} as Record<ContentAction, boolean>);
}

// ── Status transition logic ───────────────────────────────────────────────────
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';

export function getAllowedStatusTransitions(
  user: User | null,
  currentStatus: DocumentStatus,
  authorId?: string,
): DocumentStatus[] {
  if (!user) return [];

  const isAdmin      = user.role === 'admin';
  const isAuthor     = authorId === user.id;
  const canReview    = hasContentPermission(user, 'review', 'knowledge', authorId);
  const canApprove   = hasContentPermission(user, 'approve', 'knowledge', authorId);
  const canDisapprove = hasContentPermission(user, 'disapprove', 'knowledge', authorId);
  const canArchive   = hasContentPermission(user, 'archive', 'knowledge', authorId);

  switch (currentStatus) {
    case 'draft':
      if (isAuthor || isAdmin) return ['review'];
      return [];

    case 'review': {
      const transitions: DocumentStatus[] = [];
      if (canReview || isAdmin) transitions.push('draft');         // send back
      if (canApprove)           transitions.push('approved');
      if (canDisapprove)        transitions.push('rejected');
      return transitions;
    }

    case 'approved':
      if (canArchive || isAdmin) return ['archived'];
      if (isAdmin)               return ['archived', 'draft'];
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

// ── Display helpers ───────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft:    'Draft',
  review:   'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft:    'bg-muted text-muted-foreground',
  review:   'bg-warning text-warning-foreground',
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
  archived: 'bg-secondary text-secondary-foreground',
};
