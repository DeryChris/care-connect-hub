// src/routes/index.ts
// Central router — mounts all module routes

import { Router } from 'express';
import { authenticate, requireAdmin, requirePermission } from '../middleware/auth';
import * as auth from '../controllers/auth.controller';
import * as users from '../controllers/users.controller';
import * as departments from '../controllers/departments.controller';
import * as patients from '../controllers/patients.controller';
import * as appointments from '../controllers/appointments.controller';
import * as opd from '../controllers/opd.controller';
import * as ipd from '../controllers/ipd.controller';
import * as laboratory from '../controllers/laboratory.controller';
import * as radiology from '../controllers/radiology.controller';
import * as pharmacy from '../controllers/pharmacy.controller';
import * as billing from '../controllers/billing.controller';
import * as inventory from '../controllers/inventory.controller';
import * as tasks from '../controllers/tasks.controller';
import * as knowledge from '../controllers/knowledge.controller';
import * as documents from '../controllers/documents.controller';
import * as wiki from '../controllers/wiki.controller';
import * as comments from '../controllers/comments.controller';
import * as notifications from '../controllers/notifications.controller';
import * as search from '../controllers/search.controller';
import * as dashboard from '../controllers/dashboard.controller';
import * as reports from '../controllers/reports.controller';
import * as settings from '../controllers/settings.controller';
import { upload } from '../middleware/upload';

const router = Router();

// ── Health check ──────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/login', auth.login);
router.post('/auth/logout', authenticate, auth.logout);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/change-password', authenticate, auth.changePassword);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', authenticate, requireAdmin, users.list);
router.get('/users/me', authenticate, users.me);
router.get('/users/:id', authenticate, users.getOne);
router.post('/users', authenticate, requireAdmin, users.create);
router.put('/users/:id', authenticate, requireAdmin, users.update);
router.patch('/users/:id/toggle-active', authenticate, requireAdmin, users.toggleActive);
router.patch('/users/:id/permissions', authenticate, requireAdmin, users.updatePermissions);
router.delete('/users/:id', authenticate, requireAdmin, users.remove);

// ── Departments ───────────────────────────────────────────────────────────────
router.get('/departments', authenticate, departments.list);
router.get('/departments/:id', authenticate, departments.getOne);
router.post('/departments', authenticate, requireAdmin, departments.create);
router.put('/departments/:id', authenticate, requireAdmin, departments.update);
router.delete('/departments/:id', authenticate, requireAdmin, departments.remove);

// ── Patients ──────────────────────────────────────────────────────────────────
router.get('/patients', authenticate, requirePermission('registration'), patients.list);
router.get('/patients/:id', authenticate, requirePermission('registration'), patients.getOne);
router.get('/patients/:id/timeline', authenticate, requirePermission('registration'), patients.timeline);
router.post('/patients', authenticate, requirePermission('registration'), patients.create);
router.put('/patients/:id', authenticate, requirePermission('registration'), patients.update);
router.delete('/patients/:id', authenticate, requireAdmin, patients.remove);

// ── Appointments ──────────────────────────────────────────────────────────────
router.get('/appointments', authenticate, requirePermission('appointment'), appointments.list);
router.get('/appointments/:id', authenticate, requirePermission('appointment'), appointments.getOne);
router.post('/appointments', authenticate, requirePermission('appointment'), appointments.create);
router.put('/appointments/:id', authenticate, requirePermission('appointment'), appointments.update);
router.patch('/appointments/:id/status', authenticate, requirePermission('appointment'), appointments.updateStatus);
router.delete('/appointments/:id', authenticate, requireAdmin, appointments.remove);

// ── OPD ───────────────────────────────────────────────────────────────────────
router.get('/opd-visits', authenticate, requirePermission('opd'), opd.list);
router.get('/opd-visits/:id', authenticate, requirePermission('opd'), opd.getOne);
router.post('/opd-visits', authenticate, requirePermission('opd'), opd.create);
router.put('/opd-visits/:id', authenticate, requirePermission('opd'), opd.update);
router.patch('/opd-visits/:id/status', authenticate, requirePermission('opd'), opd.updateStatus);
router.patch('/opd-visits/:id/vitals', authenticate, requirePermission('opd'), opd.updateVitals);
router.delete('/opd-visits/:id', authenticate, requireAdmin, opd.remove);

// ── IPD ───────────────────────────────────────────────────────────────────────
router.get('/ipd-admissions', authenticate, requirePermission('ipd'), ipd.list);
router.get('/ipd-admissions/:id', authenticate, requirePermission('ipd'), ipd.getOne);
router.post('/ipd-admissions', authenticate, requirePermission('ipd'), ipd.create);
router.put('/ipd-admissions/:id', authenticate, requirePermission('ipd'), ipd.update);
router.post('/ipd-admissions/:id/discharge', authenticate, requirePermission('ipd'), ipd.discharge);
router.delete('/ipd-admissions/:id', authenticate, requireAdmin, ipd.remove);

// ── Laboratory ────────────────────────────────────────────────────────────────
router.get('/laboratory-tests', authenticate, requirePermission('laboratory'), laboratory.list);
router.get('/laboratory-tests/:id', authenticate, requirePermission('laboratory'), laboratory.getOne);
router.post('/laboratory-tests', authenticate, requirePermission('laboratory'), laboratory.create);
router.put('/laboratory-tests/:id', authenticate, requirePermission('laboratory'), laboratory.update);
router.patch('/laboratory-tests/:id/status', authenticate, requirePermission('laboratory'), laboratory.updateStatus);
router.patch('/laboratory-tests/:id/results', authenticate, requirePermission('laboratory'), laboratory.updateResults);
router.delete('/laboratory-tests/:id', authenticate, requireAdmin, laboratory.remove);

// ── Radiology ─────────────────────────────────────────────────────────────────
router.get('/radiology', authenticate, requirePermission('radiology'), radiology.list);
router.get('/radiology/:id', authenticate, requirePermission('radiology'), radiology.getOne);
router.post('/radiology', authenticate, requirePermission('radiology'), radiology.create);
router.put('/radiology/:id', authenticate, requirePermission('radiology'), radiology.update);
router.patch('/radiology/:id/status', authenticate, requirePermission('radiology'), radiology.updateStatus);
router.patch('/radiology/:id/report', authenticate, requirePermission('radiology'), radiology.updateReport);
router.delete('/radiology/:id', authenticate, requireAdmin, radiology.remove);

// ── Pharmacy ──────────────────────────────────────────────────────────────────
router.get('/pharmacy', authenticate, requirePermission('pharmacy'), pharmacy.list);
router.get('/pharmacy/:id', authenticate, requirePermission('pharmacy'), pharmacy.getOne);
router.post('/pharmacy', authenticate, requirePermission('pharmacy'), pharmacy.create);
router.put('/pharmacy/:id', authenticate, requirePermission('pharmacy'), pharmacy.update);
router.patch('/pharmacy/:id/stock', authenticate, requirePermission('pharmacy'), pharmacy.adjustStock);
router.delete('/pharmacy/:id', authenticate, requireAdmin, pharmacy.remove);

// ── Billing ───────────────────────────────────────────────────────────────────
router.get('/billing', authenticate, requirePermission('billing'), billing.list);
router.get('/billing/summary', authenticate, requirePermission('billing'), billing.summary);
router.get('/billing/:id', authenticate, requirePermission('billing'), billing.getOne);
router.post('/billing', authenticate, requirePermission('billing'), billing.create);
router.put('/billing/:id', authenticate, requirePermission('billing'), billing.update);
router.patch('/billing/:id/payment', authenticate, requirePermission('billing'), billing.recordPayment);
router.delete('/billing/:id', authenticate, requireAdmin, billing.remove);

// ── Inventory ─────────────────────────────────────────────────────────────────
router.get('/inventory', authenticate, requirePermission('inventory'), inventory.list);
router.get('/inventory/:id', authenticate, requirePermission('inventory'), inventory.getOne);
router.get('/inventory/:id/transactions', authenticate, requirePermission('inventory'), inventory.getTransactions);
router.post('/inventory', authenticate, requirePermission('inventory'), inventory.create);
router.put('/inventory/:id', authenticate, requirePermission('inventory'), inventory.update);
router.post('/inventory/:id/transaction', authenticate, requirePermission('inventory'), inventory.processTransaction);
router.delete('/inventory/:id', authenticate, requireAdmin, inventory.remove);

// ── Tasks ─────────────────────────────────────────────────────────────────────
router.get('/tasks', authenticate, requirePermission('tasks'), tasks.list);
router.get('/tasks/:id', authenticate, requirePermission('tasks'), tasks.getOne);
router.post('/tasks', authenticate, tasks.create);
router.put('/tasks/:id', authenticate, tasks.update);
router.patch('/tasks/:id/status', authenticate, tasks.updateStatus);
router.delete('/tasks/:id', authenticate, requireAdmin, tasks.remove);

// ── Knowledge Base ────────────────────────────────────────────────────────────
router.get('/knowledge', authenticate, knowledge.list);
router.get('/knowledge/:id', authenticate, knowledge.getOne);
router.post('/knowledge', authenticate, knowledge.create);
router.put('/knowledge/:id', authenticate, knowledge.update);
router.patch('/knowledge/:id/status', authenticate, knowledge.updateStatus);
router.delete('/knowledge/:id', authenticate, knowledge.remove);

// ── Documents ─────────────────────────────────────────────────────────────────
router.get('/documents', authenticate, documents.list);
router.get('/documents/:id', authenticate, documents.getOne);
router.get('/documents/:id/download', authenticate, documents.download);
router.post('/documents', authenticate, upload.single('file'), documents.create);
router.put('/documents/:id', authenticate, upload.single('file'), documents.update);
router.patch('/documents/:id/status', authenticate, documents.updateStatus);
router.delete('/documents/:id', authenticate, documents.remove);

// ── Wiki ──────────────────────────────────────────────────────────────────────
router.get('/wiki', authenticate, wiki.list);
router.get('/wiki/:id', authenticate, wiki.getOne);
router.post('/wiki', authenticate, wiki.create);
router.put('/wiki/:id', authenticate, wiki.update);
router.delete('/wiki/:id', authenticate, requireAdmin, wiki.remove);

// ── Comments ──────────────────────────────────────────────────────────────────
router.get('/comments', authenticate, comments.list);
router.post('/comments', authenticate, comments.create);
router.post('/comments/:id/like', authenticate, comments.toggleLike);
router.delete('/comments/:id', authenticate, comments.remove);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', authenticate, notifications.list);
router.patch('/notifications/read-all', authenticate, notifications.markAllRead);
router.patch('/notifications/:id/read', authenticate, notifications.markRead);
router.delete('/notifications/:id', authenticate, notifications.remove);

// ── Search ────────────────────────────────────────────────────────────────────
router.get('/search', authenticate, search.globalSearch);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', authenticate, dashboard.getStats);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports/overview', authenticate, requirePermission('reports'), reports.overview);
router.get('/reports/inventory', authenticate, requirePermission('reports'), reports.inventoryReport);
router.get('/reports/billing', authenticate, requirePermission('reports'), reports.billingReport);
router.get('/reports/staff', authenticate, requirePermission('reports'), reports.staffReport);

// ── Settings ──────────────────────────────────────────────────────────────────
router.get('/settings', authenticate, settings.list);
router.patch('/settings/:key', authenticate, requireAdmin, settings.update);

export default router;