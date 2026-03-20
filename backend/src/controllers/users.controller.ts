// src/controllers/users.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  ok, listOk, created, noContent, notFound, badRequest, serverError,
  parsePagination, paginate,
} from '../lib/response';
import { hashPassword } from '../services/auth.service';

// ── Schema for creating a new user ───────────────────────────────────────────
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user']).default('user'),
  designation: z.enum([
    'doctor', 'nurse', 'receptionist', 'lab_technician', 'radiologist',
    'pharmacist', 'accountant', 'hr_officer', 'data_entry', 'it_staff',
    'admin_staff', 'employee',
  ]),
  phone: z.string().optional().nullable(),
  // Accept empty string and coerce to null so Prisma doesn't try to look up ""
  department_id: z.string().uuid('Invalid department ID').optional().nullable()
    .or(z.literal('').transform(() => null)),
  specialization: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  fee: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nonnegative().optional().nullable(),
  ),
  permissions: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

// ── Schema for updating an existing user (all fields optional) ───────────────
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  // Password is optional on update; empty string = don't change
  password: z.string().min(8).optional().or(z.literal('').transform(() => undefined)),
  role: z.enum(['admin', 'user']).optional(),
  designation: z.enum([
    'doctor', 'nurse', 'receptionist', 'lab_technician', 'radiologist',
    'pharmacist', 'accountant', 'hr_officer', 'data_entry', 'it_staff',
    'admin_staff', 'employee',
  ]).optional(),
  phone: z.string().optional().nullable(),
  department_id: z.string().uuid('Invalid department ID').optional().nullable()
    .or(z.literal('').transform(() => null)),
  specialization: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  fee: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nonnegative().optional().nullable(),
  ),
  permissions: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

// ── List ─────────────────────────────────────────────────────────────────────
export async function list(req: Request, res: Response) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || '');
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true, name: true, email: true, role: true, designation: true,
          phone: true, is_active: true, permissions: true, department_id: true,
          specialization: true, qualification: true, fee: true, created_at: true,
          department: { select: { name: true } },
        },
      }),
    ]);

    return listOk(res, data, paginate(total, page, limit));
  } catch (err) {
    console.error('[users.list]', err);
    return serverError(res);
  }
}

// ── Me ───────────────────────────────────────────────────────────────────────
export async function me(req: Request, res: Response) {
  try {
    if (!req.user) return ok(res, null);
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, name: true, email: true, role: true, designation: true,
        phone: true, is_active: true, permissions: true, department_id: true,
        specialization: true, qualification: true, fee: true, created_at: true,
      },
    });
    if (!user) return notFound(res, 'User');
    return ok(res, user);
  } catch (err) {
    console.error('[users.me]', err);
    return serverError(res);
  }
}

// ── Get one ──────────────────────────────────────────────────────────────────
export async function getOne(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, designation: true,
        phone: true, is_active: true, permissions: true, department_id: true,
        specialization: true, qualification: true, fee: true, created_at: true,
      },
    });
    if (!user) return notFound(res, 'User');
    return ok(res, user);
  } catch (err) {
    console.error('[users.getOne]', err);
    return serverError(res);
  }
}

// ── Create ───────────────────────────────────────────────────────────────────
export async function create(req: Request, res: Response) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);

    const { password, ...data } = parsed.data;
    const password_hash = await hashPassword(password);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return badRequest(res, 'Email already in use');

    const user = await prisma.user.create({
      data: { ...data, password_hash },
      select: {
        id: true, name: true, email: true, role: true, designation: true,
        permissions: true, is_active: true, created_at: true,
      },
    });
    return created(res, user);
  } catch (err: any) {
    console.error('[users.create]', err);
    if (err?.code === 'P2002') return badRequest(res, 'Email already in use');
    return serverError(res);
  }
}

// ── Update ───────────────────────────────────────────────────────────────────
export async function update(req: Request, res: Response) {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, 'Validation failed', parsed.error.errors);
    }

    const { password, ...safeData } = parsed.data;

    // Build the prisma update payload — only include defined fields
    const updatePayload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(safeData)) {
      if (v !== undefined) updatePayload[k] = v;
    }

    // Hash new password only if provided and non-empty
    if (password && password.length >= 8) {
      updatePayload.password_hash = await hashPassword(password);
    }

    // If no fields to update, just return the current record
    if (Object.keys(updatePayload).length === 0) {
      const existing = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true, name: true, email: true, role: true, designation: true,
          permissions: true, is_active: true, created_at: true,
        },
      });
      if (!existing) return notFound(res, 'User');
      return ok(res, existing);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updatePayload,
      select: {
        id: true, name: true, email: true, role: true, designation: true,
        permissions: true, is_active: true, created_at: true,
        department_id: true, specialization: true, qualification: true, fee: true,
      },
    });
    return ok(res, user);
  } catch (err: any) {
    console.error('[users.update]', err);
    if (err?.code === 'P2025') return notFound(res, 'User');
    if (err?.code === 'P2002') return badRequest(res, 'Email already in use');
    return serverError(res);
  }
}

// ── Toggle active ────────────────────────────────────────────────────────────
export async function toggleActive(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return notFound(res, 'User');
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { is_active: !user.is_active },
      select: { id: true, name: true, is_active: true },
    });
    return ok(res, updated);
  } catch (err) {
    console.error('[users.toggleActive]', err);
    return serverError(res);
  }
}

// ── Update permissions ───────────────────────────────────────────────────────
export async function updatePermissions(req: Request, res: Response) {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) return badRequest(res, 'permissions must be an array');
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { permissions },
      select: { id: true, name: true, permissions: true },
    });
    return ok(res, updated);
  } catch (err: any) {
    console.error('[users.updatePermissions]', err);
    if (err?.code === 'P2025') return notFound(res, 'User');
    return serverError(res);
  }
}

// ── Remove (soft-delete) ─────────────────────────────────────────────────────
export async function remove(req: Request, res: Response) {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { is_active: false },
    });
    return noContent(res);
  } catch (err: any) {
    console.error('[users.remove]', err);
    if (err?.code === 'P2025') return notFound(res, 'User');
    return serverError(res);
  }
}