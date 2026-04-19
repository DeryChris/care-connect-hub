// src/services/barrel.ts
// Barrel export — import all services from '@/services'
// Each service function is defined in src/services/index.ts (the big file)
// This file just re-exports everything cleanly.

export {
  authService,
  usersService,
  departmentsService,
  patientsService,
  appointmentsService,
  opdService,
  ipdService,
  laboratoryService,
  radiologyService,
  pharmacyService,
  billingService,
  inventoryService,
  tasksService,
  knowledgeService,
  documentsService,
  wikiService,
  commentsService,
  searchService,
  dashboardService,
  reportsService,
  settingsService,
} from './index';

export type {
  WikiPage,
  ContentCommentAPI,
  SearchResult,
} from './index';
