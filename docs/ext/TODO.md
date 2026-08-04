# 🚀 Transform HMIS → KMS: Complete Roadmap

## 📋 **Phase 1: Core Knowledge Infrastructure** (Week 1)
### [✅] 1. Knowledge Base Module
```
✅ src/pages/KnowledgeBase.tsx - Protocols/Guides/SOPs table
✅ src/lib/mock-knowledge.ts - 50+ medical protocols
✅ src/components/GlobalSearch.tsx - Global search engine
```

### [✅] 2. Global Search Engine
```
✅ src/components/GlobalSearch.tsx - TopBar search bar
✅ Cross-module search (knowledge + patients + staff)
✅ Advanced filters + type icons
✅ Responsive dropdown results
```

### [⏳] 3. Document Management
```
⏳ src/pages/Documents.tsx - File upload/viewer
⏳ src/types/Document.ts - File metadata interface
⏳ PDF preview (react-pdf or iframe)
⏳ Categorization/tags/full-text indexing
```

## 📚 **Phase 2: Knowledge Creation & Collaboration** (Week 2)
### [ ] 4. Internal Wiki System
```
[ ] src/pages/Wiki.tsx - Markdown editor + preview
[ ] npm i react-markdown 
[ ] Article versioning/history
[ ] Comments/discussion per article
[ ] Approval workflow for clinical content
```

### [ ] 5. Knowledge Contribution System
```
[ ] src/components/CreateKnowledge.tsx - Submit new articles
[ ] Staff roles: Author/Reviewer/Approver
[ ] npm i @uiw/react-md-editor
[ ] Template system for protocols
```

## 🤖 **Phase 3: AI-Powered Discovery** (Week 3)
### [ ] 6. AI Knowledge Assistant
```
[ ] AI-powered semantic search
[ ] Chatbot interface for protocols
[ ] Auto-summarization
[ ] Smart recommendations
```

### [ ] 7. Analytics & Usage
```
[ ] Usage analytics dashboard
[ ] Most searched protocols
[ ] Contribution leaderboard
[ ] Knowledge gaps identification
```

### Other tasks
[] there are some errors in the Documents.tsx file on line 81 and 82
[] when i refresh on any page it takes me back to the login page
[] when i try uploading a document from the documents page, it takes me to a blank page
[] make the pdfs or documents viewable on the document view page and also editable.
[] in the knowledge base page, make the articles editable and also make the ability to add new article functionable
[] improve the the page for creating new and editing pages in the wiki section
[] in the user management section when i try to edit the admins details, it gives me an HTTP 500 error 
[] the IPD, OPD, Radiology, and Billing pages are not working
[] restructure the functionalities to create, edit, delete, review, approve, archieve, disprove an article/document/wiki or page in the kms part of the system - i want you to add these functionalities as module permissions in the user management section when adding a new user or editting a user's data


Implementation Plan: Wiki Page Approval Workflow with RBAC
Overview
Add status management (draft/review/approved/rejected/archived) to Wiki pages with role-based access control, following existing patterns in the codebase.
Backend Changes
1. Database Schema (Already Completed)
- Added status field to WikiPage model with ContentStatus type (draft, review, approved, rejected, archived)
- Added index on status field for query performance
2. Controller Updates
File: backend/src/controllers/wiki.controller.ts
- Add updateStatus function with:
  - Authentication check
  - Wiki page lookup
  - Permission validation:
    * Admin users: full access
    * Users with 'wiki' permission: full access
    * Authors: limited to draft/review for their own pages
  - Status value validation against ContentStatus enum
  - Prisma update operation
  - Proper error handling and response formatting
3. Route Registration
File: backend/src/routes/index.ts
- Add: router.patch('/wiki/:id/status', authenticate, wiki.updateStatus);
- Place with other wiki routes for consistency
Frontend Changes
1. Wiki Page Component
File: src/pages/Wiki.tsx
- Modify data fetching to include status field
- Add status display badge for each wiki item (color-coded by status)
- Implement conditional status control UI:
  * Show only to users with appropriate permissions
  * Dropdown/status selector with valid transitions
  * Loading states and error handling
- Add status change handler:
  * Call PATCH /api/wiki/:id/status endpoint
  * Update local state or invalidate React Query cache
  * Show success/error notifications
2. Permission Checking Utilities
- Use existing useAuth hook to get user permissions/role
- Implement helper function to check wiki status modification rights:
    const canModifyWikiStatus = (user, wikiPage) => {
    return user.role === 'admin' || 
           user.permissions?.includes('wiki') || 
           (wikiPage.author_id === user.userId && 
            ['draft', 'review'].includes(newStatus));
  };
  
3. Status UI Components
- Use existing shadcn-ui components (Select, Button, Badge)
- Status badge colors:
  * Draft: gray
  * Review: blue
  * Approved: green
  * Rejected: red
  * Archived: purple
Permission Strategy
Following the existing codebase patterns:
1. Primary permission: Check for 'wiki' in user's permissions array (from User.permissions field)
2. Admin override: Users with role === 'admin' have full access
3. Author limitations: Page authors can only set their own pages to draft/review
4. Validation: Only allow valid ContentStatus values
Implementation Sequence
1. Backend: Implement updateStatus controller function
2. Backend: Add route registration
3. Frontend: Modify Wiki page component to display status
4. Frontend: Implement permission-aware status controls
5. Frontend: Add status change API integration
6. Test all status transitions with different user roles
RBAC Considerations
- Aligns with existing permission system using User.permissions array
- Consistent with how other modules (documents, knowledge) handle permissions
- Maintains security by validating permissions on every request
- Allows flexible permission assignment through existing user management
Testing Scenarios
1. Author can set own page to draft/review but not approved/rejected/archived
2. Admin can set any page to any status
3. User with 'wiki' permission can set any page to any status
4. Invalid status values are rejected
5. Unauthorized attempts return 403 Forbidden
6. Non-existent wiki pages return 404 Not Found
7. Frontend UI correctly shows/hides controls based on permissions
8. Status changes update in real-time without full page reload
This implementation follows established patterns in the codebase while providing the requested approval workflow functionality with proper RBAC controls.