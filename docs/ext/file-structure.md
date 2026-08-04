# File Tree: care-connect-hub

**Generated:** 4/19/2026, 7:20:11 PM
**Root Path:** `c:\Users\amkch\Documents\Projects\care-connect-hub`

```
├── .qodo
│   ├── agents
│   └── workflows
├── backend
│   ├── prisma
│   │   ├── migrations
│   │   │   ├── 20260317051211_init
│   │   │   │   └── migration.sql
│   │   │   ├── 20260320041225_document_content
│   │   │   │   └── migration.sql
│   │   │   ├── 20260322010344_comments_likes_notifications
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── controllers
│   │   │   ├── appointments.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── billing.controller.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── departments.controller.ts
│   │   │   ├── documents.controller.ts
│   │   │   ├── inventory.controller.ts
│   │   │   ├── ipd.controller.ts
│   │   │   ├── knowledge.controller.ts
│   │   │   ├── laboratory.controller.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── opd.controller.ts
│   │   │   ├── patients.controller.ts
│   │   │   ├── pharmacy.controller.ts
│   │   │   ├── radiology.controller.ts
│   │   │   ├── reports.controller.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── settings.controller.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   └── wiki.controller.ts
│   │   ├── lib
│   │   │   ├── prisma.ts
│   │   │   └── response.ts
│   │   ├── middleware
│   │   │   ├── auth.ts
│   │   │   ├── upload.ts
│   │   │   └── validate.ts
│   │   ├── routes
│   │   │   └── index.ts
│   │   ├── services
│   │   │   └── auth.service.ts
│   │   └── server.ts
│   ├── uploads
│   ├── .env.example
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── config
│   ├── components.json
│   ├── eslint.config.js
│   ├── playwright-fixture.ts
│   ├── playwright.config.ts
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── public
│   ├── favicon-1.ico
│   ├── favicon.png
│   ├── placeholder.svg
│   └── robots.txt
├── scripts
│   └── start.cjs
├── src
│   ├── components
│   │   ├── content
│   │   │   ├── CommentsSection.tsx
│   │   │   └── MarkdownRenderer.tsx
│   │   ├── layout
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── ui
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   ├── CommentsSection.tsx
│   │   ├── GlobalSearch-mock.tsx
│   │   ├── GlobalSearch.tsx
│   │   └── NavLink.tsx
│   ├── contexts
│   │   ├── AuthContext-mock.tsx
│   │   ├── AuthContext.tsx
│   │   ├── SettingsContext-mock.tsx
│   │   └── SettingsContext.tsx
│   ├── hooks
│   │   ├── index.ts
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAppointments.ts
│   │   ├── useBilling.ts
│   │   ├── useComments.ts
│   │   ├── useDashboard.ts
│   │   ├── useDepartments.ts
│   │   ├── useDocumentBlobUrl.ts
│   │   ├── useDocuments.ts
│   │   ├── useIPD.ts
│   │   ├── useInventory.ts
│   │   ├── useKnowledge.ts
│   │   ├── useLaboratory.ts
│   │   ├── useNotifications.ts
│   │   ├── useOPD.ts
│   │   ├── usePatients.ts
│   │   ├── usePharmacy.ts
│   │   ├── useRadiology.ts
│   │   ├── useReports.ts
│   │   ├── useSearch.ts
│   │   ├── useSettings.ts
│   │   ├── useTasks.ts
│   │   ├── useUsers.ts
│   │   └── useWiki.ts
│   ├── lib
│   │   ├── api.ts
│   │   ├── constants.ts
│   │   ├── content-workflow.ts
│   │   ├── mock-comments.ts
│   │   ├── mock-data.ts
│   │   ├── mock-knowledge.ts
│   │   ├── permissions.ts
│   │   ├── printDocument.ts
│   │   └── utils.ts
│   ├── pages
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── BillingPage.tsx
│   │   ├── CreateKnowledge.tsx
│   │   ├── Dashboard-mock.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DepartmentsPage.tsx
│   │   ├── DocumentForm.tsx
│   │   ├── DocumentViewer.tsx
│   │   ├── Documents.tsx
│   │   ├── EditKnowledge.tsx
│   │   ├── IPDPage.tsx
│   │   ├── Index.tsx
│   │   ├── InventoryForm.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── KMSDashboard.tsx
│   │   ├── KnowledgeArticle.tsx
│   │   ├── KnowledgeBase.tsx
│   │   ├── LaboratoryPage.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   ├── OPDPage.tsx
│   │   ├── PatientForm.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── PharmacyPage.tsx
│   │   ├── RadiologyPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TasksPage-mock.tsx
│   │   ├── TasksPage.tsx
│   │   ├── UserForm.tsx
│   │   ├── UsersPage.tsx
│   │   ├── Wiki-mock.tsx
│   │   └── Wiki.tsx
│   ├── services
│   │   ├── barrel.ts
│   │   └── index.ts
│   ├── test
│   │   ├── example.test.ts
│   │   └── setup.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── README.md
├── bun.lock
├── bun.lockb
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
└── tsconfig.json
```